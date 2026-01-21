# Parte do projeto Balanceterno © 2025 elrunix12
# Licenciado sob AGPLv3 – veja LICENSE

import json
import csv
from pathlib import Path
from collections import Counter

# --- CONFIGURAÇÕES ---
PASTA_ATUAL = Path(__file__).parent
PASTA_IMPORTAR = PASTA_ATUAL / "importar"
PASTA_EXPORTAR = PASTA_ATUAL / "exportar"

# Arquivos na raiz (ao lado do main.py) ou na pasta importar
ARQUIVO_OFICIAL_NOME = "oficial.csv"
ARQUIVO_EMENTA_NOME = "ementa.json"

# Cabeçalho de licença
CABECALHO_LICENCA = {
    "tipo": "metadados_licenca",
    "titulo": "Banco de Questões Comentadas - Balanceterno",
    "autor": "Comunidade do Balanceterno",
    "fonte": "https://github.com/elrunix12/Balanceterno", 
    "licenca": "Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)",
    "licenca_url": "https://creativecommons.org/licenses/by-sa/4.0/legalcode.txt",
    "aviso_legal": "As questões de exames e concursos públicos são de acesso público e pertencem às suas respectivas bancas organizadoras (como CFC, FGV, Consulplan, entre outras), não sendo de propriedade deste projeto. Este projeto utiliza tais questões exclusivamente para fins educacionais. As resoluções, lançamentos contábeis, comentários, explicações, compilações e a organização dos dados constituem criações originais da Comunidade do Balanceterno e são disponibilizadas sob a licença Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)."
}

def ler_gabarito_manual(arquivo_txt):
    """Lê arquivo TXT de gabarito."""
    gabarito = {}
    print(f"   [LENDO] Buscando gabarito em: {arquivo_txt.name}")
    try:
        with open(arquivo_txt, 'r', encoding='utf-8') as f:
            for linha in f:
                linha = linha.strip()
                if not linha: continue
                if '-' in linha:
                    partes = linha.split('-')
                    if partes[0].strip().isdigit():
                        gabarito[int(partes[0].strip())] = partes[1].strip().upper()
    except Exception as e:
        print(f"   [ERRO] Não foi possível ler o TXT: {e}")
    return gabarito

def carregar_tags_validas():
    """Carrega a ementa oficial da raiz e retorna um SET com tags permitidas."""
    caminho_ementa = PASTA_ATUAL / ARQUIVO_EMENTA_NOME
    tags_validas = set()

    if not caminho_ementa.exists():
        print(f"\n   [AVISO] '{ARQUIVO_EMENTA_NOME}' não encontrado na raiz. A sanitização será PULADA.")
        return None

    print(f"\n   [EMENTA] Carregando tags válidas de '{caminho_ementa.name}'...")
    try:
        with open(caminho_ementa, 'r', encoding='utf-8') as f:
            dados = json.load(f)
            for lista_tags in dados.values():
                tags_validas.update(lista_tags)
        print(f"   [EMENTA] {len(tags_validas)} tags únicas carregadas.")
        return tags_validas
    except Exception as e:
        print(f"   [ERRO] Falha ao ler ementa: {e}")
        return None

