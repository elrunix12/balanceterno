# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.21] - 2025-12-01

### Adicionado (Added)
* **Pipeline ETL Automatizado:** Implementado um módulo completo de automação na pasta `etl/` (em Python) para leitura de PDFs de provas antigas utilizando Inteligência Artificial (Google Gemini). Isso acelera drasticamente a inserção de novas questões.
* **Arquitetura Monorepo:** Reestruturação total do projeto para separar o Frontend (site estático) da Automação (ETL), facilitando a manutenção e a colaboração.
* **Modal de Lançamentos Contábeis:** Nova funcionalidade visual exclusiva para contabilidade. Agora é possível clicar em um botão "Lançamentos Contábeis" na resposta para ver uma janela com os lançamentos (Débito e Crédito) alinhados e formatados, facilitando o entendimento da mecânica contábil.
* **Ferramenta de Backoffice Atualizada:** O `tools/generator.html` foi atualizado para suportar a criação visual de lançamentos contábeis (com adição dinâmica de débitos/créditos) e o novo campo de anulação manual.
* **Padronização de Anuladas:** O script de importação agora identifica e padroniza automaticamente questões anuladas com base no gabarito, garantindo consistência visual em todo o site.
* **Adição de questões:** Agora o projeto conta com todas as questões do Exame CFC 2025/1.

### Alterado (Changed)
* **Documentação (README):** O `README.md` principal foi reescrito para refletir a nova arquitetura híbrida (Site + Automação) e incluir instruções para quem deseja contribuir com código ou conteúdo.
- **Comportamento do Filtro de Ementas:** A lista de tópicos (ementas) agora permanece **oculta por padrão** ao selecionar disciplinas ou utilizar a função "Marcar Todas". O usuário deve clicar manualmente em `[ Exibir ]` para visualizar as opções, prevenindo a poluição visual excessiva na interface quando muitas disciplinas são selecionadas simultaneamente.
* **Documentação (README):** O `README.md` principal foi reescrito para refletir a nova arquitetura híbrida (Site + Automação) e incluir instruções para quem deseja contribuir com código ou conteúdo.
* **Refatoração Estrutural:** A pasta `tags` foi **movida** da raiz do projeto para dentro de `etl/tags`.

### Corrigido (Fixed)
* **Correção de pequenos bugs:** Incluindo tabelas, formatação e erros ortográficos.

## [0.20] - 2025-11-11

### Adicionado (Added)
* **Expansão de Disciplinas:** O projeto foi expandido de 2 para 15 disciplinas. As novas disciplinas adicionadas são:
    * Contabilidade Geral e Teoria
    * Língua Portuguesa
    * Matemática e Estatística
    * Elaborações das Demonstrações Contábeis
    * Legislação e Ética Profissional
    * Noções de Direito e Legislação Aplicada
    * Contabilidade de Custos
    * Análise das demonstrações Contábeis
    * Contabilidade Pública
    * Auditoria Contábil
    * Controladoria
    * Perícia Contábil
    * Contabilidade Tributária
* **Padronização de Ementas:** Definidas todas as ementas (tags) base para todas as disciplinas. Elas estão disponíveis na pasta `tags` e servirão como padrão para a catalogação de novas questões.
* **Performance (Lazy Loading):** Implementado *lazy loading* (scroll infinito) para o container de questões. O site agora carrega apenas as 20 primeiras questões filtradas e carrega as demais sob demanda, conforme o usuário rola a página, resultando em um ganho massivo de performance.
* **Tag de Status:** Adicionada a tag "Questão Anulada". Ela é lida do JSON (campo `anulada: true`) e renderizada no cabeçalho do card, com estilo próprio (vermelho).
* **Paleta de Cores Completa:** O `index.css` agora tem uma paleta de cores única e acessível para todas as 15 disciplinas.
* **Adição de questões:** Agora o projeto conta com todas as questões do Exame CFC 2025/2.

### Alterado (Changed)
* **Migração de Questões:** Iniciado o processo de recatalogação de questões para as novas disciplinas. Questões que estavam em `Contabilidade Societária` por falta de uma categoria específica foram migradas. Por exemplo:
    * A questão `44 CFC 2025/2` (sobre DFC pública) foi migrada de `Contabilidade Societária` para `Contabilidade Pública`.
    * A questão `47 CFC 2025/2` (sobre evidência de auditoria) foi migrada de `Contabilidade Societária` para `Auditoria Contábil`.
