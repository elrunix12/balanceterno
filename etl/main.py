# Balanceterno - Plataforma de Estudos para o Exame de Suficiência
# Copyright (C) 2025  elrunix12 (Balanceterno)
#
# Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
# sob os termos da GNU Affero General Public License, versão 3 (AGPLv3),
# conforme publicada pela Free Software Foundation.
#
# Este programa é distribuído na esperança de que seja útil,
# mas SEM NENHUMA GARANTIA; sem mesmo a garantia implícita de
# COMERCIALIZAÇÃO ou ADEQUAÇÃO A UM DETERMINADO PROPÓSITO.
#
# Veja o arquivo LICENSE para mais detalhes.

import os
import json
import glob
import re
import math
from pathlib import Path
import google.generativeai as genai
from pypdf import PdfReader
from dotenv import load_dotenv

# --- CONFIGURAÇÕES ---
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use o modelo que você tiver acesso
model = genai.GenerativeModel("gemini-2.5-flash")

BASE_DIR = Path(__file__).parent
DIR_TAGS = BASE_DIR / "tags"
DIR_EXAME = BASE_DIR / "importar" / "exame"
DIR_GABARITO = BASE_DIR / "importar" / "gabarito"
DIR_EXPORTAR = BASE_DIR / "exportar"
DIR_EXPORTAR.mkdir(exist_ok=True)

# --- FUNÇÕES AUXILIARES ---

def extrair_metadados_nome_arquivo(nome_arquivo):
    """
    Tenta adivinhar Ano e Edição pelo nome do arquivo.
    Ex esperado: cfc_2025_01.pdf -> Ano: 2025, Exame: CFC 2025/1
    """
    match = re.search(r"(\d{4})_(\d{2})", nome_arquivo)
    if match:
        ano = int(match.group(1))
        edicao = int(match.group(2))
        return ano, f"CFC {ano}/{edicao}"
    return 2025, "CFC Indefinido" # Fallback

def carregar_gabarito_txt(caminho_txt):
    """Lê o arquivo TXT manual e retorna um dict {'1': 'A', '2': 'B'}"""
    gabarito = {}
    if not caminho_txt.exists():
        return {}
    
    print(f"📖 Lendo gabarito manual: {caminho_txt.name}")
    with open(caminho_txt, 'r', encoding='utf-8') as f:
        for linha in f:
            # Aceita formatos "1-A", "1:A", "1 A"
            partes = re.split(r'[-:\s]+', linha.strip())
            if len(partes) >= 2:
                numero = partes[0]
                letra = partes[1].upper()
                gabarito[str(numero)] = letra
    return gabarito

def carregar_tags():
    tags_map = {}
    for arq in glob.glob(str(DIR_TAGS / "*.json")):
        nome = Path(arq).name
        with open(arq, 'r', encoding='utf-8') as f:
            tags_map[nome] = json.load(f)
    return tags_map

def dividir_pdf_em_chunks(caminho_pdf, paginas_por_chunk=6):
    """
    Divide o texto do PDF em partes menores para a IA não pular questões.
    Retorna uma lista de strings (textos).
    """
    reader = PdfReader(caminho_pdf)
    total_paginas = len(reader.pages)
    chunks = []
    
    texto_acumulado = ""
    for i, page in enumerate(reader.pages):
        texto_acumulado += page.extract_text() + "\n"
        
        # Se atingiu o limite ou é a última página, fecha o chunk
        if (i + 1) % paginas_por_chunk == 0 or (i + 1) == total_paginas:
            chunks.append(texto_acumulado)
            texto_acumulado = "" # Limpa para o próximo
            
    return chunks

def criar_prompt(texto_chunk, disciplinas_map, ano_detectado, exame_detectado):
    return f"""
    CONTEXTO:
    Você é um assistente que extrai questões de provas do CFC.
    
    METADADOS OBRIGATÓRIOS PARA TODAS AS QUESTÕES DESTE LOTE:
    - "ano": {ano_detectado}
    - "exame": "{exame_detectado}"
    - "banca": "FGV" (ou Consulplan, verifique no texto)

    SUA TAREFA:
    Extraia TODAS as questões encontradas no texto abaixo. Não pule nenhuma.
    Para cada questão, identifique a disciplina baseando-se nas tags fornecidas.
    
    LISTA DE DISCIPLINAS (TAGS):
    {json.dumps(disciplinas_map, ensure_ascii=False)}

    FORMATO JSON DE SAÍDA (Lista):
    [
      {{
        "id": "numero_da_questao_no_texto",
        "ano": {ano_detectado},
        "exame": "{exame_detectado}",
        "banca": "FGV",
        "arquivo_destino": "nome_do_json_da_disciplina",
        "tags": ["Nome Da Disciplina", "Outra Tag"],
        "enunciado": "Texto completo...",
        "opcoes": [
          {{"letra": "A", "texto": "..."}},
          {{"letra": "B", "texto": "..."}}
        ]
      }}
    ]

    ATENÇÃO:
    - Retorne APENAS o JSON.
    - Se uma questão estiver cortada pela metade (início ou fim), tente reconstruir ou ignore se estiver ilegível.
    
    --- TEXTO DA PROVA (PARTE) ---
    {texto_chunk}
    """

