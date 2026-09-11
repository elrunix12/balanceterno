# Repositório do Artigo

#### Versão em inglês [README.md](README.md)

## Seja Bem-vindo

Esse repositório foi criado para armazenar os testes do artigo "Accounting education: An educational artifact based on open technologies for preparation for the Sufficiency Examination".


## Cálculo da média de reprovação

[...] "the average failure rate was 73.79% in relation to the candidates present, with 2023 delivering the worst result, at 82.65%".

Você pode encontrar o cálculo da média de reprovação, abordada no tópico 2.1 do trecho acima, [neste arquivo](<testes-artefato/docs/Cálculo aprovação no Exame.xlsx>).

## Versões do site

A versão 0.21 citada no artigo da Plataforma Online está disponível na pasta [testes-artefato/versions](testes-artefato/versions).

## Prompts

- O prompt utilizado para Extração e Classificação das questões pode ser encontrado em [Prompt Extração e Classificação.md](<testes-artefato/docs/Prompts/Prompt Extração e Classificação.md>).

- O prompt utilizado para a Persona Contábil pode ser acessado em [Persona Contábil](<testes-artefato/docs/Prompts/Persona Contábil.md>).

- A pasta [testes-artefato/Google AI Studio](<testes-artefato/Google AI Studio>) contém a saída do Gemini e sua parametrização na [Persona](<testes-artefato/Google AI Studio/Persona>) e na [etapa 3 - Transformação dos Dados](<testes-artefato/Google AI Studio/Transformação dos dados>).

## Script de sanitização presente no Artefato 1

- Versão 0.21: Essa versão possui a API do Google relatado no tópico 4.1 Projeção e Desenvolvimento do Artefato. Acesse [aqui](testes-artefato/versions/0.21/etl/main.py). Verifique o [manual](testes-artefato/versions/0.21/etl/README.md).

- Versão 0.35: A última versão do script de sanitização de tags pode ser encontrado [aqui](etl/main.py). Verifique o [manual](etl/README.md).

## Resultados da Avaliação do Artefato

### Artefato 1

- O arquivo [relatório_geral](<testes-artefato/docs/Avaliação do Artefato/Artefato 1/relatorio_geral_comparativo.csv>) refere-se ao arquivo "Quantidade de questões extraídas e oficiais por disciplina". Este é uma das saídas do Artefato 1 e representa a quantidade de questões no relatório estatístico oficial e as que foram extraídas. Importante notar que as edições 2024/2 e 2025/2 foram inseridas manualmente no arquivo [avaliação analítica](<testes-artefato/docs/Avaliação do Artefato/Artefato 1/avaliação analítica.xlsx>), pois os dados foram divulgados após o relatório geral estar pronto.

- Tabela 5 Índices de aderência da Classificação Temática do Artefato 1 e a diferença  em relação aos dados oficiais do CFC (2022-2025): É possível acessar a planilha com os cálculos em [avaliação analítica](<testes-artefato/docs/Avaliação do Artefato/Artefato 1/avaliação analítica.xlsx>).

- Para a saída do *Script* Python, o [anexo_auditoria_etl](<testes-artefato/docs/Avaliação do Artefato/Artefato 1/anexo_auditoria_etl.txt>).

- Para o calcular Kappa, cheque o script [kappa.R](<testes-artefato/docs/Avaliação do Artefato/Artefato 1/kappa.R>). O arquivo [disciplinas.csv](<testes-artefato/docs/Avaliação do Artefato/Artefato 1/disciplinas.csv>) é responsável por listar as questões em ordem e qual eixo temático ela pertence. 

    > Obs.: Classificação remapeada se refere a junção de Contabilidade Geral e Princípios de Contabilidade e Normas Brasileiras de Contabilidade.

### Artefato 2

- Para o teste funcional, acesse [Teste Funcional](<testes-artefato/docs/Avaliação do Artefato/Artefato 2/Teste Funcional.pdf>).

- Para o módulo simulado, acesse a pasta [Simulado](<testes-artefato/docs/Avaliação do Artefato/Artefato 2/Simulado>).

# Capturas de tela do site na versão 0.35

### Ponto de interação inicial

![home](src/home.png)

### Rodapé informando a licença

![rodapé](src/rodapé.png)

### Resultado da aplicação de filtros

![filtros](src/filtros.png)

### Resolução comentada

![resolucao](src/resolucao.png)

### Lançamentos Contábeis

![lancamentos](src/lancamentos.png)

### Modo Simulado

![simulado](src/simulado.png)

# Protótipo

![prototipo](src/prototipo.png)

