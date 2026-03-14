
# ⚖️ Balanceterno - Plataforma de Estudos Contábeis

> **Democratizando o acesso ao conhecimento contábil com tecnologia aberta.**

O **Balanceterno** é uma plataforma projetada para centralizar, organizar e facilitar o estudo para o Exame de Suficiência do CFC.


🔗 **[Acesse a versão online aqui](https://elrunix12.github.io/balanceterno/)**

-----

## ✨ Funcionalidades

### 🎓 Para o Estudante (Frontend)

  * **Banco de Questões Unificado:** Questões organizadas por disciplina, ano e banca (FGV/Consulplan).
  * **Filtros Cumulativos:** Combine filtros para estudos específicos (ex: "Contabilidade de Custos" + "2024").
  * **Busca Semântica:** Pesquise termos em enunciados, opções ou resoluções.
  * **Renderização Avançada:** Suporte nativo a **Tabelas Contábeis** complexas no enunciado.
  * **Módulo de Lançamentos:** Visualizador interativo de partidas dobradas (Débito e Crédito) para entender a mecânica contábil.
  * **Modo Foco:** Oculte automaticamente questões anuladas ou baseadas em legislação obsoleta.
  * **Modo Simulado:** Simule como seria uma prova real, ou treine rapidamente com uma amostra aleatória de 16 questões.

-----

## 📂 Estrutura do Repositório (Monorepo)

O projeto é modular para facilitar a manutenção e a contribuição:

| Pasta | Descrição |
| :--- | :--- |
| **`/` (Raiz)** | **Frontend:** O site em si (`index.html`, `js/`, `css/`). HTML5 e JS Puro. |
| **`/exames`** | **Data Lake:** Arquivos JSON contendo o banco de questões já processado e pronto para uso. |
| **`/etl`** | **Automação de inserção de gabarito:** Scripts Python para mineração de dados. [Leia a documentação técnica aqui](/etl/README.md). |
| **`/tools`** | **Backoffice:** Ferramentas utilitárias, como o Gerador Manual de JSON para curadoria fina. |

-----

## 🚀 Como Rodar Localmente

### 1\. Clonar o Repositório

```bash
git clone https://github.com/elrunix12/balanceterno.git
cd balanceterno
```

### 2\. Rodar o Site (Frontend)

Devido às políticas de segurança dos navegadores (CORS), o site não consegue ler os arquivos JSON se aberto diretamente. Você precisa de um servidor HTTP simples.

  * **Via VS Code (Recomendado):** Instale a extensão **Live Server**, clique com o botão direito no `index.html` e escolha "Open with Live Server".
  * **Via Python:** Rode `python -m http.server` e acesse `localhost:8000`.

-----

## 🛠️ Alimentando o Banco de Dados

O Balanceterno possui uma ferramenta de ingestão de dados:

Ideal para criar questões inéditas ou ajustar tabelas muito complexas. Para checar o manual acesse [man-generator](tools/man-generator.md)

1.  Abra o arquivo `tools/generator.html` no seu navegador, ou acesse [Gerador de questões](https://elrunix12.github.io/balanceterno/tools/generator.html)
2.  Utilize a interface visual para preencher Enunciado, Opções e Lançamentos.
3.  O sistema gera o JSON validado.
4.  Edite o arquivo `etl/ementas.json` caso você precise alterar disciplinas ou as *tags*.

Dica: Você pode usar uma LLM de sua preferência para classificar e extrair para o formato .json e inserir o gabarito com nosso script em python (Leia a documentação [aqui](/etl/README.md)). O prompt está disponível [aqui](/etl/prompt_ia.md).

-----

## 🧩 Schema dos Dados (JSON)

Para garantir a interoperabilidade, todas as questões geradas pelo sistema seguem estritamente este formato:

```json
{
  "id": 47,
  "ano": 2025,
  "exame": "CFC 2025/1",
  "banca": "FGV",
  "disciplina": "Auditoria",
  "tags": ["Auditoria", "NBC TA 620"],
  "enunciado": "Uma empresa de auditoria independente... <table class='enunciado-table'>...</table>",
  "opcoes": [
    { "letra": "A", "texto": "O auditor tem sua responsabilidade..." },
    { "letra": "B", "texto": "O auditor é o único responsável..." }
  ],
  "gabarito": "B",
  "gabarito_texto": "O auditor é o único responsável por expressar opinião...",
  "resolucao": "A norma NBC TA 620 define que...",
  "autor_resolucao": "Prof. Contabilidade",
  "obsoleta": false,
  "anulada": false,
  "lancamentos": []
}
```

-----

## 🤝 Como Contribuir

Este é um projeto comunitário\!

  * **Conteúdo:** Encontrou um erro ou quer enviar uma resolução? Use nosso [Formulário de Contribuição](https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAYAAF_bnDZUODNHWlVVRFNBNlgwUDlXTUU1VEQ2MEJNRS4u).

-----

## 📄 Licença

Este projeto é distribuído sob a **Licença GNU AGPLv3**. O Conteúdo (resoluções, lançamentos contábeis, comentários, explicações, compilações e a organização dos dados) é licenciado sob CC BY-SA 4.0.
Isso garante que o Balanceterno (e qualquer derivado dele) permaneça livre e aberto para sempre. Veja o arquivo [LICENSE](LICENSE) para mais detalhes da licença de software. Veja [LICENSE_CONTENT](LICENSE_CONTENT) para a licença de conteúdo.

-----

*Desenvolvido inicialmente por [elrunix12] e otimizado com o auxílo de IA. Sem afiliação com o CFC.*
