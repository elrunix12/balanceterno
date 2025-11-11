/*
 ____               _                   _   _    _____   ______   _______   ______   _____    _   _    ____  
|  _ \      /\     | |          /\     | \ | |  / ____| |  ____| |__   __| |  ____| |  __ \  | \ | |  / __ \ 
| |_) |    /  \    | |         /  \    |  \| | | |      | |__       | |    | |__    | |__) | |  \| | | |  | |
|  _ <    / /\ \   | |        / /\ \   | . ` | | |      |  __|      | |    |  __|   |  _  /  | . ` | | |  | |
| |_) |  / ____ \  | |____   / ____ \  | |\  | | |____  | |____     | |    | |____  | | \ \  | |\  | | |__| |
|____/  /_/    \_\ |______| /_/    \_\ |_| \_|  \_____| |______|    |_|    |______| |_|  \_\ |_| \_|  \____/ 
                                                                                             
/*
 * Balanceterno - Plataforma de Estudos para o Exame de Suficiência
 * Copyright (C) 2025  elrunix12 (Balanceterno)
 *
 * Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da GNU Affero General Public License, versão 3 (AGPLv3),
 * conforme publicada pela Free Software Foundation.
 *
 * Este programa é distribuído na esperança de que seja útil,
 * mas SEM NENHUMA GARANTIA; sem mesmo a garantia implícita de
 * COMERCIALIZAÇÃO ou ADEQUAÇÃO A UM DETERMINADO PROPÓSITO.
 *
 * Veja o arquivo LICENSE para mais detalhes.
 */

// -------------------------------------------------------------------
//   Configuração Global de Disciplinas e Variáveis
// -------------------------------------------------------------------

/**
 * Configuração central das disciplinas.
 * - 'arquivo': Caminho para o JSON da disciplina.
 * - 'questoes': Array (inicialmente vazio) que armazenará as questões carregadas.
 * - 'allTags': Set (inicialmente vazio) que armazenará todas as ementas (tags) da disciplina.
 * - 'className': Classe CSS usada para estilizar os cards e filtros da disciplina.
 */
const configDisciplinas = {
    "Contabilidade Societária": {
        arquivo: 'disciplinas/contabilidade-societaria.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-societaria'
    },
    "Contabilidade Gerencial": {
        arquivo: 'disciplinas/contabilidade-gerencial.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-gerencial'
    },
    "Contabilidade Geral e Teoria": {
        arquivo: 'disciplinas/contabilidade-geral.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-geral'
    },
    "Língua Portuguesa": {
        arquivo: 'disciplinas/lingua-portuguesa.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-portugues'
    },
    "Matemática e Estatística": {
        arquivo: 'disciplinas/mat-financeira-estatistica.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-exatas'
    },
    "Elaborações das Demonstrações Contábeis": {
        arquivo: 'disciplinas/elaboracoes-dc.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-elaboracoes-dc'
    },
    "Legislação e Ética Profissional": {
        arquivo: 'disciplinas/etica.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-etica'
    },
    "Noções de Direito e Legislação Aplicada": {
        arquivo: 'disciplinas/direito.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-direito'
    },
    "Contabilidade de Custos": {
        arquivo: 'disciplinas/contabilidade-custos.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-custos'
    },
    "Análise das demonstrações Contábeis": {
        arquivo: 'disciplinas/analise-dc.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-analise-dc'
    },
    "Contabilidade Pública": {
        arquivo: 'disciplinas/contabilidade-publica.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-publica'
    },
    "Auditoria Contábil": {
        arquivo: 'disciplinas/auditoria.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-auditoria'
    },
    "Controladoria": {
        arquivo: 'disciplinas/controladoria.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-controladoria'
    },
    "Perícia Contábil": {
        arquivo: 'disciplinas/pericia.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-pericia'
    },
    "Contabilidade Tributária": {
        arquivo: 'disciplinas/cont-tributaria.json',
        questoes: [],
        allTags: new Set(),
        className: 'disciplina-tributaria'
    },
};

// Referências aos elementos do HTML
const disciplinaCheckContainer = document.getElementById('disciplina-checkbox-container');
const checkContainer = document.getElementById('checkbox-container'); // Ementas
const questoesContainer = document.getElementById('questoes-container');
const infoSpan = document.getElementById('filter-info');
const btnClear = document.getElementById('btn-clear-filters');
const exameCheckContainer = document.getElementById('exame-checkbox-container');
const sortAnoDropdown = document.getElementById('sort-ano');
const searchInput = document.getElementById('search-input');
const initialPrompt = document.getElementById('initial-prompt');
const btnCheckAllDisciplinas = document.getElementById('btn-check-all-disciplinas');
const btnCheckAllEmentas = document.getElementById('btn-check-all-ementas');
const contributorsListContainer = document.getElementById('contributors-list');
let cpcData = {};

// Variáveis para o Lazy Loading (Scroll Infinito)
let observer = null;
let listaCompletaFiltrada = [];
let indiceAtual = 0;
const TAMANHO_LOTE = 20; // Quantas questões carregar por vez

