# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.10.8] - 2025-10-31

### Adicionado (Added)

* **Links de Normas (CPCs/NBCs):** Adicionado um novo menu suspenso "Normas (CPCs) Relacionadas" abaixo da resolução de cada questão. O sistema agora cruza as `tags` da questão (ex: "Ativo Imobilizado") com um novo banco de dados (`cpcs.json`) para exibir links relevantes para as normas oficiais.
* **Suporte a Tabelas nos Enunciados:** Implementada a capacidade de renderizar tabelas formatadas dentro dos enunciados das questões.
* **Suporte a Tabelas Complexas:** O sistema agora renderiza tabelas com múltiplos níveis de cabeçalho (subcabeçalhos), processando automaticamente os atributos `colspan` e `rowspan` definidos no JSON.
* **Banco de Dados de Normas (`cpcs.json`):** Adicionado o arquivo `cpcs.json` à pasta normas do projeto. Ele contém uma lista abrangente de CPCs e seus respectivos nomes de tags para o cruzamento de dados.
* **Ferramenta de Geração (`generator.html`):** Criado um novo arquivo `generator.html` (ferramenta de desenvolvimento) para facilitar a criação de novos arquivos JSON de questões. O gerador possui uma interface gráfica para criar enunciados simples (texto) ou estruturados (com parágrafos e tabelas complexas).

### Modificado (Changed)

* **Renderização de Enunciados:** A lógica de renderização no `index.js` foi refatorada. O script agora suporta um novo campo `enunciado_blocos` no JSON para enunciados estruturados. O sistema mantém 100% de compatibilidade com o campo `enunciado` antigo, garantindo que nenhuma questão anterior seja quebrada.
* **Estilo das Tabelas (`index.css`):** As tabelas agora são totalmente responsivas. Elas rolam horizontalmente em telas pequenas (`.table-wrapper`) e são compactas (com `width` automático e `font-size` reduzido) em telas maiores.
### Corrigido (fixed)

* **Ajuste de tabelas**: Nas seguintes questões de contabilidade gerencial:
    - 39 CFC 2024/2
    - 40 CFC 2024/1
    - 37 CFC 2024/1

    Foi adicionado tabelas para melhorar a visualização das informações.

## [0.10.6] - 2025-10-29

### Adicionado (Added)
- **Filtro por Resolução:** Adicionado um novo filtro "Mostrar apenas questões com resolução comentada" na página de Questões. O botão "Limpar Filtros" foi atualizado para incluir esta nova opção.
- **Aba "Novidades":** Uma nova aba foi adicionada para exibir dinamicamente o conteúdo do arquivo `CHANGELOG.md` da raiz do projeto, facilitando a visualização do histórico de versões.
- **Rodapé Dinâmico:** O conteúdo do rodapé (ano, versão, links) agora é carregado a partir de um arquivo `footer-data.json`, simplificando futuras atualizações.
- **Autor da Resolução:** Abaixo da resolução comentada de cada questão, agora existe um menu suspenso (oculto por padrão) que revela o nome do autor da resolução, se disponível no arquivo JSON.
- **Cores por Disciplina:** Implementado um sistema de cores distintas para as disciplinas (Azul para Societária, Verde para Gerencial) nos filtros e nas tags das questões, com estrutura para fácil adição de novas cores.
- Adição de novas questões de **Contabilidade Societária**
- Adição de questões de **Contabilidade Gerencial**
- Correção de bugs relatados por usuários

### Corrigido (Fixed)
- Corrigido a questão 3 CFC 2022/2 onde faltava o valor na conta "Fornecedores" na resolução comentada 

### Modificado (Changed)
- **Refatoração de Código:** O CSS e JavaScript que estavam embutidos nos arquivos HTML foram completamente separados para arquivos externos (`.css` e `.js`), melhorando drasticamente a organização e manutenção do projeto.
- **Performance e Cache:** O projeto agora utiliza arquivos compartilhados (`css/style.css` e `js/shared.js`). Isso permite que o navegador do usuário armazene esses arquivos em cache, tornando a navegação entre as páginas "Início" e "Status" muito mais rápida.

## [0.10-2] - 2025-10-26

### Corrigido (Fixed)
- **Tooltip no Mobile:** Corrigido o bug de usabilidade onde a dica (?) do filtro "questões obsoletas" não funcionava em dispositivos móveis (touch). Agora, um toque exibe um alerta com a informação.

## [0.10-1] - 2025-10-26

### Adicionado (Added)
- **Agrupamento de Ementas:** A seção "Filtrar por Ementa" agora agrupa as tags dinamicamente sob o nome da disciplina correspondente.
- **Busca de Ementas:** Adicionado um campo de texto (`Buscar ementa específica...`) que filtra a lista de ementas em tempo real.
- **Ocultar/Exibir Ementas:** Adicionado um botão `[ Ocultar ] / [ Exibir ]` para economizar espaço na tela.

### Alterado (Changed)
- O botão "Marcar Todas (Ementas)" agora afeta apenas as ementas que estão visíveis (filtradas pela busca).

### Corrigido (Fixed)
- **Ordenação Alfabética:** Corrigido o bug onde a ordenação de texto colocava letras maiúsculas primeiro (ex: "Societária" antes de "de Custos"). Aplicado na lista de Disciplinas e nos Grupos de Ementas.
- **Perda de Estado (Ementas):** Corrigido o bug principal onde marcar/desmarcar uma *disciplina* fazia com que as *ementas* já selecionadas fossem desmarcadas.

## [0.10] - 2025-10-26
- Lançamento inicial do projeto.
