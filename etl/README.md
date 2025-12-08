# ⚙️ Balanceterno ETL - Automação de Questões

Este módulo contém os scripts em Python responsáveis por alimentar o banco de dados do **Balanceterno**. O sistema utiliza Inteligência Artificial (Google Gemini API) para ler PDFs de provas do CFC, classificar disciplinas e estruturar os dados em JSON.

---

## 📂 Estrutura do Módulo

```text
etl/
├── .env                 # Sua chave de API (Crie este arquivo)
├── main.py              # Script principal de automação
├── tags/                # Definições das disciplinas (Palavras-chave)
├── importar/            # ARQUIVOS DE ENTRADA
│   ├── exame/           # Coloque os PDFs aqui (ex: cfc_2025_01.pdf)
│   └── gabarito/        # Coloque os TXTs aqui (ex: cfc_2025_01.txt)
└── exportar/            # ARQUIVOS DE SAÍDA (JSONs gerados)
````

-----

## 🛠️ Instalação e Configuração

1.  **Pré-requisitos:**

      - Python 3.12+
      - Conta no Google AI Studio (para obter a API Key)

2.  **Instalação das Dependências:**
    Navegue até esta pasta e instale os pacotes:

    ```bash
    pip install google-generativeai pypdf python-dotenv
    ```

3.  **Configuração da Chave:**
    Crie um arquivo chamado `.env` dentro da pasta `etl/` e adicione sua chave:

    ```env
    GEMINI_API_KEY=Sua_Chave_Aqui
    ```

4.  **Configuração do Modelo (Opcional):**
    No arquivo `main.py`, você pode alterar a versão do modelo Gemini (ex: `gemini-2.5-flash`, `gemini-2.5-pro`) dependendo da disponibilidade da sua chave.

-----

## 🚀 Como Importar uma Nova Prova

### 1\. Preparação dos Arquivos

O nome dos arquivos é crucial para a detecção automática do ano e edição.

  * **PDF da Prova:** Coloque em `importar/exame/`.

      * *Padrão:* `cfc_ANO_EDICAO.pdf` (Ex: `cfc_2025_01.pdf`).

  * **Gabarito Manual:** Coloque em `importar/gabarito/`.

      * *Nome:* Exatamente igual ao do PDF (`cfc_2025_01.txt`).
      * *Conteúdo:* Lista simples linha a linha.
      * *Anuladas:* Use `*`, `X` ou `ANULADA`.

    **Exemplo de Gabarito (`cfc_2025_01.txt`):**

    ```text
    1-A
    2-B
    3-*
    4-ANULADA
    ```

### 2\. Executando o Script

No terminal, dentro da pasta `etl/`:

```bash
python main.py
```

**O que o script faz:**

1.  Lê o PDF em fatias (chunks) para garantir a leitura completa.
2.  Classifica as questões nas disciplinas corretas baseando-se nos arquivos da pasta `tags/`.
3.  Cruza com o gabarito manual.
      * *Nota:* Se o gabarito for `*` ou `X`, o script define automaticamente `anulada: true` e padroniza o texto.
4.  Gera/Atualiza os arquivos JSON na pasta `exportar/`.

> **Deduplicação:** O script verifica se a questão já existe no arquivo de destino (por ID e Exame) para evitar duplicatas.

-----

## 📝 Campos do JSON e Curadoria

O script gera uma estrutura padronizada. Alguns campos são preenchidos pela IA, outros são criados vazios para preenchimento manual posterior (Curadoria).

```json
{
  "id": 10,
  "ano": 2025,
  "exame": "CFC 2025/1",
  "enunciado": "Texto extraído pela IA...",
  "gabarito": "A",
  "anulada": false,
  
  // Campos para Edição Manual (Backoffice):
  "resolucao": "",          // Texto explicativo da resolução
  "autor_resolucao": "",    // Nome do autor
  "lancamentos": []         // Lista de lançamentos contábeis (ativa botão no site)
}
```

### Sobre o campo `lancamentos`:

Ele é gerado automaticamente como uma lista vazia `[]`. O site só exibirá o botão "Lançamentos Contábeis" se você preencher este campo manualmente no JSON.

-----

## 🏷️ Adicionando Novas Disciplinas

Para a IA reconhecer uma nova matéria (ex: Direito Tributário):

1.  Crie o arquivo `tags/direito-tributario.json`.
2.  Adicione palavras-chave relevantes: `["CTN", "Tributos", "Impostos"]`.
3.  Na próxima execução, o script criará automaticamente o arquivo `exportar/direito-tributario.json`.