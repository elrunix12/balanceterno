# 📊 Validador de Integridade e Injetor de Gabaritos - Balanceterno

Este repositório contém o utilitário de processamento de dados (`main.py`) desenvolvido para o projeto **Balanceterno**.

Sua função é atuar como uma **camada de auditoria e validação**, cruzando os dados brutos  (arquivos `.json`) com o gabarito oficial da banca examinadora (arquivos `.txt`). Além disso, o script gera relatórios estatísticos para permitir a Avaliação Analítica da distribuição de disciplinas.

---

## 🚀 Funcionalidades

* **Conciliação Automatizada:** Cruza o ID da questão com o arquivo de gabarito externo, garantindo 100% de fidelidade à resposta oficial.
* **Injeção de Metadados (TASL):** Adiciona automaticamente o cabeçalho de licenciamento (CC-BY-SA 4.0) e atribuição correta em todos os arquivos processados.
* **Padronização de Dados:**
* Converte IDs numéricos (ex: `"01"`  `1`).
* Limpa campos de enunciado redundantes (prioriza blocos estruturados).
* Identifica questões anuladas (`X` ou `*`).


* **Relatórios Analíticos:** Gera planilhas (`.csv`) contendo a contagem de questões por disciplina para conferência com o Edital.
* **Processamento em Lote:** Processa múltiplos exames simultaneamente.

---

## 🛠️ Pré-requisitos

O script foi projetado para ser **leve e sem dependências externas complexas**.

* **Python 3.8+** (Nenhuma biblioteca externa como `pandas` ou `pdfplumber` é necessária).

Para rodar, basta usar a biblioteca padrão do Python:

```bash
python main.py

```

---

## 📂 Estrutura de Pastas

Ao executar o script pela primeira vez, ele criará a estrutura de diretórios automaticamente:

```text
/ (Raiz do Projeto)
│
├── main.py                # O script de validação
├── README.md              # Documentação
│
├── importar/              # ENTRADA DE DADOS
│   ├── CFC_2024_01.json   # Arquivo bruto (gerado pela IA)
│   └── CFC_2024_01.txt    # Gabarito oficial (digitado manualmente)
│
└── exportar/              # SAÍDA DE DADOS (Validada)
    ├── CFC_2024_01.json   # Arquivo final (pronto para o site)
    └── RELATORIO_CFC...   # Planilha de conferência (.csv)

```

---

## ⏯️ Como Usar (Fluxo de Trabalho)

### 1. Preparação

Execute o script uma vez para criar as pastas:

```bash
python main.py

```

### 2. Importação

Coloque na pasta `importar/` os pares de arquivos. Eles devem ter o **mesmo nome**:

* **O JSON:** O arquivo contendo as questões extraídas.
* **O TXT:** Um arquivo de texto simples com o gabarito oficial.

**Formato do arquivo .txt:**
Basta colocar o número da questão, um traço e a letra correta. Espaços são ignorados.

```text
1-A
2-C
3-X  (Use X ou * para Anulada)
4-D
...

```

### 3. Execução e Relatórios

Rode o script novamente. Ele processará os arquivos e perguntará ao final:

```text
? Deseja gerar o relatório de disciplinas para Excel? (s/n):

```

* Digite `s` para gerar o arquivo `.csv` na pasta `exportar`.
* Use este relatório para comparar a quantidade de questões extraídas com a quantidade prevista no Edital (Avaliação Analítica).

---

## 📝 Detalhes da Validação

O script realiza as seguintes alterações nos dados para garantir a integridade:

| Campo | Ação do Script |
| --- | --- |
| `id` | Força conversão para **Inteiro** (remove zeros à esquerda e aspas). |
| `gabarito` | Substitui qualquer valor anterior pelo valor do **TXT oficial**. |
| `gabarito_texto` | Busca automaticamente o texto correspondente dentro da lista de `opcoes`. |
| `anulada` | Marca como `true` automaticamente se o gabarito for `X` ou `*`. |
| `resolucao` | Preenche com string vazia `""` se o campo estiver ausente (evita erros no frontend). |
| `enunciado` | Remove o campo de texto simples se houver `enunciado_blocos` (otimização). |

---

## ⚖️ Licença

Este utilitário é distribuído sob a licença **AGPL-3.0**.
Por padrão, os dados processados por ele (conteúdo das questões) são atribuídos sob a licença **CC-BY-SA 4.0**. Você pode alterar as licenças dos arquivos gerados por você.