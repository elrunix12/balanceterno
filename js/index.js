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
//   Configuração Global e Variáveis
// -------------------------------------------------------------------

/**
 * LISTA DE ARQUIVOS DE EXAME
 * Nota: Como estamos rodando no cliente (browser), não podemos escanear pastas.
 * Você deve listar os arquivos gerados aqui ou criar um 'index.json' no Python.
 */
const ARQUIVOS_EXAMES = [
    'etl/exportar/CFC_2025_02.json',
    'etl/exportar/CFC_2025_01.json',
    'etl/exportar/CFC_2024_02.json',
    // Adicione os novos arquivos aqui conforme forem gerados...
];

/**
 * Mapeamento visual para manter as cores das disciplinas.
 * (De-Para: Nome no JSON -> Classe CSS)
 */
const MAPA_CLASSES_CSS = {
    "Língua Portuguesa": "disciplina-portugues",
    "Matemática Financeira e Estatística": "disciplina-exatas",
    "Noções de Direito e Legislação Aplicada": "disciplina-direito",
    "Legislação e Ética Profissional": "disciplina-etica",
    "Teoria da Contabilidade": "disciplina-geral", // Pode usar a cor de Geral ou criar uma nova CSS
    "Contabilidade Geral e NBCs": "disciplina-societaria",
    "Contabilidade de Custos": "disciplina-custos",
    "Contabilidade Gerencial": "disciplina-gerencial",
    "Contabilidade Aplicada ao Setor Público": "disciplina-publica",
    "Controladoria": "disciplina-controladoria",
    "Auditoria Contábil": "disciplina-auditoria",
    "Perícia Contábil": "disciplina-pericia",
};

// --- Estado Global ---
let todasAsQuestoes = []; // Armazena TODAS as questões carregadas (Flat List)
let ementaGlobal = {};    // Armazena a estrutura do ementa.json
let cpcData = {};         // Armazena dados dos CPCs

// --- Referências ao DOM ---
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

// --- Lazy Loading (Scroll Infinito) ---
let observer = null;
let listaCompletaFiltrada = [];
let indiceAtual = 0;
const TAMANHO_LOTE = 20; 
const sentinela = document.createElement('div');
sentinela.id = 'sentinela-lazy-load';


// -------------------------------------------------------------------
//   LÓGICA DA PÁGINA (Inicialização e Funções)
// -------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

    // --- TABS E INTERFACE ---
    setupTabs();
    setupEmentaToggle();
    setupMobileTooltips();

    // --- CARREGAMENTO DE DADOS ---
    carregarDados();
    carregarContribuidores();

    // --- LISTENERS GERAIS ---
    setupListeners();
});

// -------------------------------------------------------------------
//   FUNÇÕES DE SETUP (Organização)
// -------------------------------------------------------------------

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    let changelogCarregado = false;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            if (targetId === 'tab-changelog' && !changelogCarregado) {
                carregarChangelog();
                changelogCarregado = true;
            }
            const targetPanel = document.getElementById(targetId);
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            button.classList.add('active');
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // Links Internos
    document.querySelectorAll('.inline-tab-link').forEach(link => {
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
}

function setupEmentaToggle() {
    const btnToggleEmentas = document.getElementById('btn-toggle-ementas');
    const searchEmentasInput = document.getElementById('search-ementas-input');
    const ementasWrapper = document.getElementById('ementas-toggle-wrapper');
    
    if(!btnToggleEmentas) return;

    ementasWrapper.style.display = 'none';
    btnToggleEmentas.dataset.visible = 'false';
    btnToggleEmentas.textContent = '[ Exibir ]';

    btnToggleEmentas.addEventListener('click', () => {
        const isVisible = btnToggleEmentas.dataset.visible === 'true';
        if (isVisible) {
            ementasWrapper.style.display = 'none';
            btnToggleEmentas.dataset.visible = 'false';
            btnToggleEmentas.textContent = '[ Exibir ]';
        } else {
            ementasWrapper.style.display = 'block';
            btnToggleEmentas.dataset.visible = 'true';
            btnToggleEmentas.textContent = '[ Ocultar ]';
        }
    });
    searchEmentasInput.addEventListener('input', filtrarEmentasPorTexto);
}

function setupMobileTooltips() {
    const obsoletaTooltip = document.getElementById('obsoleta-tooltip-trigger');
    if (obsoletaTooltip) {
        obsoletaTooltip.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            alert(obsoletaTooltip.getAttribute('title'));
        });
    }
}