def carregar_dados_oficiais():
    """Lê o CSV oficial e carrega na memória."""
    caminho_oficial = PASTA_IMPORTAR / ARQUIVO_OFICIAL_NOME
    if not caminho_oficial.exists():
        caminho_oficial = PASTA_ATUAL / ARQUIVO_OFICIAL_NOME
    
    dados_oficiais = {}

    if not caminho_oficial.exists():
        print(f"\n   [AVISO] '{ARQUIVO_OFICIAL_NOME}' não encontrado. Coluna Oficial ficará vazia.")
        return {}

    print(f"\n   [IMPORTANDO] Lendo dados oficiais de '{caminho_oficial.name}'...")
    try:
        with open(caminho_oficial, 'r', encoding='utf-8-sig') as f:
            leitor = csv.reader(f, delimiter=';')
            cabecalho = next(leitor, None)
            if not cabecalho: return {}

            indices_edicoes = {}
            for i, coluna in enumerate(cabecalho):
                if i == 0: continue
                nome_limpo = coluna.strip()
                indices_edicoes[i] = nome_limpo
                dados_oficiais[nome_limpo] = {}

            for linha in leitor:
                if not linha: continue
                disciplina = linha[0].strip()
                for i, valor in enumerate(linha):
                    if i in indices_edicoes and valor.strip():
                        edicao = indices_edicoes[i]
                        dados_oficiais[edicao][disciplina] = valor.strip()
        return dados_oficiais
    except Exception as e:
        print(f"   [ERRO] Falha ao ler CSV oficial: {e}")
        return {}

def salvar_relatorio_matricial(lista_dados_completos, dados_oficiais_map):
    """Gera o CSV matriz comparando Extraído (JSON) vs Oficial (CSV)."""
    if not lista_dados_completos: return

    caminho_csv = PASTA_EXPORTAR / "relatorio_geral_comparativo.csv"
    
    lista_dados_completos.sort(key=lambda x: x[0]) 
    nomes_arquivos = [dado[0] for dado in lista_dados_completos]

    todas_disciplinas = set()
    mapa_dados_json = {} 

    for nome, stats in lista_dados_completos:
        mapa_dados_json[nome] = stats
        todas_disciplinas.update(stats.keys())
    
    for edicao_chave in dados_oficiais_map:
        todas_disciplinas.update(dados_oficiais_map[edicao_chave].keys())

    disciplinas_ordenadas = sorted(list(todas_disciplinas), key=str.lower)

    try:
        with open(caminho_csv, 'w', newline='', encoding='utf-8-sig') as f:
            escritor = csv.writer(f, delimiter=';')
            
            linha_titulos = ["Disciplina"]
            for nome in nomes_arquivos:
                linha_titulos.append(nome)
                linha_titulos.append("") 
            escritor.writerow(linha_titulos)

            linha_subtitulos = [""]
            for _ in nomes_arquivos:
                linha_subtitulos.append("Extraída")
                linha_subtitulos.append("Oficial")
            escritor.writerow(linha_subtitulos)

            for disciplina in disciplinas_ordenadas:
                linha = [disciplina]
                for nome_arquivo in nomes_arquivos:
                    qtd_extraida = mapa_dados_json.get(nome_arquivo, {}).get(disciplina, 0)
                    dados_da_edicao = dados_oficiais_map.get(nome_arquivo)
                    
                    if not dados_da_edicao:
                        nome_sem_prefixo = nome_arquivo.replace("CFC_", "")
                        dados_da_edicao = dados_oficiais_map.get(nome_sem_prefixo, {})

                    qtd_oficial = dados_da_edicao.get(disciplina, "")
                    
                    if qtd_oficial == "" and dados_da_edicao:
                        for k, v in dados_da_edicao.items():
                            if k.lower() == disciplina.lower():
                                qtd_oficial = v
                                break

                    linha.append(qtd_extraida)
                    linha.append(qtd_oficial)
                
                escritor.writerow(linha)

        print(f"\n   [RELATÓRIO] Arquivo comparativo gerado: {caminho_csv.name}")
    except Exception as e:
        print(f"   [ERRO] Falha ao criar relatório: {e}")

