# Balanceterno - Questões do Exame de Suficiência de Contabilidade

Um projeto de código aberto para centralizar e facilitar o estudo para o Exame de Suficiência Contábil (CFC), focado inicialmente em Contabilidade Societária e expandindo para outras áreas.

**[Link para o site no GitHub Pages]** ## ✨ Funcionalidades

* Banco de questões separadas por disciplina (arquivos JSON).
* Filtros cumulativos por:
    * Disciplina(s)
    * Subtópico/Ementa (dinâmico, baseado nas disciplinas selecionadas)
    * Ano/Exame
    * Palavra-chave (busca no enunciado, opções e resolução)
* Opção para ocultar questões marcadas como obsoletas.
* Modo de estudo interativo: Clique na opção para ver se acertou e exibir o gabarito/resolução.
* Botões "Marcar/Desmarcar Todas" para filtros de Disciplina e Subtópico.
* Interface limpa e responsiva.

## 🚀 Como Rodar Localmente

1.  Clone este repositório: `git clone https://github.com/elrunix12/balanceterno.git`
2.  Navegue até a pasta do projeto: `cd balanceterno`
3.  **Importante:** Você precisa de um servidor web local para que o carregamento dos arquivos `.json` funcione. A forma mais fácil é usar a extensão **Live Server** no VS Code:
    * Instale a extensão "Live Server".
    * Clique com o botão direito no arquivo `index.html`.
    * Selecione "Open with Live Server".

## 🛠️ Usando Seu Próprio Banco de Questões (JSON)

Você pode facilmente adaptar este site para carregar suas próprias questões. Siga estes passos:

1.  **Crie seus Arquivos JSON:**
    * Organize suas questões em um ou mais arquivos `.json`.
    * **Estrutura Obrigatória:** Cada questão *dentro* do JSON **deve** ser um objeto com os seguintes campos:
        * `id`: Um número ou string única *dentro daquele arquivo*.
        * `ano`: O ano do exame (número).
        * `exame`: O nome completo do exame (string, ex: "CFC 2024/1").
        * `banca`: A banca examinadora (string, ex: "FGV").
        * `tags`: Um *array* de strings contendo os subtópicos/ementas (ex: `["Ativo Imobilizado", "Depreciação"]`). Mesmo que seja um só, use array.
        * `enunciado`: O texto da questão (string).
        * `opcoes`: Um *array* de objetos, onde cada objeto tem `letra` (string, ex: "A") e `texto` (string).
        * `gabarito`: A letra correta (string, ex: "B").
        * `gabarito_texto`: O texto completo da opção correta (string).
        * `resolucao`: O texto da resolução comentada (string, pode ser vazia `""`).
        * `obsoleta`: `true` ou `false` (booleano).
    * Coloque esses arquivos `.json` na mesma pasta que o `index.html`.
    * Consulte o arquivo contabilidade-societária para obter um exemplo de estrutura.

2.  **Modifique o `index.html`:**
    * Abra o arquivo `index.html` em um editor de texto.
    * Encontre a seção `<script>` no final do arquivo.

      ```script
      const configDisciplinas = {
            "Contabilidade Societária": {
                arquivo: 'contabilidade-societaria.json', // O arquivo que você forneceu
                questoes: [],
                allTags: new Set()
            },
      ];
      ```

    * Abaixo dessa linha, você terá exemplos de como adicionar suas questões.


3.  **Execute:** Rode o `index.html` usando o Live Server (ou suba para seu GitHub Pages) e o site carregará as questões dos seus arquivos.

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Você pode ajudar de várias formas:

* **Reportando Erros (Bugs):** Abra uma [Issue](https://github.com/elrunix12/balanceterno/issues).
* **Sugerindo Melhorias:** Abra uma [Issue](https://github.com/elrunix12/balanceterno/issues).
* **Adicionando Questões:** Siga o formato JSON descrito acima e crie um [Pull Request](https://github.com/elrunix12/balanceterno/pulls).
* **Melhorando o Código:** Crie um [Pull Request](https://github.com/elrunix12/balanceterno/pulls).

Por favor, leia nossos [Termos de Uso](link/para/termos-de-uso.html) antes de contribuir com conteúdo.

## 📄 Licença

Este projeto é distribuído sob a **Licença AGPL-3.0**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

*Projeto independente criado por elrunix12 e otimizado com o auxílo de IA. Sem afiliação com o CFC.*