def salvar_questoes_com_deduplicacao(novas_questoes, gabarito_map):
    print(f"\n💾 Processando {len(novas_questoes)} questões extraídas...")
    
    questoes_por_arquivo = {}

    for q in novas_questoes:
        # 1. Injeta o Gabarito Manual
        num_q = str(q.get("id"))
        resp = gabarito_map.get(num_q) # Pega a letra do arquivo TXT (Ex: "C")
        
        # --- LÓGICA DO ASTERISCO E ANULAÇÃO ---
        is_anulada = False
        gabarito_letra = "?"

        if resp:
            resp_limpa = resp.strip().upper()
            if resp_limpa in ["*", "X", "ANULADA"]:
                is_anulada = True
                gabarito_letra = "X"
            else:
                is_anulada = False
                gabarito_letra = resp_limpa
        
        # Aplica a letra e o booleano
        q["gabarito"] = gabarito_letra
        q["anulada"] = is_anulada
        
        # --- CORREÇÃO AQUI: BUSCA O TEXTO DA OPÇÃO ---
        if is_anulada:
            q["gabarito_texto"] = "Questão Anulada pela Banca."
        else:
            # Procura dentro das opções qual tem a letra igual ao gabarito
            texto_encontrado = "Texto não encontrado."
            
            # Garante que 'opcoes' existe e é uma lista
            lista_opcoes = q.get("opcoes", [])
            
            for opcao in lista_opcoes:
                letra_opcao = str(opcao.get("letra", "")).strip().upper()
                if letra_opcao == gabarito_letra:
                    texto_encontrado = opcao.get("texto", "")
                    break # Achou, para de procurar
            
            q["gabarito_texto"] = texto_encontrado
        # ---------------------------------------------

        # Campos default (Preenchimento futuro manual)
        q.setdefault("resolucao", "")
        q.setdefault("autor_resolucao", "")
        q.setdefault("obsoleta", False)
        
        # --- NOVO: Garante a lista vazia para os lançamentos ---
        q.setdefault("lancamentos", []) 
        # -------------------------------------------------------

        # 2. Organiza por arquivo (mesma lógica)
        arquivo_dest = q.get("arquivo_destino", "sem-classificacao.json")
        if "arquivo_destino" in q: del q["arquivo_destino"]
        
        if arquivo_dest not in questoes_por_arquivo:
            questoes_por_arquivo[arquivo_dest] = []
        questoes_por_arquivo[arquivo_dest].append(q)

    # 3. Salva verificando duplicidade (mesma lógica)
    for arquivo, lista_q in questoes_por_arquivo.items():
        path_json = DIR_EXPORTAR / arquivo
        conteudo_atual = []
        
        if path_json.exists():
            with open(path_json, 'r', encoding='utf-8') as f:
                try: conteudo_atual = json.load(f)
                except: conteudo_atual = []

        ids_existentes = {str(item['id']) + str(item['exame']) for item in conteudo_atual}
        
        adicionados_count = 0
        for nova_q in lista_q:
            chave_unica = str(nova_q['id']) + str(nova_q['exame'])
            
            if chave_unica not in ids_existentes:
                conteudo_atual.append(nova_q)
                ids_existentes.add(chave_unica)
                adicionados_count += 1

        try:
            conteudo_atual.sort(key=lambda x: int(x['id']) if str(x['id']).isdigit() else 999)
        except: pass

        with open(path_json, 'w', encoding='utf-8') as f:
            json.dump(conteudo_atual, f, ensure_ascii=False, indent=2)
        
        if adicionados_count > 0:
            print(f"   -> {arquivo}: +{adicionados_count} questões novas.")

def main():
    tags = carregar_tags()
    pdfs = list(DIR_EXAME.glob("*.pdf"))

    for pdf in pdfs:
        print(f"\n🚀 PROCESSANDO: {pdf.name}")
        
        # 1. Metadados do nome
        ano, exame_nome = extrair_metadados_nome_arquivo(pdf.name)
        print(f"   -> Detectado: {exame_nome}")

        # 2. Carregar Gabarito Manual
        txt_gabarito = DIR_GABARITO / f"{pdf.stem}.txt"
        gabarito_map = carregar_gabarito_txt(txt_gabarito)

        # 3. Dividir PDF em partes (Chunking) para não perder questões
        chunks = dividir_pdf_em_chunks(pdf, paginas_por_chunk=5) # 5 páginas por vez é seguro
        print(f"   -> Dividido em {len(chunks)} partes para análise.")

        todas_questoes_do_pdf = []

        for i, chunk in enumerate(chunks):
            print(f"   ⏳ Analisando parte {i+1}/{len(chunks)}...")
            prompt = criar_prompt(chunk, tags, ano, exame_nome)
            
            try:
                # Retry simples caso dê erro de cota
                response = model.generate_content(prompt)
                texto_limpo = response.text.replace("```json", "").replace("```", "")
                
                lote_questoes = json.loads(texto_limpo)
                todas_questoes_do_pdf.extend(lote_questoes)
                print(f"      ✅ Parte {i+1}: encontrou {len(lote_questoes)} questões.")
                
            except Exception as e:
                print(f"      ❌ Erro na parte {i+1}: {e}")

        # 4. Salvar tudo de uma vez
        salvar_questoes_com_deduplicacao(todas_questoes_do_pdf, gabarito_map)

if __name__ == "__main__":
    main()