* **Lógica de Renderização:** A função `renderizarQuestoes` foi refatorada para apenas filtrar/ordenar a lista. A renderização do HTML foi movida para a nova função `renderizarLoteDeQuestoes`, que processa a exibição em lotes.
* **Lógica de Eventos (Quiz):** Otimizada a função `adicionarEventosQuiz` para usar `data-listener-added`, garantindo que os *event listeners* de clique sejam adicionados apenas uma vez em cada card, mesmo com o *lazy loading*.
* **Paleta de Cores (Acessibilidade):** Cores de disciplinas alteradas para ficarem em um padrão mais acessível.

### Corrigido (Fixed)
* **Ordenação "Mais Recentes":** Corrigido o bug crítico na lógica de `sort` que fazia com que exames (ex: 2025/1) aparecessem antes de exames mais novos (ex: 2025/2) ao ordenar por "Mais Recentes".
* **Botão "Marcar Todas":** Corrigido um bug de UX onde o botão "Marcar Todas (Disciplinas)" não atualizava seu texto para "Desmarcar Todas" se o usuário clicasse em todos os checkboxes individualmente.
* **Duplicação de edição de exames:** Corrigido o bug em que aparece duas datas de um mesmo exame (ex.: CFC 2024/1 e 2024/1).

### Removido (Removed)
* **Código Redundante:** Removido um *listener* `DOMContentLoaded` duplicado de dentro do `index.js`, simplificando a inicialização do script.

## [0.10.8] - 2025-11-03

### Adicionado (Added)

* **Links de Normas (CPCs/NBCs):** Adicionado um novo menu suspenso "Normas (CPCs) Relacionadas" abaixo da resolução de cada questão. O sistema agora cruza as `tags` da questão (ex: "Ativo Imobilizado") com um novo banco de dados (`cpcs.json`) para exibir links relevantes para as normas oficiais.
* **Suporte a Tabelas nos Enunciados:** Implementada a capacidade de renderizar tabelas formatadas dentro dos enunciados das questões.
* **Suporte a Tabelas Complexas:** O sistema agora renderiza tabelas com múltiplos níveis de cabeçalho (subcabeçalhos), processando automaticamente os atributos `colspan` e `rowspan` definidos no JSON.
* **Banco de Dados de Normas (`cpcs.json`):** Adicionado o arquivo `cpcs.json` à pasta normas do projeto. Ele contém uma lista abrangente de CPCs e seus respectivos nomes de tags para o cruzamento de dados.
* **Ferramenta de Geração (`generator.html`):** Criado um novo arquivo `generator.html` (ferramenta de desenvolvimento) para facilitar a criação de novos arquivos JSON de questões. O gerador possui uma interface gráfica para criar enunciados simples (texto) ou estruturados (com parágrafos e tabelas complexas).
* Exibição das ementas (tags de conteúdo) diretamente nos cards das questões, ao lado da tag de disciplina. Isso fornece contexto imediato sobre o tópico da questão.
* Novo estilo `.ementa-tag` em `index.css` para um visual minimalista e compacto das novas tags.
* A lista de contribuidores na aba "Sobre" agora suporta links externos opcionais (ex: Lattes, LinkedIn, GitHub) para dar mais crédito aos contribuidores.

### Modificado (Changed)

* **Renderização de Enunciados:** A lógica de renderização no `index.js` foi refatorada. O script agora suporta um novo campo `enunciado_blocos` no JSON para enunciados estruturados. O sistema mantém 100% de compatibilidade com o campo `enunciado` antigo, garantindo que nenhuma questão anterior seja quebrada.
* **Estilo das Tabelas (`index.css`):** As tabelas agora são totalmente responsivas. Elas rolam horizontalmente em telas pequenas (`.table-wrapper`) e são compactas (com `width` automático e `font-size` reduzido) em telas maiores.
* **Ajuste de tabelas**: Nas seguintes questões de contabilidade gerencial:
    - 39 CFC 2024/2
    - 40 CFC 2024/1
    - 37 CFC 2024/1

    Foi adicionado tabelas para melhorar a visualização das informações.
* O container `.questao-disciplina-container` (em `index.css`) foi refatorado para usar `flexbox` (`display: flex`, `flex-wrap: wrap`), permitindo que as tags de disciplina e ementa se alinhem e quebrem a linha corretamente em telas pequenas.
* A função `renderizarQuestoes` (em `index.js`) agora também gera e injeta o HTML para as `ementa-tag`.
* **Refatoração:** A lista de contribuidores foi movida de HTML estático para um arquivo `contributors.json` dedicado. Ela agora é carregada dinamicamente, seguindo o mesmo padrão do rodapé e das questões.
* **Documentação:** Atualizada a "Política de Privacidade" (`tab-privacidade`) e os "Termos de Uso" (`tab-termos`) para incluir o consentimento explícito para a coleta e exibição opcional desses novos links de contribuidores.

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
