# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