function setupListeners() {
    // Botão Limpar Filtros
    btnClear.addEventListener('click', () => {
        document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
        document.getElementById('filter-resolucao').checked = false;
        sortAnoDropdown.value = 'decrescente';
        searchInput.value = '';
        document.getElementById('obsoleta-sim').checked = true;

        renderizarFiltrosDeEmenta(); 
        renderizarQuestoes(); 
        atualizarBotaoDisciplinas();
        
        // Reseta UI de Ementas
        const btnToggle = document.getElementById('btn-toggle-ementas');
        const wrapper = document.getElementById('ementas-toggle-wrapper');
        const searchInputEmenta = document.getElementById('search-ementas-input');
        if (btnToggle && wrapper) {
            wrapper.style.display = 'none';
            btnToggle.dataset.visible = 'false';
            btnToggle.textContent = '[ Exibir ]';
            searchInputEmenta.value = '';
        }
    });

    // Botões Marcar Todas
    btnCheckAllDisciplinas.addEventListener('click', () => {
        const newState = btnCheckAllDisciplinas.dataset.checked === 'false';
        disciplinaCheckContainer.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = newState);
        btnCheckAllDisciplinas.dataset.checked = newState;
        btnCheckAllDisciplinas.textContent = newState ? "Desmarcar Todas" : "Marcar Todas";
        renderizarFiltrosDeEmenta();
        renderizarQuestoes();
    });

    btnCheckAllEmentas.addEventListener('click', () => {
        const newState = btnCheckAllEmentas.dataset.checked === 'false';
        checkContainer.querySelectorAll('.ementa-group-grid label').forEach(label => {
            if (label.style.display !== 'none') {
                const check = label.querySelector('input[type="checkbox"]');
                if (check) check.checked = newState;
            }
        });
        btnCheckAllEmentas.dataset.checked = newState;
        btnCheckAllEmentas.textContent = newState ? "Desmarcar Todas" : "Marcar Todas";
        renderizarQuestoes();
    });

    // Filtros reativos
    sortAnoDropdown.addEventListener('change', renderizarQuestoes);
    searchInput.addEventListener('input', renderizarQuestoes);
    document.querySelectorAll('input[name="obsoleta-filter"]').forEach(r => r.addEventListener('change', renderizarQuestoes));
    document.getElementById('filter-resolucao').addEventListener('change', renderizarQuestoes);

    // Modal de Lançamentos
    setupModalLancamentos();
}

// -------------------------------------------------------------------
//   FUNÇÕES DE DADOS (Core)
// -------------------------------------------------------------------

/**
 * Carrega Ementa, CPCs e Questões (agrupadas por Exame)
 */
async function carregarDados() {
    try {
        // 1. Carrega a Ementa (Define as disciplinas e tags)
        try {
            const respEmenta = await fetch('etl/ementa.json');
            if (respEmenta.ok) ementaGlobal = await respEmenta.json();
            else console.warn("Aviso: etl/ementa.json não encontrado ou inválido.");
        } catch (e) { console.warn("Erro ao carregar ementa:", e); }

        // 2. Carrega CPCs
        try {
            const respCpc = await fetch('normas/cpcs.json');
            if (respCpc.ok) cpcData = await respCpc.json();
        } catch (e) { cpcData = {}; }

        // 3. Carrega Questões dos Arquivos de Exame
        const promessasExames = ARQUIVOS_EXAMES.map(async (caminho) => {
            try {
                const resp = await fetch(caminho);
                if (!resp.ok) throw new Error(resp.statusText);
                
                let dados = await resp.json();

                // REMOVE A LICENÇA (filtra metadados)
                dados = dados.filter(item => item.tipo !== 'metadados_licenca');

                // Adiciona ao array global
                todasAsQuestoes.push(...dados);
            } catch (err) {
                console.error(`Erro ao carregar ${caminho}:`, err);
            }
        });

        await Promise.all(promessasExames);
        console.log(`Carregadas ${todasAsQuestoes.length} questões no total.`);

        // 4. Renderiza Interface
        renderizarFiltrosDeDisciplina();
        renderizarFiltrosDeExame();
        renderizarFiltrosDeEmenta();
        renderizarQuestoes(); // Estado inicial (Prompt)

    } catch (error) {
        console.error("Erro fatal no carregamento:", error);
        infoSpan.textContent = "Erro ao carregar dados. Verifique o console.";
    }
}

