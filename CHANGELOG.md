# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.10.5-27] - 2025-10-28

### Adicionado (Added)
- **Filtro por Resolução:** Adicionado um novo filtro "Mostrar apenas questões com resolução comentada" na página de Questões. O botão "Limpar Filtros" foi atualizado para incluir esta nova opção.
- **Aba "Novidades":** Uma nova aba foi adicionada para exibir dinamicamente o conteúdo do arquivo `CHANGELOG.md` da raiz do projeto, facilitando a visualização do histórico de versões.
- **Rodapé Dinâmico:** O conteúdo do rodapé (ano, versão, links) agora é carregado a partir de um arquivo `footer-data.json`, simplificando futuras atualizações.
- **Autor da Resolução:** Abaixo da resolução comentada de cada questão, agora existe um menu suspenso (oculto por padrão) que revela o nome do autor da resolução, se disponível no arquivo JSON.
- **Cores por Disciplina:** Implementado um sistema de cores distintas para as disciplinas (Azul para Societária, Verde para Gerencial) nos filtros e nas tags das questões, com estrutura para fácil adição de novas cores.

### Modificado (Changed)
- **Refatoração de Código:** O CSS e JavaScript que estavam embutidos nos arquivos HTML foram completamente separados para arquivos externos (`.css` e `.js`), melhorando drasticamente a organização e manutenção do projeto.
- **Performance e Cache:** O projeto agora utiliza arquivos compartilhados (`css/style.css` e `js/shared.js`). Isso permite que o navegador do usuário armazene esses arquivos em cache, tornando a navegação entre as páginas "Início" e "Status" muito mais rápida.

## [0.10-3] - 2025-10-28

## Adicionado (Added)
- Adição de novas questões de Contabilidade Societária
- Adição de questões de Contabilidade Gerencial
- Correção de bugs relatados por usuários

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
