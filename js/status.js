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

// --- 1. CONFIGURAÇÃO ---

// (NOVO) Lista de arquivos por edição de exame
const ARQUIVOS_EXAMES = [
    'exame/CFC_2025_02.json',
    //'etl/exportar/CFC_2025_01.json',
    //'etl/exportar/CFC_2024_02.json',
    // ... adicione os demais aqui
];

const QUESTIONS_PER_EXAM = 50;

let masterTableData = []; 
let questionMap = new Map(); 
let sortState = {
    column: 'edicao',  
    direction: 'asc' 
};

// --- 2. LÓGICA PRINCIPAL ---

document.addEventListener('DOMContentLoaded', async () => {
    const loadingMsg = document.getElementById('loading-message');
    const table = document.getElementById('status-table');

    try {
        // Passo 1: Carregar dados
        await loadAllData();

        // Passo 2: Gerar lista de exames
        const canonicalExams = generateCanonicalExamsList();

        // Passo 3: Criar dados da tabela
        masterTableData = buildMasterTableData(canonicalExams);

        // Lógica para atualizar a Barra de Progresso
        const totalQuestoesMestra = masterTableData.length; 
        const totalDisponiveis = questionMap.size; 
        const porcentagem = (totalDisponiveis / totalQuestoesMestra) * 100;

        const progressLabel = document.getElementById('progress-percentage');
        const progressSubLabel = document.getElementById('progress-sublabel');
        const progressBarFill = document.getElementById('progress-bar-fill');

        progressLabel.textContent = `${porcentagem.toFixed(1)}%`;
        progressSubLabel.textContent = `${totalDisponiveis} de ${totalQuestoesMestra} questões cadastradas`;

        setTimeout(() => {
            progressBarFill.style.width = `${porcentagem}%`;
        }, 100);

        // Passo 4: Fazer o sort e render INICIAL
        document.querySelector(`th[data-sort="${sortState.column}"]`).classList.add(sortState.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        sortData(masterTableData, sortState.column, sortState.direction);
        renderTable(masterTableData);

        // Passo 5: Configurar os cliques
        setupSorting(); 

        // Esconde o loading e mostra a tabela
        loadingMsg.style.display = 'none';
        table.style.display = 'table';

    } catch (error) {
        loadingMsg.innerHTML = `<p style="color: red;">Erro ao carregar dados: ${error.message}</p>`;
        console.error("Falha no processo:", error);
    }

});

/**
 * Passo 1: Carrega todos os JSONs
 */
async function loadAllData() {
    // ALTERAÇÃO AQUI: Usar ARQUIVOS_EXAMES diretamente
    const promessas = ARQUIVOS_EXAMES.map(async (caminhoArquivo) => {
        try {
            // ALTERAÇÃO AQUI: fetch recebe a string direto, não config.arquivo
            const response = await fetch(caminhoArquivo);
            if (!response.ok) {
                throw new Error(`Falha ao carregar ${caminhoArquivo}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return []; 
        }
    });

    const todosOsArraysDeQuestoes = await Promise.all(promessas);

    questionMap.clear();
    todosOsArraysDeQuestoes.forEach(disciplina => {
        disciplina.forEach(questao => {
            // 1. Se for o objeto de metadados, ignora e pula para o próximo
            if (questao.tipo === 'metadados_licenca') {
                return; 
            }

            // 2. Verificação de segurança: só processa se tiver 'exame' e 'id'
            if (questao.exame && questao.id) {
                const uniqueID = `${questao.exame}-${questao.id}`;
                questionMap.set(uniqueID, questao);
            }
        });
    });

    console.log(`Map de questões preenchido com ${questionMap.size} questões únicas.`);
}

/**
 * Passo 2: Gera a lista "mestra" de exames
 */
function generateCanonicalExamsList() {
    const exams = [];
    const currentYear = new Date().getFullYear(); 

    for (let y = 2011; y <= currentYear; y++) {
        if (y === 2012) {
            exams.push("CFC 2012/1"); 
        } else if (y === 2024) {
            exams.push("CFC 2024/1");
            exams.push("CFC 2024/2");
            exams.push("CFC 2024/1 RS");
        } else {
            exams.push(`CFC ${y}/1`);
            exams.push(`CFC ${y}/2`);
        }
    }
    return exams;
}

/**
 * Passo 3: Cria o array de dados para a tabela.
 */
function buildMasterTableData(canonicalExams) {
    const tableData = [];

    canonicalExams.forEach(exame => {
        for (let i = 1; i <= QUESTIONS_PER_EXAM; i++) {
            const uniqueID = `${exame}-${i}`;
            const question = questionMap.get(uniqueID);

            const hasResolucao = question && question.resolucao && question.resolucao.trim() !== "";

            tableData.push({
                id: uniqueID,
                disponivel: question ? 'Sim' : 'Não',
                edicao: exame,
                numero: i,
                resolucao: hasResolucao ? 'Sim' : 'Não'
            });
        }
    });

    return tableData;
}

/**
 * Passo 4: Renderiza o HTML da tabela.
 */
function renderTable(data) {
    const tableBody = document.getElementById('table-body');
    let html = '';

    data.forEach(row => {
        const dispClass = row.disponivel === 'Sim' ? 'status-sim' : 'status-nao';
        const resClass = row.resolucao === 'Sim' ? 'status-sim' : 'status-nao';

        html += `
            <tr>
                <td class="${dispClass}">${row.disponivel}</td>
                <td>${row.edicao}</td>
                <td>${row.numero}</td>
                <td class="${resClass}">${row.resolucao}</td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

/**
 * Passo 5: Configura a ordenação da tabela (CLIQUES).
 */
function setupSorting() {
    const headers = document.querySelectorAll('#status-table th[data-sort]');

    headers.forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');

            if (sortState.column === column) {
                sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.column = column;
                sortState.direction = 'asc';
            }

            sortData(masterTableData, sortState.column, sortState.direction);
            renderTable(masterTableData);

            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            th.classList.add(sortState.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        });
    });
}

// --- 3. LÓGICA DE ORDENAÇÃO (COM 3 NÍVEIS) ---

/**
 * Compara duas strings de edição de exame
 */
function compareEditions(edicaoA, edicaoB) {
    const matchA = edicaoA.match(/(\d{4})\/(.*)/);
    const matchB = edicaoB.match(/(\d{4})\/(.*)/);

    if (!matchA || !matchB) {
         return edicaoA.localeCompare(edicaoB);
    }

    const anoA = parseInt(matchA[1]);
    const anoB = parseInt(matchB[1]);

    if (anoA !== anoB) {
        return anoA - anoB;
    }

    return edicaoA.localeCompare(edicaoB);
}

/**
 * Função auxiliar para ordenar o array de dados.
 */
function sortData(data, column, direction) {
    const dirMod = direction === 'asc' ? 1 : -1;

    data.sort((a, b) => {
        let primaryResult = 0;
        if (column === 'edicao') {
            primaryResult = compareEditions(a.edicao, b.edicao);
        } else {
            primaryResult = a[column].localeCompare(b[column]);
        }

        if (primaryResult !== 0) {
            return primaryResult * dirMod;
        }

        let secondaryResult = 0;
        if (column === 'edicao') {
            secondaryResult = a.numero - b.numero;
        } else {
            secondaryResult = compareEditions(a.edicao, b.edicao);
        }

        if (secondaryResult !== 0) {
             return secondaryResult * dirMod;
        }

        let tertiaryResult = a.numero - b.numero;
        return tertiaryResult * dirMod;
    });
}