/**
 * Renderiza checkboxes de disciplinas baseado no ementaGlobal
 * ou fallback para o que existir nas questões.
 */
function renderizarFiltrosDeDisciplina() {
    let filterHTML = '';
    
    // Tenta pegar nomes da ementa, se não tiver, varre as questões
    let nomesDisciplinas = Object.keys(ementaGlobal);
    if (nomesDisciplinas.length === 0) {
        const setDisc = new Set(todasAsQuestoes.map(q => q.disciplina));
        nomesDisciplinas = Array.from(setDisc);
    }
    
    nomesDisciplinas.sort((a, b) => a.localeCompare(b, 'pt-BR'));

    nomesDisciplinas.forEach(nome => {
        // Conta quantas questões existem dessa disciplina
        const count = todasAsQuestoes.filter(q => q.disciplina === nome).length;
        
        // Define classe CSS
        let className = MAPA_CLASSES_CSS[nome] || 'disciplina-padrao';
        if(className === 'disciplina-padrao' && nome.toLowerCase().includes('geral')) className = 'disciplina-geral';

        filterHTML += `
            <label class="${className}">
                <input type="checkbox" class="disciplina-filter-check" value="${nome}">
                ${nome} (${count})
            </label>
        `;
    });
    
    disciplinaCheckContainer.innerHTML = filterHTML;

    // Listeners
    disciplinaCheckContainer.querySelectorAll('.disciplina-filter-check').forEach(check => {
        check.addEventListener('change', () => {
            renderizarFiltrosDeEmenta();
            renderizarQuestoes();
            atualizarBotaoDisciplinas();
        });
    });
    atualizarBotaoDisciplinas();
}

/**
 * Renderiza checkboxes de Ementas (Tags), agrupados por disciplina selecionada.
 */