// Cria a "sentinela" que vamos observar no final da página
const sentinela = document.createElement('div');
sentinela.id = 'sentinela-lazy-load';


// -------------------------------------------------------------------
//   LÓGICA DA PÁGINA (Inicialização e Funções)
// -------------------------------------------------------------------

/**
 * Ponto de entrada principal.
 * Aguarda o HTML ser carregado para iniciar a lógica da aplicação.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DAS TABS (com load-on-demand) ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    let changelogCarregado = false;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');

            // Carrega o changelog sob demanda (só na primeira vez)
            if (targetId === 'tab-changelog' && !changelogCarregado) {
                carregarChangelog();
                changelogCarregado = true;
            }

            const targetPanel = document.getElementById(targetId);

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // --- LÓGICA PARA LINKS INTERNOS DAS TABS ---
    const inlineTabLinks = document.querySelectorAll('.inline-tab-link');
    inlineTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTabId = link.getAttribute('data-target-tab');
            if (!targetTabId) return;

            const targetButton = document.querySelector(`.tab-button[data-target="${targetTabId}"]`);

            if (targetButton) {
                targetButton.click();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // --- LÓGICA DE OCULTAR E FILTRAR EMENTAS ---
    const btnToggleEmentas = document.getElementById('btn-toggle-ementas');
    const searchEmentasInput = document.getElementById('search-ementas-input');

    btnToggleEmentas.addEventListener('click', () => {
        const wrapper = document.getElementById('ementas-toggle-wrapper');
        const isVisible = btnToggleEmentas.dataset.visible === 'true';

        if (isVisible) {
            wrapper.style.display = 'none';
            btnToggleEmentas.dataset.visible = 'false';
            btnToggleEmentas.textContent = '[ Exibir ]';
        } else {
            wrapper.style.display = 'block';
            btnToggleEmentas.dataset.visible = 'true';
            btnToggleEmentas.textContent = '[ Ocultar ]';
        }
    });
    searchEmentasInput.addEventListener('input', filtrarEmentasPorTexto);

    // --- LÓGICA PARA TOOLTIP DE QUESTÕES OBSOLETAS (MOBILE) ---
    const obsoletaTooltip = document.getElementById('obsoleta-tooltip-trigger');
    if (obsoletaTooltip) {
        obsoletaTooltip.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const message = obsoletaTooltip.getAttribute('title');
            if (message) {
                alert(message);
            }
        });
    }

    // --- CARREGAMENTO INICIAL DOS DADOS ---
    carregarDados();
    carregarContribuidores();


    // --- LISTENERS DOS FILTROS PRINCIPAIS ---
    btnClear.addEventListener('click', () => {
        disciplinaCheckContainer.querySelectorAll('input[type="checkbox"]').forEach(check => {
            check.checked = false;
        });
        checkContainer.querySelectorAll('input[type="checkbox"]').forEach(check => {
            check.checked = false;
        });
        exameCheckContainer.querySelectorAll('input[type="checkbox"]').forEach(check => {
            check.checked = false;
        });
        document.getElementById('filter-resolucao').checked = false;
        sortAnoDropdown.value = 'decrescente';
        searchInput.value = '';
        document.getElementById('obsoleta-sim').checked = true;

        renderizarFiltrosDeEmenta(); // Atualiza ementas (vai mostrar o aviso)
        renderizarQuestoes(); // Atualiza questões (vai mostrar o prompt inicial)
        atualizarBotaoDisciplinas(); // Sincroniza o botão "Marcar Todas"

        // Expande e limpa o filtro de ementas
        document.getElementById('ementas-toggle-wrapper').style.display = 'block';
        btnToggleEmentas.dataset.visible = 'true';
        btnToggleEmentas.textContent = '[ Ocultar ]';
        searchEmentasInput.value = '';
    });

    btnCheckAllDisciplinas.addEventListener('click', () => {
        const newState = btnCheckAllDisciplinas.dataset.checked === 'false';
        disciplinaCheckContainer.querySelectorAll('input[type="checkbox"]').forEach(check => {
            check.checked = newState;
        });
        // Atualiza o estado do botão
        btnCheckAllDisciplinas.dataset.checked = newState;
        btnCheckAllDisciplinas.textContent = newState ? "Desmarcar Todas" : "Marcar Todas";

        renderizarFiltrosDeEmenta();
        renderizarQuestoes();
    });

    btnCheckAllEmentas.addEventListener('click', () => {
        const newState = btnCheckAllEmentas.dataset.checked === 'false';
        // Seleciona apenas os checkboxes visíveis (não filtrados pelo texto)
        checkContainer.querySelectorAll('.ementa-group-grid label').forEach(label => {
            if (label.style.display !== 'none') {
                const check = label.querySelector('input[type="checkbox"]');
                if (check) {
                    check.checked = newState;
                }
            }
        });
        btnCheckAllEmentas.dataset.checked = newState;
        btnCheckAllEmentas.textContent = newState ? "Desmarcar Todas" : "Marcar Todas";
        renderizarQuestoes();
    });

    // Listeners que disparam a re-renderização das questões
    sortAnoDropdown.addEventListener('change', renderizarQuestoes);
    searchInput.addEventListener('input', renderizarQuestoes);
    document.querySelectorAll('input[name="obsoleta-filter"]').forEach(radio => {
        radio.addEventListener('change', renderizarQuestoes);
    });
    document.getElementById('filter-resolucao').addEventListener('change', renderizarQuestoes);


    // -------------------------------------------------------------------
    //   Definição de Funções da Aplicação
    // -------------------------------------------------------------------

    /**
     * Carrega todos os arquivos JSON de disciplinas e normas (CPCs)
     * e, ao finalizar, renderiza os filtros e as questões.
     */
    async function carregarDados() {
        const promessas = Object.entries(configDisciplinas).map(async ([nome, config]) => {
            try {
                const response = await fetch(config.arquivo);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} para ${config.arquivo}`);
                }
                const data = await response.json();

                // Armazena os dados carregados na configuração global
                config.questoes = data;
                data.forEach(q => {
                    q.disciplina = nome; // Injeta o nome da disciplina em cada questão
                    if (q.tags && Array.isArray(q.tags)) {
                        q.tags.forEach(tag => config.allTags.add(tag));
                    }
                });

            } catch (error) {
                console.error(`Erro ao carregar a disciplina "${nome}" (${config.arquivo}):`, error);
            }
        });

        // Aguarda todas as disciplinas carregarem
        await Promise.all(promessas);

        // Carrega os dados das normas (CPCs)
        try {
            const response = await fetch('normas/cpcs.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} para cpcs.json`);
            }
            cpcData = await response.json();
        } catch (error) {
            console.error('Erro ao carregar cpcs.json:', error);
            cpcData = {}; // Garante que cpcData é um objeto e não falha
        }

        // Renderiza os filtros na tela
        renderizarFiltrosDeDisciplina();
        renderizarFiltrosDeExame();
        renderizarFiltrosDeEmenta();
        renderizarQuestoes(); // Renderiza o estado inicial (prompt)
    }

    /**
     * Função auxiliar para remover acentos e normalizar texto para buscas.
     * @param {string} text - O texto a ser normalizado.
     * @returns {string} - O texto sem acentos.
     */
    function normalizeText(text) {
        if (typeof text !== 'string') return '';
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    /**
     * Cria e renderiza os checkboxes de filtro para as DISCIPLINAS.
     */
    function renderizarFiltrosDeDisciplina() {
        let filterHTML = '';
        const nomesDisciplinas = Object.keys(configDisciplinas).sort((a, b) => a.localeCompare(b, 'pt-BR'));

        nomesDisciplinas.forEach(nome => {
            const config = configDisciplinas[nome];
            const count = config.questoes.length;
            const className = config.className || '';

            filterHTML += `
                <label class="${className}">
                    <input type="checkbox" class="disciplina-filter-check" value="${nome}">
                    ${nome} (${count})
                </label>
            `;
        });
        disciplinaCheckContainer.innerHTML = filterHTML;

        // Adiciona listeners aos novos checkboxes
        disciplinaCheckContainer.querySelectorAll('.disciplina-filter-check').forEach(check => {
            check.addEventListener('change', () => {
                renderizarFiltrosDeEmenta();
                renderizarQuestoes();
                atualizarBotaoDisciplinas(); // Sincroniza o botão "Marcar Todas"
            });
        });
        
        // Garante que o botão "Marcar Todas" esteja no estado correto
        atualizarBotaoDisciplinas();
    }

    /**
     * Cria e renderiza os checkboxes de filtro para as EMENTAS (tags).
     * Esta função é reativa: só mostra ementas das disciplinas selecionadas.
     */
    function renderizarFiltrosDeEmenta() {
        // Salva as ementas que já estavam marcadas
        const ementasMarcadasAnteriormente = new Set(
            Array.from(checkContainer.querySelectorAll('.filter-check:checked'))
                .map(check => check.value)
        );
        
        const disciplinasSelecionadas = Array.from(
            disciplinaCheckContainer.querySelectorAll('.disciplina-filter-check:checked')
        ).map(check => check.value);

        // Se nenhuma disciplina estiver marcada, mostra um aviso
        if (disciplinasSelecionadas.length === 0) {
            checkContainer.innerHTML = '<p style="font-size: 0.9em; color: #777; margin: 0;">(Selecione uma disciplina para ver as ementas)</p>';
            btnCheckAllEmentas.style.display = 'none';
            document.getElementById('ementas-toggle-wrapper').style.display = 'block';
            document.getElementById('search-ementas-input').parentElement.style.display = 'none';

            const btnToggleEmentas = document.getElementById('btn-toggle-ementas');
            if (btnToggleEmentas) {
                btnToggleEmentas.dataset.visible = 'true';
                btnToggleEmentas.textContent = '[ Ocultar ]';
            }
            return;
        }

        // Mostra os controles de ementa
        btnCheckAllEmentas.style.display = 'inline-block';
        document.getElementById('search-ementas-input').parentElement.style.display = 'block';

        let finalHTML = '';
        disciplinasSelecionadas.sort((a, b) => a.localeCompare(b, 'pt-BR'));

        // Agrupa as ementas por disciplina
        disciplinasSelecionadas.forEach(nomeDisciplina => {
            const tagsDaDisciplina = Array.from(configDisciplinas[nomeDisciplina].allTags).sort();
            if (tagsDaDisciplina.length === 0) return;

            let groupCheckboxHTML = '';
            tagsDaDisciplina.forEach(tag => {
                // Remarca as ementas que já estavam selecionadas
                const isChecked = ementasMarcadasAnteriormente.has(tag) ? 'checked' : '';
                groupCheckboxHTML += `
                    <label>
                        <input type="checkbox" class="filter-check" value="${tag}" ${isChecked}>
                        ${tag}
                    </label>
                `;
            });

            finalHTML += `
                <div class="ementa-group">
                    <p class="ementa-group-label">${nomeDisciplina}</p>
                    <div class="ementa-group-grid">
                        ${groupCheckboxHTML}
                    </div>
                </div>
            `;
        });

        checkContainer.innerHTML = finalHTML;

        // Adiciona listeners aos novos checkboxes
        checkContainer.querySelectorAll('.filter-check').forEach(check => {
            check.addEventListener('change', renderizarQuestoes);
        });

        // Reseta o botão "Marcar Todas"
        btnCheckAllEmentas.dataset.checked = 'false';
        btnCheckAllEmentas.textContent = 'Marcar Todas';

        // Aplica o filtro de texto (caso haja algo digitado)
        filtrarEmentasPorTexto();
    }


    /**
     * Cria e renderiza os checkboxes de filtro para os EXAMES (Ano/Parte).
     */
    function renderizarFiltrosDeExame() {
        // Coleta todos os nomes de exames únicos de todas as disciplinas
        const masterExameSet = new Set();
        Object.values(configDisciplinas).forEach(config => {
            config.questoes.forEach(q => masterExameSet.add(q.exame));
        });

        const exames = Array.from(masterExameSet);

        // Helper para ordenar os exames (ex: 2025/2, 2025/1, 2024/2...)
        const parseExame = (exameStr) => {
            const matchComParte = exameStr.match(/(\d{4})\/(\d)/);
            const matchRS = exameStr.match(/(\d{4})\/1 RS/);
            const matchAno = exameStr.match(/(\d{4})/);

            if (matchRS) return { ano: parseInt(matchRS[1]), parte: 1.5 }; // Trata "RS" como "1.5" para ordenar
            if (matchComParte) return { ano: parseInt(matchComParte[1]), parte: parseInt(matchComParte[2]) };
            if (matchAno) return { ano: parseInt(matchAno[1]), parte: 0 };
            return { ano: 0, parte: 0 };
        };
        exames.sort((a, b) => {
            const parsedA = parseExame(a);
            const parsedB = parseExame(b);
            if (parsedB.ano !== parsedA.ano) return parsedB.ano - parsedA.ano; // Ano decrescente
            if (parsedB.parte !== parsedA.parte) return parsedB.parte - parsedA.parte; // Parte decrescente
            return a.localeCompare(b);
        });

        let exameFilterHTML = '';
        exames.forEach(exame => {
            exameFilterHTML += `
                <label>
                    <input type="checkbox" class="exame-filter-check" value="${exame}">
                    ${exame}
                </label>
            `;
        });
        exameCheckContainer.innerHTML = exameFilterHTML;

        // Adiciona listeners aos novos checkboxes
        exameCheckContainer.querySelectorAll('.exame-filter-check').forEach(check => {
            check.addEventListener('change', renderizarQuestoes);
        });
    }

    /**
     * Helper para renderizar enunciados.
     * Suporta o formato antigo (string `enunciado`) e o novo (array `enunciado_blocos`).
     * @param {object} questao - O objeto da questão.
     * @returns {string} - O HTML do enunciado.
     */
    function renderizarEnunciado(questao) {
        // Se 'enunciado_blocos' existir, usa o renderizador estruturado
        if (questao.enunciado_blocos && Array.isArray(questao.enunciado_blocos)) {
            let html = '';
            questao.enunciado_blocos.forEach(bloco => {

                if (bloco.type === 'p') {
                    // Renderiza um parágrafo
                    html += `<p>${bloco.content}</p>`;

                } else if (bloco.type === 'table') {
                    // Renderiza uma tabela (com wrapper para rolagem mobile)
                    html += '<div class="table-wrapper">';
                    html += '<table class="enunciado-table">';

                    // Renderiza o cabeçalho complexo (thead)
                    if (bloco.headerRows && bloco.headerRows.length > 0) {
                        html += '<thead>';
                        bloco.headerRows.forEach(rowArray => {
                            html += '<tr>';
                            rowArray.forEach(cellObj => {
                                // Pula a renderização de 'th' se for uma célula vazia (para rowspan)
                                if (cellObj.isEmpty) {
                                    // Não renderiza nada
                                } else {
                                    const colspan = cellObj.colspan ? ` colspan="${cellObj.colspan}"` : '';
                                    const rowspan = cellObj.rowspan ? ` rowspan="${cellObj.rowspan}"` : '';
                                    html += `<th${colspan}${rowspan}>${cellObj.content}</th>`;
                                }
                            });
                            html += '</tr>';
                        });
                        html += '</thead>';
                    }

                    // Renderiza o corpo da tabela (tbody)
                    html += '<tbody>';
                    if (bloco.bodyRows && bloco.bodyRows.length > 0) {
                        bloco.bodyRows.forEach(rowArray => {
                            html += '<tr>';
                            rowArray.forEach(cellContent => {
                                html += `<td>${cellContent}</td>`;
                            });
                            html += '</tr>';
                        });
                    }
                    html += '</tbody></table>';
                    html += '</div>'; // Fecha o .table-wrapper
                }
            });
            return `<div class="enunciado">${html}</div>`;
        }

        // Fallback: Se 'enunciado_blocos' não existir, usa o 'enunciado' antigo
        if (questao.enunciado) {
            return `<p class="enunciado">${questao.enunciado}</p>`;
        }

        return '<p class="enunciado" style="color:red;">Erro: Enunciado não encontrado.</p>';
    }

    /**
     * Função mestre que aplica filtros e ordenação e INICIA o processo de
     * renderização com lazy loading.
     */
    function renderizarQuestoes() {

        // 1. Limpa o estado anterior
        if (observer) {
            observer.disconnect(); // Para o "scroll infinito" anterior
        }
        questoesContainer.innerHTML = ''; // Limpa os cards da tela

        // 2. Coleta o filtro de Disciplina (o principal)
        const filtrosDisciplina = Array.from(
            disciplinaCheckContainer.querySelectorAll('.disciplina-filter-check:checked')
        ).map(check => check.value);

        // Se nenhuma disciplina estiver selecionada, mostra o prompt inicial e para
        if (filtrosDisciplina.length === 0) {
            questoesContainer.style.display = 'none';
            initialPrompt.style.display = 'block';
            infoSpan.textContent = '';
            return;
        }

        // Oculta o prompt inicial e mostra o container de questões
        questoesContainer.style.display = 'block';
        initialPrompt.style.display = 'none';

        // 3. Coleta todos os outros filtros
        const filtrosEmenta = Array.from(
            checkContainer.querySelectorAll('.filter-check:checked')
        ).map(check => check.value);
        const examesSelecionados = Array.from(
            exameCheckContainer.querySelectorAll('.exame-filter-check:checked')
        ).map(check => check.value);
        const sortOrder = sortAnoDropdown.value;
        const searchTerm = normalizeText(searchInput.value.toLowerCase().trim());
        const mostrarObsoletas = document.querySelector('input[name="obsoleta-filter"]:checked').value;
        const apenasComResolucao = document.getElementById('filter-resolucao').checked;


        // 4. Aplica os filtros para criar a lista de questões
        let questoesParaFiltrar = [];
        filtrosDisciplina.forEach(nome => {
            questoesParaFiltrar.push(...configDisciplinas[nome].questoes);
        });
        const totalQuestoesDasDisciplinas = questoesParaFiltrar.length;

        // Aplica filtro de OBESOLETAS
        if (mostrarObsoletas === 'nao') {
            questoesParaFiltrar = questoesParaFiltrar.filter(questao => !questao.obsoleta);
        }
        // Aplica filtro de RESOLUÇÃO
        if (apenasComResolucao) {
            questoesParaFiltrar = questoesParaFiltrar.filter(questao =>
                questao.resolucao && questao.resolucao.trim() !== ''
            );
        }
        // Aplica filtro de EMENTA
        if (filtrosEmenta.length > 0) {
            questoesParaFiltrar = questoesParaFiltrar.filter(questao => {
                return filtrosEmenta.some(filtro => questao.tags && questao.tags.includes(filtro));
            });
        }
        // Aplica filtro de EXAME
        if (examesSelecionados.length > 0) {
            questoesParaFiltrar = questoesParaFiltrar.filter(questao => {
                return examesSelecionados.includes(questao.exame);
            });
        }
        // Aplica filtro de PALAVRA-CHAVE
        if (searchTerm.length > 0) {
            questoesParaFiltrar = questoesParaFiltrar.filter(questao => {
                const enunciadoLower = normalizeText(questao.enunciado.toLowerCase());
                const opcoesLower = normalizeText(questao.opcoes.map(op => op.texto.toLowerCase()).join(' '));
                const resolucaoLower = normalizeText((questao.resolucao || '').toLowerCase());

                return enunciadoLower.includes(searchTerm) ||
                       opcoesLower.includes(searchTerm) ||
                       resolucaoLower.includes(searchTerm);
            });
        }

        // 5. Aplica a ORDENAÇÃO
        const parseExameParaSort = (exameStr) => {
            const matchComParte = exameStr.match(/(\d{4})\/(\d)/);
            const matchRS = exameStr.match(/(\d{4})\/1 RS/);
            const matchAno = exameStr.match(/(\d{4})/);

            if (matchRS) return { ano: parseInt(matchRS[1]), parte: 1.5 };
            if (matchComParte) return { ano: parseInt(matchComParte[1]), parte: parseInt(matchComParte[2]) };
            if (matchAno) return { ano: parseInt(matchAno[1]), parte: 0 };
            return { ano: 0, parte: 0 };
        };
        questoesParaFiltrar.sort((a, b) => {
            const parsedA = parseExameParaSort(a.exame);
            const parsedB = parseExameParaSort(b.exame);
            if (sortOrder === 'crescente') {
                if (parsedA.ano !== parsedB.ano) return parsedA.ano - parsedB.ano;
                if (parsedA.parte !== parsedB.parte) return parsedA.parte - parsedB.parte;
                return a.id - b.id;
            } else { // decrescente
                if (parsedB.ano !== parsedA.ano) return parsedB.ano - parsedA.ano;
                if (parsedB.parte !== parsedA.parte) return parsedB.parte - parsedA.parte; // <-- Bug de ordenação corrigido
                return b.id - a.id;
            }
        });

        // 6. Atualiza o contador de questões
        const totalMostrando = questoesParaFiltrar.length;
        if (totalMostrando === totalQuestoesDasDisciplinas && totalMostrando > 0) {
            infoSpan.textContent = `Exibindo todas as ${totalQuestoesDasDisciplinas} questões das disciplinas selecionadas.`;
        } else {
            infoSpan.textContent = `Exibindo ${totalMostrando} de ${totalQuestoesDasDisciplinas} questões (das disciplinas selecionadas).`;
        }

        // 7. Prepara o Lazy Loading
        listaCompletaFiltrada = questoesParaFiltrar; // Salva a lista filtrada
        indiceAtual = 0; // Reseta o contador

        // Se a lista filtrada estiver vazia, mostra aviso e para
        if (listaCompletaFiltrada.length === 0) {
            questoesContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Nenhuma questão encontrada com os filtros selecionados.</p>';
            return;
        }

        // 8. Inicia o processo de renderização
        renderizarLoteDeQuestoes(); // Renderiza o primeiro lote
        configurarObserver(); // Configura o "scroll infinito" para carregar o resto
    }

    /**
     * Renderiza um "lote" de questões (ex: 20) na tela.
     * Esta função é chamada pela `renderizarQuestoes` (para o primeiro lote)
     * e pelo `handleIntersect` (para os lotes seguintes).
     */
    function renderizarLoteDeQuestoes() {
        // Define o início e o fim do lote
        const fim = Math.min(indiceAtual + TAMANHO_LOTE, listaCompletaFiltrada.length);
        const lote = listaCompletaFiltrada.slice(indiceAtual, fim);

        // Se o lote estiver vazio, não há mais nada a carregar
        if (lote.length === 0) {
            if (observer) observer.disconnect();
            return;
        }

        let batchHTML = ''; // String para o HTML do lote

        // Cria o HTML para cada questão no lote
        lote.forEach(questao => {
            let opcoesHTML = '';
            questao.opcoes.forEach(opcao => {
                opcoesHTML += `<li class="opcao-clicavel" data-letra="${opcao.letra}"><strong>(${opcao.letra})</strong> ${opcao.texto}</li>`;
            });

            const safeExameId = questao.exame.replace(/[^a-zA-Z0-9]/g, '-');
            const uniqueID = `resposta-${safeExameId}-${questao.id}`;
            const obsoletaTagHTML = questao.obsoleta ? '<span class="tag-obsoleta">Questão Obsoleta</span>' : '';
            const anuladaTagHTML = questao.anulada ? '<span class="tag-anulada">Questão Anulada</span>' : '';

            const config = configDisciplinas[questao.disciplina];
            const disciplinaClassName = (config && config.className) ? config.className : '';
            const disciplinaTagHTML = `<span class="disciplina ${disciplinaClassName}">${questao.disciplina}</span>`;

            let ementasTagsHTML = '';
            if (questao.tags && Array.isArray(questao.tags)) {
                const sortedTags = [...questao.tags].sort();
                sortedTags.forEach(tag => {
                    ementasTagsHTML += `<span class="ementa-tag">${tag}</span>`;
                });
            }

            let resolucaoHTML = '';
            if (questao.resolucao && questao.resolucao.trim() !== '') {
                resolucaoHTML = `<div class="resolucao-texto"><strong>Resolução Comentada:</strong><br>${questao.resolucao}</div>`;
            } else {
                resolucaoHTML = `<div class="sem-resolucao">Esta questão ainda não possui uma resolução comentada. Gostaria de ajudar a construí-la? Acesse a aba "Sobre" e saiba como!</div>`;
            }

            let autorHTML = '';
            if (questao.autor_resolucao && questao.autor_resolucao.trim() !== '') {
                autorHTML = `
                    <details class="autor-resolucao">
                        <summary>Autor da Resolução</summary>
                        <p>${questao.autor_resolucao}</p>
                    </details>
                `;
            }

            let cpcHTML = '';
            let cpcLinks = '';
            if (questao.tags && cpcData) {
                questao.tags.forEach(tag => {
                    const cpcInfo = cpcData[tag];
                    if (cpcInfo) {
                        cpcLinks += `<li><a href="${cpcInfo.url}" target="_blank" rel="noopener noreferrer">${cpcInfo.cpc} - ${tag}</a></li>`;
                    }
                });
            }
            if (cpcLinks) {
                cpcHTML = `
                    <details class="cpc-referencia">
                        <summary>Normas (CPCs) Relacionadas</summary>
                        <ul>${cpcLinks}</ul>
                    </details>
                `;
            }

            const cardHTML = `
                <div class="questao-card" data-gabarito="${questao.gabarito}">
                    <div class="questao-header">
                        <h4>Questão ${questao.id}</h4>
                        <div class="questao-meta">
                            <span>${questao.exame}</span> 
                            <span class="banca">${questao.banca}</span> 
                            ${obsoletaTagHTML}
                            ${anuladaTagHTML} 
                        </div>
                    </div>
                    <div class="questao-disciplina-container">
                        ${disciplinaTagHTML}
                        ${ementasTagsHTML}
                    </div>
                    ${renderizarEnunciado(questao)}
                    <div class="opcoes">
                        <ul class="opcoes-lista" data-target-id="${uniqueID}">
                            ${opcoesHTML}
                        </ul>
                    </div>
                    <small class="quiz-hint">Clique em uma das opções acima para ver o gabarito.</small>
                    <div class="resposta-correta" id="${uniqueID}">
                        <div class="gabarito-texto">
                            <strong>Gabarito: (${questao.gabarito})</strong> ${questao.gabarito_texto}
                        </div>
                        ${resolucaoHTML} 
                        ${autorHTML} 
                        ${cpcHTML}
                    </div>
                </div>
            `;
            batchHTML += cardHTML;
        });

        // Adiciona o HTML do lote ao final do container (sem apagar o anterior)
        questoesContainer.insertAdjacentHTML('beforeend', batchHTML);

        // Atualiza o índice para o próximo lote
        indiceAtual = fim;

        // Adiciona os eventos de clique APENAS nos novos cards
        adicionarEventosQuiz();

        // Move a sentinela para o final do novo lote
        questoesContainer.appendChild(sentinela);

        // Se já carregamos tudo, remove a sentinela e desliga o observer
        if (indiceAtual >= listaCompletaFiltrada.length) {
            if (observer) observer.disconnect();
            sentinela.remove();
        }
    }

    /**
     * Callback que o IntersectionObserver chama quando a sentinela
     * entra ou sai da tela.
     */
    function handleIntersect(entries) {
        entries.forEach(entry => {
            // Se a sentinela está visível (intersecting)
            if (entry.isIntersecting) {
                // Carrega o próximo lote de questões
                renderizarLoteDeQuestoes();
            }
        });
    }

    /**
     * Configura e inicia o IntersectionObserver para vigiar a sentinela.
     */
    function configurarObserver() {
        const options = {
            root: null, // Observa em relação ao viewport
            rootMargin: '200px', // Carrega 200px ANTES de chegar no fim
            threshold: 0
        };

        observer = new IntersectionObserver(handleIntersect, options);
        observer.observe(sentinela);
    }

    /**
     * Adiciona os eventos de clique (modo quiz) às opções.
     * Esta função é "idempotente": ela só adiciona listeners
     * a elementos que ainda não foram processados.
     */
    function adicionarEventosQuiz() {
        // Seleciona apenas as listas que AINDA NÃO têm o listener
        const listasOpcoes = document.querySelectorAll('.opcoes-lista:not([data-listener-added])');

        listasOpcoes.forEach(ul => {
            // Marca a lista como "processada"
            ul.dataset.listenerAdded = 'true';

            // Adiciona o listener de clique (delegação de evento)
            ul.addEventListener('click', (e) => {
                const liClicado = e.target.closest('li.opcao-clicavel');
                if (!liClicado) { return; }

                const letraClicada = liClicado.getAttribute('data-letra');
                const card = ul.closest('.questao-card');
                const gabarito = card.getAttribute('data-gabarito');
                const targetId = ul.getAttribute('data-target-id');
                const respostaDiv = document.getElementById(targetId);
                const hint = card.querySelector('.quiz-hint');

                // Verifica se o usuário está clicando na opção já selecionada (para desmarcar)
                const isAlreadyActive = liClicado.classList.contains('opcao-correta') || liClicado.classList.contains('opcao-incorreta');

                // Limpa todas as marcações
                ul.querySelectorAll('li.opcao-clicavel').forEach(li => {
                    li.classList.remove('opcao-correta', 'opcao-incorreta');
                });

                // Lógica de toggle: se clicou na ativa, esconde; senão, mostra
                if (isAlreadyActive) {
                    respostaDiv.style.display = 'none';
                    if (hint) hint.style.display = 'block';
                } else {
                    respostaDiv.style.display = 'block';
                    if (hint) hint.style.display = 'none';

                    // Marca como correta ou incorreta
                    if (letraClicada === gabarito) {
                        liClicado.classList.add('opcao-correta');
                    } else {
                        liClicado.classList.add('opcao-incorreta');
                    }
                }
            });
        });
    }

    /**
     * Filtra a lista de EMENTAS com base no texto digitado no
     * campo de busca de ementas.
     */
    function filtrarEmentasPorTexto() {
        const searchTerm = normalizeText(document.getElementById('search-ementas-input').value.toLowerCase());
        const grupos = document.querySelectorAll('#checkbox-container .ementa-group');

        grupos.forEach(grupo => {
            let visiveisNoGrupo = 0;
            const labels = grupo.querySelectorAll('.ementa-group-grid label');

            labels.forEach(label => {
                const labelText = normalizeText(label.textContent.toLowerCase());
                
                // Mostra a label se o texto bater com a busca
                if (labelText.includes(searchTerm)) {
                    label.style.display = 'flex';
                    visiveisNoGrupo++;
                } else {
                    label.style.display = 'none';
                }
            });

            // Esconde o grupo inteiro se nenhuma ementa dele bater com a busca
            if (visiveisNoGrupo > 0) {
                grupo.style.display = 'block';
            } else {
                grupo.style.display = 'none';
            }
        });
    }


    /**
     * Carrega o arquivo CHANGELOG.md e o renderiza como HTML
     * na aba "Novidades".
     */
    async function carregarChangelog() {
        const container = document.getElementById('changelog-content');
        if (!container) return;

        try {
            const response = await fetch('CHANGELOG.md');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - Não foi possível encontrar o arquivo CHANGELOG.md`);
            }
            const markdownText = await response.text();

            if (typeof marked === 'undefined') {
                throw new Error("Biblioteca 'marked.js' não foi carregada.");
            }

            // Converte o Markdown para HTML
            const html = marked.parse(markdownText);
            container.innerHTML = html;

        } catch (error) {
            console.error('Erro ao carregar o changelog:', error);
            container.innerHTML = `<p style="color: red;">Erro ao carregar o changelog. Verifique se o arquivo <code>CHANGELOG.md</code> existe na raiz do projeto.</p>`;
        }
    }

    /**
     * Carrega a lista de contribuidores do JSON
     * e a insere na aba "Sobre".
     */
    async function carregarContribuidores() {
        if (!contributorsListContainer) return;

        contributorsListContainer.innerHTML = '<li>Carregando...</li>';

        try {
            const response = await fetch('contributors.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - Não foi possível encontrar contributors.json`);
            }
            const data = await response.json();

            // Lógica de Ordenação Híbrida:
            // 1. Separa os contribuidores em grupos
            const creators = data.filter(c =>
                c.roles.includes('Criador e mantenedor')
            );
            const placeholder = data.filter(c =>
                c.roles.includes('pode aparecer aqui se você contribuir!')
            );
            const otherContributors = data.filter(c =>
                !c.roles.includes('Criador e mantenedor') &&
                !c.roles.includes('pode aparecer aqui se você contribuir!')
            );

            // 2. Ordena alfabeticamente
            creators.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
            otherContributors.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

            // 3. Junta as listas na ordem desejada
            const sortedList = [...creators, ...otherContributors, ...placeholder];

            let html = '';
            sortedList.forEach(contrib => {
                html += `<li>`;
                html += `<strong>${contrib.name}</strong> (${contrib.roles.join(', ')})`;
                if (contrib.link && contrib.link.url && contrib.link.text) {
                    html += ` - [<a href="${contrib.link.url}" target="_blank" rel="noopener noreferrer">${contrib.link.text}</a>]`;
                }
                html += `</li>`;
            });

            contributorsListContainer.innerHTML = html;

        } catch (error) {
            console.error('Erro ao carregar contribuidores:', error);
            contributorsListContainer.innerHTML = '<li style="color: red;">Erro ao carregar lista.</li>';
        }
    }
    
    /**
     * Sincroniza o estado (texto e data-checked) do botão
     * "Marcar Todas" das DISCIPLINAS, com base nos checkboxes.
     */
    function atualizarBotaoDisciplinas() {
        const checks = disciplinaCheckContainer.querySelectorAll('input[type="checkbox"]');
        if (!checks || checks.length === 0) {
             btnCheckAllDisciplinas.dataset.checked = 'false';
             btnCheckAllDisciplinas.textContent = "Marcar Todas";
            return;
        }
        
        const total = checks.length;
        const marcados = disciplinaCheckContainer.querySelectorAll('input[type="checkbox"]:checked').length;

        if (total > 0 && total === marcados) {
            // Se todas estão marcadas
            btnCheckAllDisciplinas.dataset.checked = 'true';
            btnCheckAllDisciplinas.textContent = "Desmarcar Todas";
        } else {
            // Se pelo menos uma não está marcada
            btnCheckAllDisciplinas.dataset.checked = 'false';
            btnCheckAllDisciplinas.textContent = "Marcar Todas";
        }
    }

}); // Fim do DOMContentLoaded
