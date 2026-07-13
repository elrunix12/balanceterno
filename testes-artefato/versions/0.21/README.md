# ⚖️ Anonymous Author - Plataforma de Estudos (CFC)

> **Projeto de Código Aberto** focado na democratização do estudo para o Exame de Suficiência do Conselho Federal de Contabilidade (CFC).

O Anonymous Author centraliza provas antigas, organiza por disciplina e oferece ferramentas interativas de estudo, tudo alimentado por um sistema de automação com Inteligência Artificial.

**[🌐 Acessar o Site Online (GitHub Pages)](https://Anonymous Author.github.io/Anonymous Author/)**

---

## ✨ Funcionalidades

### 🎓 Para o Estudante
* **Banco de Questões Unificado:** Questões de diversas disciplinas (Contabilidade Geral, Custos, Auditoria, etc.).
* **Filtros Inteligentes:** Filtre por disciplina, ano, banca ou busque por palavras-chave (ex: "Depreciação").
* **Modo Estudo:** Resolução comentada e visualização de gabarito instantânea.
* **Lançamentos Contábeis Visuais:** Visualize os razonetes (Débito e Crédito) em um modal dedicado para entender a mecânica da questão.
* **Status das Questões:** Identificação automática de questões anuladas ou obsoletas (lei antiga).

### ⚙️ Engenharia e Automação (ETL)
* **Pipeline ETL com IA:** Script em Python (`etl/`) que lê PDFs de provas, usa o **Google Gemini** para extrair/classificar questões e gera JSONs estruturados.
* **Integridade de Dados:** Validação de gabarito via cruzamento de dados manuais.
* **Ferramentas de Backoffice:** Gerador manual de JSON (`tools/`) para criação de tabelas complexas e edição fina.

---

## 📂 Estrutura do Repositório (Monorepo)

O projeto está dividido em módulos para facilitar a manutenção:

| Pasta | Descrição |
| :--- | :--- |
| **`/` (Raiz)** | **Frontend (Site):** HTML, CSS e JS puro. É o que o usuário final acessa. |
| **`/disciplinas`** | **Banco de Dados:** Arquivos JSON contendo as questões já processadas. |
| **`/etl`** | **Automação (Python):** Scripts de extração de PDF e integração com IA. [Leia a documentação técnica aqui](etl/README.md). |
| **`/tools`** | **Ferramentas:** Utilitários para edição manual de questões (Gerador JSON). |

---

## 🚀 Como Rodar o Site Localmente

Se você quer apenas testar o site ou estudar offline:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Anonymous Author/Anonymous Author.git
    cd Anonymous Author
    ```

2.  **Inicie um Servidor Local:**
    Devido às políticas de segurança dos navegadores (CORS), o site não consegue ler os arquivos JSON se você apenas clicar no `index.html`. Use o **VS Code**:
    * Instale a extensão **Live Server**.
    * Clique com o botão direito no arquivo `index.html`.
    * Selecione **"Open with Live Server"**.

---

## 🛠️ Alimentando o Banco de Questões

Existem duas formas de adicionar novas provas ao projeto:

### Opção A: Via Automação (Recomendado) 🤖
Utilize nosso script Python para processar provas inteiras em minutos.
1. Vá para a pasta de automação: `cd etl`
2. Siga as instruções do **[README do ETL](etl/README.md)** para configurar sua chave de API e rodar o script.

### Opção B: Via Gerador Manual ✍️
Para criar questões avulsas ou ajustar tabelas complexas:
1. Abra o arquivo `tools/generator.html` no seu navegador.
2. Preencha os campos (Enunciado, Opções, Lançamentos).
3. Copie o JSON gerado e cole no arquivo da disciplina correspondente em `/disciplinas`.

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas!

* **Conteúdo:** Encontrou um erro ou quer enviar uma resolução? Use nosso [Formulário de Contribuição](https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAYAAF_bnDZUODNHWlVVRFNBNlgwUDlXTUU1VEQ2MEJNRS4u).
* **Código:** Quer melhorar o CSS, JS ou o script Python?
    1. Faça um Fork do projeto.
    2. Crie uma Branch (`git checkout -b feature/nova-funcionalidade`).
    3. Abra um Pull Request.

---

## 📄 Licença

Este projeto é distribuído sob a **Licença AGPL-3.0**.
Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

*Projeto independente mantido pela comunidade. Sem afiliação oficial com o CFC ou bancas examinadoras.*
