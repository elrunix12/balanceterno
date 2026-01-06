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
    """
    Lê um arquivo de texto simples onde cada linha é 'Numero - Letra'.
    """
    gabarito = {}
    print(f"   [LENDO] Buscando gabarito em: {arquivo_txt.name}")
    
    try:
        with open(arquivo_txt, 'r', encoding='utf-8') as f:
            for linha in f:
                linha = linha.strip()
                if not linha: continue
                
                if '-' in linha:
                    partes = linha.split('-')
                    numero_str = partes[0].strip()
                    letra = partes[1].strip().upper()
                    
                    if numero_str.isdigit():
                        gabarito[int(numero_str)] = letra
    except Exception as e:
        print(f"   [ERRO] Não foi possível ler o TXT: {e}")
    
    return gabarito

def gerar_relatorio_csv(nome_arquivo, estatisticas):
    """
    Cria um arquivo CSV (Excel) com a contagem das disciplinas.
    """
    caminho_csv = PASTA_EXPORTAR / f"RELATORIO_{nome_arquivo}.csv"
    
    try:
        with open(caminho_csv, 'w', newline='', encoding='utf-8-sig') as f:
            escritor = csv.writer(f, delimiter=';')
            escritor.writerow(['Disciplina', 'Qtd Encontrada no JSON', 'Qtd no Edital (Preencher)'])
            
            for disciplina, qtd in estatisticas.items():
                escritor.writerow([disciplina, qtd, ''])
                
        print(f"   [RELATÓRIO] Arquivo de métricas gerado: {caminho_csv.name}")
    except Exception as e:
        print(f"   [ERRO] Falha ao criar relatório CSV: {e}")

# Agora a função recebe as escolhas globais como argumento
def processar_arquivo(caminho_json, gerar_csv, inserir_licenca):
    print(f"\n> INICIANDO ARQUIVO: {caminho_json.name}")
    
    caminho_txt = caminho_json.with_suffix(".txt")
    if not caminho_txt.exists():
        print(f"   [ALERTA] Arquivo de gabarito não encontrado: {caminho_txt.name}")
        return

    gabarito_map = ler_gabarito_manual(caminho_txt)
    
    try:
        with open(caminho_json, 'r', encoding='utf-8') as f:
            dados_questoes = json.load(f)
    except Exception as e:
        print(f"   [ERRO CRÍTICO] O JSON está quebrado ou inválido: {e}")
        return

    questoes_finais = []
    
    # --- APLICAR LICENÇA (Se solicitado) ---
    if inserir_licenca:
        questoes_finais.append(CABECALHO_LICENCA)
    
    contador_disciplinas = Counter()
    questoes_processadas = 0

    for item in dados_questoes:
        if item.get('tipo') == 'metadados_licenca': continue

        # --- LIMPEZA BÁSICA ---
        if 'id' in item:
            try:
                item['id'] = int(item['id'])
            except: pass
        
        # --- INSERÇÃO DE GABARITO ---
        id_q = item.get('id')
        
        if id_q in gabarito_map:
            letra_correta = gabarito_map[id_q]
            
            item['gabarito'] = letra_correta
            item['anulada'] = (letra_correta == 'X' or letra_correta == '*')
            
            item['gabarito_texto'] = ""
            if 'opcoes' in item and not item['anulada']:
                for opcao in item['opcoes']:
                    if opcao.get('letra') == letra_correta:
                        item['gabarito_texto'] = opcao.get('texto')
                        break
            
            # Campos obrigatórios
            if 'resolucao' not in item: item['resolucao'] = ""
            if 'autor_resolucao' not in item: item['autor_resolucao'] = ""
            if 'lancamentos' not in item: item['lancamentos'] = []
            
            disc = item.get('disciplina', 'Sem Disciplina')
            contador_disciplinas[disc] += 1
            
            questoes_finais.append(item)
            questoes_processadas += 1

    # Salva JSON
    caminho_saida = PASTA_EXPORTAR / caminho_json.name
    with open(caminho_saida, 'w', encoding='utf-8') as f:
        json.dump(questoes_finais, f, ensure_ascii=False, indent=2)
        
    print(f"   [SUCESSO] {questoes_processadas} questões processadas e salvas.")

    # --- GERAR CSV (Se solicitado globalmente) ---
    if gerar_csv:
        gerar_relatorio_csv(caminho_json.stem, contador_disciplinas)

def main():
    print("=== SCRIPT BALANCETERNO (v3.2 - Global) ===")
    
    if not PASTA_IMPORTAR.exists():
        PASTA_IMPORTAR.mkdir()
        print("Criando pasta 'importar'...")
    if not PASTA_EXPORTAR.exists():
        PASTA_EXPORTAR.mkdir()
        print("Criando pasta 'exportar'...")

    lista_arquivos = list(PASTA_IMPORTAR.glob("*.json"))
    
    if not lista_arquivos:
        print("Nenhum arquivo .json encontrado na pasta 'importar'.")
        return

    # --- PERGUNTAS GLOBAIS (Feitas uma única vez) ---
    resp_licenca = input("1. Deseja INSERIR O CABEÇALHO DE LICENÇA em todos os arquivos? (s/n): ").lower()
    opcao_licenca = (resp_licenca == 's')

    resp_csv = input("2. Deseja GERAR RELATÓRIOS CSV (Excel) para todos os arquivos? (s/n): ").lower()
    opcao_csv = (resp_csv == 's')

    print("\nIniciando processamento em lote...")
    print("-" * 40)

    for arquivo in lista_arquivos:
        # Passamos as escolhas do usuário para cada arquivo
        processar_arquivo(arquivo, gerar_csv=opcao_csv, inserir_licenca=opcao_licenca)
        print("-" * 30)

    print("\nProcessamento concluído. Pressione ENTER para sair.")
    input()

if __name__ == "__main__":
    main()