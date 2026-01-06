# 🛠️ Manual do Gerador de Questões (Backoffice)

Este manual descreve como utilizar o **Gerador de JSON (`generator.html`)**, uma ferramenta visual desenvolvida para facilitar a criação e edição manual de questões para o banco de dados do Balanceterno.

> **Para que serve?**
>
>   * Criar questões inéditas que não estão nos PDFs.
>   * Corrigir questões complexas (com tabelas quebradas) que a IA não processou perfeitamente.
>   * Evitar erros de sintaxe (vírgulas, aspas) comuns ao editar JSON manualmente.

-----

## 🚀 Como Abrir

A ferramenta é um arquivo HTML estático. Não precisa de instalação.

1.  Navegue até a pasta `tools/`.
2.  Dê um duplo clique no arquivo **`generator.html`**.
3.  Ele abrirá no seu navegador padrão (Chrome, Firefox, Edge).

-----

## 📝 Guia de Preenchimento

A interface é dividida em blocos lógicos. Siga a ordem abaixo:

### 1\. Metadados (Cabeçalho)

Informações para indexação e filtros.

  * **ID:** Deve ser um número **único** dentro do arquivo de destino.
      * *Dica:* Antes de criar, olhe o último ID no arquivo `disciplinas/tal.json` e some +1.
  * **Ano:** O ano da prova (ex: `2024`).
  * **Exame:** Nome padronizado (ex: `CFC 2024/1`).
  * **Banca:** Geralmente `FGV` ou `Consulplan`.
  * **disciplina:** Nome da disciplina
  * **Tags:** Palavras-chave para o filtro de ementa.
      * Separe por vírgula. *Ex: `DRE, Estoques, CPC 16`*.

### 2\. Conteúdo da Questão

  * **Enunciado:** O texto principal da pergunta.
      * *Atenção:* Se a questão tiver **Tabelas**, você pode colar o código HTML da tabela aqui. O sistema renderiza automaticamente.
  * **Opções (A, B, C, D):** Preencha o texto de cada alternativa.
  * **Gabarito:** Selecione a letra correta no menu suspenso.

### 3\. Resolução e Lançamentos (Opcional)

Esta é a parte que enriquece o estudo:

  * **Resolução Comentada:** Explicação textual do porquê a alternativa está correta.
  * **Lançamentos Contábeis:**
      * Clique em "Adicionar Lançamento" para criar partidas dobradas.
      * Preencha: **Conta** (ex: Caixa), **Valor** (ex: 1.000) e **Tipo** (D ou C).
      * Isso gerará o botão "Ver Lançamentos" no site.

### 4\. Rodapé

  * **Anulada / Obsoleta:** Marque essas caixas se a questão foi anulada pela banca ou se baseia em lei antiga.

-----

## 💾 Salvando a Questão

1.  Após preencher tudo, clique no botão verde **"Gerar JSON"** no final da página.
2.  Uma caixa de texto aparecerá com o código formatado.
3.  Clique em **"Copiar para a Área de Transferência"**.

### Onde Colar?

1.  Vá para a pasta `disciplinas/` no seu editor de código (VS Code).
2.  Abra o arquivo da matéria correspondente (ex: `contabilidade-geral.json`).
3.  Role até o final do arquivo.
4.  **Cuidado:** Certifique-se de que há uma vírgula `,` após o último item (fechamento da chave `}`).
5.  Cole o novo bloco de código antes do colchete final `]`.

-----

## 💡 Exemplo de Estrutura Gerada

O gerador entregará algo assim:

```json
{
  "id": 501,
  "ano": 2025,
  "exame": "Simulado",
  "banca": "Própria",
  "tags": ["Estudo de Caso"],
  "enunciado": "Qual a natureza da conta Caixa?",
  "opcoes": [
    { "letra": "A", "texto": "Devedora" },
    { "letra": "B", "texto": "Credora" }
  ],
  "gabarito": "A",
  "gabarito_texto": "Devedora",
  "resolucao": "Ativos têm natureza devedora.",
  "lancamentos": [],
  "anulada": false,
  "obsoleta": false
}
```

-----

*Ferramenta interna do Projeto Balanceterno.*