function renderizarFiltrosDeEmenta() {
    // Preserva seleção anterior
    const ementasMarcadasAnteriormente = new Set(
        Array.from(checkContainer.querySelectorAll('.filter-check:checked')).map(c => c.value)
    );
    
    const disciplinasSelecionadas = Array.from(
        disciplinaCheckContainer.querySelectorAll('.disciplina-filter-check:checked')
    ).map(c => c.value);

    // Controle de exibição do container
    const wrapper = document.getElementById('ementas-toggle-wrapper');
    const btnToggle = document.getElementById('btn-toggle-ementas');
    
    wrapper.style.display = 'none'; 
    if (btnToggle) {
        btnToggle.dataset.visible = 'false';
        btnToggle.textContent = '[ Exibir ]';
    }

    if (disciplinasSelecionadas.length === 0) {
        checkContainer.innerHTML = '<p style="font-size: 0.9em; color: #777; margin: 0;">(Selecione uma disciplina para ver as ementas)</p>';
        btnCheckAllEmentas.style.display = 'none';
        document.getElementById('search-ementas-input').parentElement.style.display = 'none';
        
        // Força mostrar o container vazio para o aviso aparecer
        wrapper.style.display = 'block';
        if (btnToggle) {
            btnToggle.dataset.visible = 'true';
            btnToggle.textContent = '[ Ocultar ]';
        }
        return;
    }

    btnCheckAllEmentas.style.display = 'inline-block';
    document.getElementById('search-ementas-input').parentElement.style.display = 'block';

    let finalHTML = '';
    disciplinasSelecionadas.sort((a, b) => a.localeCompare(b, 'pt-BR'));

    disciplinasSelecionadas.forEach(nomeDisciplina => {
        // Tenta pegar tags da ementaGlobal
        let tags = ementaGlobal[nomeDisciplina] || [];
        
        // Fallback: Varre questões se não tiver na ementaGlobal
        if (tags.length === 0) {
            const tempSet = new Set();
            todasAsQuestoes.filter(q => q.disciplina === nomeDisciplina).forEach(q => {
                if(q.tags) q.tags.forEach(t => tempSet.add(t));
            });
            tags = Array.from(tempSet);
        }

        if (tags.length === 0) return;

        let groupCheckboxHTML = '';
        tags.sort().forEach(tag => {
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

    // Listeners
    checkContainer.querySelectorAll('.filter-check').forEach(check => {
        check.addEventListener('change', renderizarQuestoes);
    });

    btnCheckAllEmentas.dataset.checked = 'false';
    btnCheckAllEmentas.textContent = 'Marcar Todas';
    filtrarEmentasPorTexto();
}

/**
 * Renderiza filtros de Exame com base no que existe em `todasAsQuestoes`.
 */
function renderizarFiltrosDeExame() {
    const masterExameSet = new Set(todasAsQuestoes.map(q => q.exame));
    const exames = Array.from(masterExameSet);

    // Ordenação (Ano/Parte)
    const parseExame = (exameStr) => {
        const matchComParte = exameStr.match(/(\d{4})\/(\d)/);
        const matchRS = exameStr.match(/(\d{4})\/1 RS/);
        const matchAno = exameStr.match(/(\d{4})/);
        if (matchRS) return { ano: parseInt(matchRS[1]), parte: 1.5 };
        if (matchComParte) return { ano: parseInt(matchComParte[1]), parte: parseInt(matchComParte[2]) };
        if (matchAno) return { ano: parseInt(matchAno[1]), parte: 0 };
        return { ano: 0, parte: 0 };
    };

    exames.sort((a, b) => {
        const parsedA = parseExame(a);
        const parsedB = parseExame(b);
        if (parsedB.ano !== parsedA.ano) return parsedB.ano - parsedA.ano;
        if (parsedB.parte !== parsedA.parte) return parsedB.parte - parsedA.parte;
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

    exameCheckContainer.querySelectorAll('.exame-filter-check').forEach(check => {
        check.addEventListener('change', renderizarQuestoes);
    });
}

/**
 * Função Mestre: Filtra, Ordena e Inicia Renderização
 */
function renderizarQuestoes() {
    if (observer) observer.disconnect();
    questoesContainer.innerHTML = '';

    // 1. Filtro Obrigatório: Disciplina
    const filtrosDisciplina = Array.from(
        disciplinaCheckContainer.querySelectorAll('.disciplina-filter-check:checked')
    ).map(c => c.value);

    if (filtrosDisciplina.length === 0) {
        questoesContainer.style.display = 'none';
        initialPrompt.style.display = 'block';
        infoSpan.textContent = '';
        return;
    }

    questoesContainer.style.display = 'block';
    initialPrompt.style.display = 'none';

    // 2. Coleta outros filtros
    const filtrosEmenta = Array.from(checkContainer.querySelectorAll('.filter-check:checked')).map(c => c.value);
    const examesSelecionados = Array.from(exameCheckContainer.querySelectorAll('.exame-filter-check:checked')).map(c => c.value);
    const searchTerm = normalizeText(searchInput.value.toLowerCase().trim());
    const mostrarObsoletas = document.querySelector('input[name="obsoleta-filter"]:checked').value;
    const apenasComResolucao = document.getElementById('filter-resolucao').checked;
    const sortOrder = sortAnoDropdown.value;

    // 3. Aplica Filtros em Memória
    let filtradas = todasAsQuestoes.filter(q => {
        if (!filtrosDisciplina.includes(q.disciplina)) return false;
        if (mostrarObsoletas === 'nao' && q.obsoleta) return false;
        if (apenasComResolucao && (!q.resolucao || q.resolucao.trim() === '')) return false;
        if (examesSelecionados.length > 0 && !examesSelecionados.includes(q.exame)) return false;
        
        if (filtrosEmenta.length > 0) {
            if (!q.tags) return false;
            if (!filtrosEmenta.some(tag => q.tags.includes(tag))) return false;
        }

        if (searchTerm.length > 0) {
            // 1. Normalização para Busca
            let arrayParaBusca = [];

            if (Array.isArray(q.enunciado)) {
                arrayParaBusca = q.enunciado;
            } else if (typeof q.enunciado === 'string') {
                // Transforma string simples em bloco 'p'
                arrayParaBusca = [{ type: 'p', content: q.enunciado }];
            }

            // 2. Extração do Texto
            const rawEnunciado = arrayParaBusca.map(bloco => {
                if (bloco.type === 'p' || !bloco.type) return bloco.content || bloco;
                
                if (bloco.type === 'table') {
                    const hText = bloco.headerRows ? bloco.headerRows.flat().map(c => c.content || c).join(" ") : "";
                    const bText = bloco.bodyRows ? bloco.bodyRows.flat().join(" ") : "";
                    return hText + " " + bText;
                }
                return "";
            }).join(" ");

            const enunciado = normalizeText(rawEnunciado.toLowerCase());
            
            // Proteção extra para opções (caso alguma venha vazia)
            const textoOpcoes = q.opcoes ? q.opcoes.map(o => o.texto).join(' ') : '';
            const opcoes = normalizeText(textoOpcoes.toLowerCase());
            
            const resolucao = normalizeText((q.resolucao || '').toLowerCase());

            return enunciado.includes(searchTerm) || opcoes.includes(searchTerm) || resolucao.includes(searchTerm);
        }
        return true;
    });

    // 4. Ordenação
    const parseExameParaSort = (exameStr) => {
        const matchComParte = exameStr.match(/(\d{4})\/(\d)/);
        const matchRS = exameStr.match(/(\d{4})\/1 RS/);
        const matchAno = exameStr.match(/(\d{4})/);
        if (matchRS) return { ano: parseInt(matchRS[1]), parte: 1.5 };
        if (matchComParte) return { ano: parseInt(matchComParte[1]), parte: parseInt(matchComParte[2]) };
        if (matchAno) return { ano: parseInt(matchAno[1]), parte: 0 };
        return { ano: 0, parte: 0 };
    };

    filtradas.sort((a, b) => {
        const parsedA = parseExameParaSort(a.exame);
        const parsedB = parseExameParaSort(b.exame);
        if (sortOrder === 'crescente') {
            if (parsedA.ano !== parsedB.ano) return parsedA.ano - parsedB.ano;
            if (parsedA.parte !== parsedB.parte) return parsedA.parte - parsedB.parte;
            return a.id - b.id;
        } else { // decrescente
            if (parsedB.ano !== parsedA.ano) return parsedB.ano - parsedA.ano;
            if (parsedB.parte !== parsedA.parte) return parsedB.parte - parsedA.parte;
            return b.id - a.id;
        }
    });

    // 5. Atualiza UI
    infoSpan.textContent = `Exibindo ${filtradas.length} questões.`;
    listaCompletaFiltrada = filtradas;
    indiceAtual = 0;

    if (listaCompletaFiltrada.length === 0) {
        questoesContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Nenhuma questão encontrada.</p>';
        return;
    }

    renderizarLoteDeQuestoes();
    configurarObserver();
}

/**
 * Renderiza um lote (Lazy Loading)
 */
function renderizarLoteDeQuestoes() {
    const fim = Math.min(indiceAtual + TAMANHO_LOTE, listaCompletaFiltrada.length);
    const lote = listaCompletaFiltrada.slice(indiceAtual, fim);

    if (lote.length === 0) {
        if (observer) observer.disconnect();
        return;
    }

    let batchHTML = '';
    lote.forEach(questao => {
        let opcoesHTML = '';
        questao.opcoes.forEach(opcao => {
            opcoesHTML += `<li class="opcao-clicavel" data-letra="${opcao.letra}"><strong>(${opcao.letra})</strong> ${opcao.texto}</li>`;
        });

        const safeExameId = questao.exame.replace(/[^a-zA-Z0-9]/g, '-');
        const uniqueID = `resposta-${safeExameId}-${questao.id}`;
        const obsoletaTagHTML = questao.obsoleta ? '<span class="tag-obsoleta">Questão Obsoleta</span>' : '';
        const anuladaTagHTML = questao.anulada ? '<span class="tag-anulada">Questão Anulada</span>' : '';

        // Estilo via Mapa
        const disciplinaClassName = MAPA_CLASSES_CSS[questao.disciplina] || 'disciplina-padrao';
        const disciplinaTagHTML = `<span class="disciplina ${disciplinaClassName}">${questao.disciplina}</span>`;

        let ementasTagsHTML = '';
        if (questao.tags && Array.isArray(questao.tags)) {
            questao.tags.sort().forEach(tag => {
                ementasTagsHTML += `<span class="ementa-tag">${tag}</span>`;
            });
        }

        let resolucaoHTML = '';
        if (questao.resolucao && questao.resolucao.trim() !== '') {
            resolucaoHTML = `<div class="resolucao-texto"><strong>Resolução Comentada:</strong><br>${questao.resolucao}</div>`;
        } else {
            resolucaoHTML = `<div class="sem-resolucao">Esta questão ainda não possui uma resolução comentada. Gostaria de ajudar a construí-la? Acesse a aba "Sobre".</div>`;
        }

        let autorHTML = '';
        if (questao.autor_resolucao && questao.autor_resolucao.trim() !== '') {
            autorHTML = `<details class="autor-resolucao"><summary>Autor da Resolução</summary><p>${questao.autor_resolucao}</p></details>`;
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
            cpcHTML = `<details class="cpc-referencia"><summary>Normas (CPCs) Relacionadas</summary><ul>${cpcLinks}</ul></details>`;
        }

        let botaoLancamentosHTML = '';
        if (questao.lancamentos && Array.isArray(questao.lancamentos) && questao.lancamentos.length > 0) {
            const lancamentosJSON = JSON.stringify(questao.lancamentos).replace(/"/g, '&quot;');
            botaoLancamentosHTML = `<button class="btn-ver-lancamentos" data-lancamentos="${lancamentosJSON}">Lançamentos Contábeis</button>`;
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
                    ${botaoLancamentosHTML} ${resolucaoHTML} 
                    ${autorHTML} 
                    ${cpcHTML}
                </div>
            </div>
        `;
        batchHTML += cardHTML;
    });

    questoesContainer.insertAdjacentHTML('beforeend', batchHTML);
    indiceAtual = fim;
    adicionarEventosQuiz();
    questoesContainer.appendChild(sentinela);

    if (indiceAtual >= listaCompletaFiltrada.length) {
        if (observer) observer.disconnect();
        sentinela.remove();
    }
}

// -------------------------------------------------------------------
//   HELPERS E UTILITÁRIOS
// -------------------------------------------------------------------

function normalizeText(text) {
    if (typeof text !== 'string') return '';
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function handleIntersect(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) renderizarLoteDeQuestoes();
    });
}

function configurarObserver() {
    const options = { root: null, rootMargin: '200px', threshold: 0 };
    observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(sentinela);
}

function renderizarEnunciado(questao) {
    // 1. Proteção contra null/undefined
    if (!questao.enunciado) {
        return '<p class="enunciado" style="color:red;">Erro: Enunciado não encontrado.</p>';
    }

    // 2. NORMALIZAÇÃO (O "Pulo do Gato")
    // Se for Array (blocos), usa como está.
    // Se for String (texto simples), cria um array com um único bloco tipo 'p'
    const blocos = Array.isArray(questao.enunciado) 
        ? questao.enunciado 
        : [{ type: 'p', content: questao.enunciado }];

    let html = '';

    // 3. Agora o código sempre trabalha com lista, não importa o que veio no JSON
    blocos.forEach(bloco => {
        // Bloco de Texto (Parágrafo)
        if (bloco.type === 'p' || !bloco.type) {
             // O "content" pode ser o próprio bloco se for string antiga, ou a propriedade content
             const texto = bloco.content || bloco; 
             html += `<div class="enunciado-texto">${texto}</div>`;
        } 
        // Bloco de Tabela
        else if (bloco.type === 'table') {
            html += '<div class="table-wrapper"><table class="enunciado-table">';
            
            // Renderiza Cabeçalho
            if (bloco.headerRows) {
                html += '<thead>';
                bloco.headerRows.forEach(r => {
                    html += '<tr>';
                    r.forEach(c => {
                        // Suporte a objeto {content, colspan} ou string simples
                        const cellContent = c.content || c;
                        const colspan = c.colspan ? ` colspan="${c.colspan}"` : '';
                        const rowspan = c.rowspan ? ` rowspan="${c.rowspan}"` : '';
                        html += `<th${colspan}${rowspan}>${cellContent}</th>`;
                    });
                    html += '</tr>';
                });
                html += '</thead>';
            }

            // Renderiza Corpo
            if (bloco.bodyRows) {
                html += '<tbody>';
                bloco.bodyRows.forEach(r => {
                    html += '<tr>';
                    r.forEach(c => html += `<td>${c}</td>`);
                    html += '</tr>';
                });
                html += '</tbody>';
            }
            html += '</table></div>';
        }
    });

    return `<div class="enunciado">${html}</div>`;
}

function adicionarEventosQuiz() {
    const listasOpcoes = document.querySelectorAll('.opcoes-lista:not([data-listener-added])');
    listasOpcoes.forEach(ul => {
        ul.dataset.listenerAdded = 'true';
        ul.addEventListener('click', (e) => {
            const liClicado = e.target.closest('li.opcao-clicavel');
            if (!liClicado) return;

            const letraClicada = liClicado.getAttribute('data-letra');
            const card = ul.closest('.questao-card');
            const gabarito = card.getAttribute('data-gabarito');
            const targetId = ul.getAttribute('data-target-id');
            const respostaDiv = document.getElementById(targetId);
            const hint = card.querySelector('.quiz-hint');
            const isAlreadyActive = liClicado.classList.contains('opcao-correta') || liClicado.classList.contains('opcao-incorreta');

            ul.querySelectorAll('li.opcao-clicavel').forEach(li => li.classList.remove('opcao-correta', 'opcao-incorreta'));

            if (isAlreadyActive) {
                respostaDiv.style.display = 'none';
                if (hint) hint.style.display = 'block';
            } else {
                respostaDiv.style.display = 'block';
                if (hint) hint.style.display = 'none';
                if (letraClicada === gabarito) liClicado.classList.add('opcao-correta');
                else liClicado.classList.add('opcao-incorreta');
            }
        });
    });
}

function filtrarEmentasPorTexto() {
    const searchTerm = normalizeText(document.getElementById('search-ementas-input').value.toLowerCase());
    const grupos = document.querySelectorAll('#checkbox-container .ementa-group');

    grupos.forEach(grupo => {
        let visiveisNoGrupo = 0;
        grupo.querySelectorAll('.ementa-group-grid label').forEach(label => {
            if (normalizeText(label.textContent.toLowerCase()).includes(searchTerm)) {
                label.style.display = 'flex';
                visiveisNoGrupo++;
            } else {
                label.style.display = 'none';
            }
        });
        grupo.style.display = visiveisNoGrupo > 0 ? 'block' : 'none';
    });
}

function atualizarBotaoDisciplinas() {
    const checks = disciplinaCheckContainer.querySelectorAll('input[type="checkbox"]');
    if (!checks || checks.length === 0) {
        btnCheckAllDisciplinas.dataset.checked = 'false';
        btnCheckAllDisciplinas.textContent = "Marcar Todas";
        return;
    }
    const marcados = disciplinaCheckContainer.querySelectorAll('input[type="checkbox"]:checked').length;
    const newState = (checks.length > 0 && checks.length === marcados);
    btnCheckAllDisciplinas.dataset.checked = newState ? 'true' : 'false';
    btnCheckAllDisciplinas.textContent = newState ? "Desmarcar Todas" : "Marcar Todas";
}

function setupModalLancamentos() {
    const modalLancamentos = document.getElementById('modal-lancamentos');
    const modalBody = document.getElementById('modal-body');
    const btnFecharModal = document.getElementById('btn-fechar-modal');

    if(btnFecharModal) btnFecharModal.addEventListener('click', () => modalLancamentos.style.display = 'none');
    if(modalLancamentos) modalLancamentos.addEventListener('click', (e) => {
        if (e.target === modalLancamentos) modalLancamentos.style.display = 'none';
    });

    questoesContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ver-lancamentos');
        if (!btn) return;
        try {
            const lista = JSON.parse(btn.getAttribute('data-lancamentos'));
            let html = '';
            lista.forEach(lanc => {
                let linhas = '';
                if (lanc.debitos) lanc.debitos.forEach(d => linhas += `<div class="linha-contabil"><span class="conta-debito"><strong>D</strong> - ${d.conta}</span><span class="valor-contabil">${d.valor}</span></div>`);
                if (lanc.creditos) lanc.creditos.forEach(c => linhas += `<div class="linha-contabil"><span class="conta-credito"><strong>C</strong> - ${c.conta}</span><span class="valor-contabil">${c.valor}</span></div>`);
                html += `
                    <div class="lancamento-card">
                        <div class="lancamento-meta"><span>${lanc.titulo || 'Lançamento'}</span><span>${lanc.data || ''}</span></div>
                        <div class="lancamento-contas">${linhas}</div>
                        <div class="historico-contabil">(${lanc.historico || 'Sem histórico'})</div>
                    </div>`;
            });
            modalBody.innerHTML = html;
            modalLancamentos.style.display = 'flex';
        } catch (err) { console.error(err); }
    });
}

async function carregarChangelog() {
    const container = document.getElementById('changelog-content');
    if (!container) return;
    try {
        const response = await fetch('CHANGELOG.md');
        if (!response.ok) throw new Error("CHANGELOG.md não encontrado");
        const markdownText = await response.text();
        if (typeof marked !== 'undefined') container.innerHTML = marked.parse(markdownText);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="color: red;">Erro ao carregar o changelog.</p>`;
    }
}

async function carregarContribuidores() {
    if (!contributorsListContainer) return;
    contributorsListContainer.innerHTML = '<li>Carregando...</li>';
    try {
        const response = await fetch('contributors.json');
        if (!response.ok) throw new Error("contributors.json não encontrado");
        const data = await response.json();
        
        const creators = data.filter(c => c.roles.includes('Criador e mantenedor'));
        const placeholder = data.filter(c => c.roles.includes('pode aparecer aqui se você contribuir!'));
        const others = data.filter(c => !c.roles.includes('Criador e mantenedor') && !c.roles.includes('pode aparecer aqui se você contribuir!'));
        
        creators.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        others.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        
        const sortedList = [...creators, ...others, ...placeholder];
        let html = '';
        sortedList.forEach(contrib => {
            html += `<li><strong>${contrib.name}</strong> (${contrib.roles.join(', ')})`;
            if (contrib.link && contrib.link.url) html += ` - [<a href="${contrib.link.url}" target="_blank">${contrib.link.text}</a>]`;
            html += `</li>`;
        });
        contributorsListContainer.innerHTML = html;
    } catch (error) {
        contributorsListContainer.innerHTML = '<li style="color: red;">Erro ao carregar lista.</li>';
    }
}