def processar_arquivo(caminho_json, inserir_licenca, tags_validas_set=None):
    """Processa o JSON: insere gabarito e sanitiza tags."""
    print(f"\n> INICIANDO ARQUIVO: {caminho_json.name}")
    caminho_txt = caminho_json.with_suffix(".txt")
    
    if not caminho_txt.exists():
        print(f"   [ALERTA] Gabarito ausente: {caminho_txt.name}")
        return None

    gabarito_map = ler_gabarito_manual(caminho_txt)
    
    try:
        with open(caminho_json, 'r', encoding='utf-8') as f:
            dados_questoes = json.load(f)
    except:
        return None

    questoes_finais = []
    if inserir_licenca: questoes_finais.append(CABECALHO_LICENCA)
    
    contador = Counter()
    count_tags_removidas = 0

    for item in dados_questoes:
        if item.get('tipo') == 'metadados_licenca': continue
        
        if 'id' in item: 
            try: item['id'] = int(item['id'])
            except: pass
            
        id_q = item.get('id')
        disc_atual = item.get('disciplina', 'Sem Disciplina').strip()
        
        # --- LÓGICA DE SANITIZAÇÃO COM LOG DETALHADO ---
        if tags_validas_set is not None and 'tags' in item:
            tags_originais = item.get('tags', [])
            tags_limpas = []
            tags_removidas_nesta_questao = []

            # Verifica cada tag individualmente
            for t in tags_originais:
                if t in tags_validas_set:
                    tags_limpas.append(t)
                else:
                    tags_removidas_nesta_questao.append(t)
            
            # Se houve remoção, imprime o detalhe na hora
            if tags_removidas_nesta_questao:
                print(f"   [CORREÇÃO] Q{id_q} ({disc_atual}): Removida(s) {tags_removidas_nesta_questao}")
                count_tags_removidas += len(tags_removidas_nesta_questao)
            
            item['tags'] = tags_limpas
        # -----------------------------------------------

        if id_q in gabarito_map:
            letra = gabarito_map[id_q]
            item['gabarito'] = letra
            item['anulada'] = (letra in ['X', '*'])
            
            item['gabarito_texto'] = ""
            if 'opcoes' in item and not item['anulada']:
                for op in item['opcoes']:
                    if op.get('letra') == letra:
                        item['gabarito_texto'] = op.get('texto'); break
            
            if 'resolucao' not in item: item['resolucao'] = ""
            if 'autor_resolucao' not in item: item['autor_resolucao'] = ""
            if 'lancamentos' not in item: item['lancamentos'] = []
            
            contador[disc_atual] += 1
            
            questoes_finais.append(item)

    if count_tags_removidas > 0:
        print(f"   [LIMPEZA] Total de {count_tags_removidas} tags inválidas removidas neste arquivo.")

    caminho_saida = PASTA_EXPORTAR / caminho_json.name
    with open(caminho_saida, 'w', encoding='utf-8') as f:
        json.dump(questoes_finais, f, ensure_ascii=False, indent=2)
        
    return contador

def main():
    print("=== SCRIPT BALANCETERNO ===")
    
    if not PASTA_IMPORTAR.exists(): PASTA_IMPORTAR.mkdir()
    if not PASTA_EXPORTAR.exists(): PASTA_EXPORTAR.mkdir()

    lista_arquivos = list(PASTA_IMPORTAR.glob("*.json"))
    if not lista_arquivos:
        print("Nenhum arquivo .json encontrado em 'importar'.")
        return

    dados_oficiais = carregar_dados_oficiais()
    tags_validas = carregar_tags_validas()

    resp_licenca = input("1. Inserir licença? (s/n): ").lower() == 's'
    resp_csv = input("2. Gerar Relatório Comparativo? (s/n): ").lower() == 's'

    print("-" * 40)
    dados_para_relatorio = []

    for arquivo in lista_arquivos:
        estatisticas = processar_arquivo(arquivo, inserir_licenca=resp_licenca, tags_validas_set=tags_validas)
        if estatisticas and resp_csv:
            dados_para_relatorio.append((arquivo.stem, estatisticas))

    if resp_csv and dados_para_relatorio:
        salvar_relatorio_matricial(dados_para_relatorio, dados_oficiais)

    print("\nConcluído. Pressione ENTER para sair.")
    input()

if __name__ == "__main__":
    main()