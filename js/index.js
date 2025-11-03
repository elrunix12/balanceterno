/*
 ____               _                   _   _    _____   ______   _______   ______   _____    _   _    ____  
|  _ \      /\     | |          /\     | \ | |  / ____| |  ____| |__   __| |  ____| |  __ \  | \ | |  / __ \ 
| |_) |    /  \    | |         /  \    |  \| | | |      | |__       | |    | |__    | |__) | |  \| | | |  | |
|  _ <    / /\ \   | |        / /\ \   | . ` | | |      |  __|      | |    |  __|   |  _  /  | . ` | | |  | |
| |_) |  / ____ \  | |____   / ____ \  | |\  | | |____  | |____     | |    | |____  | | \ \  | |\  | | |__| |
|____/  /_/    \_\ |______| /_/    \_\ |_| \_|  \_____| |______|    |_|    |______| |_|  \_\ |_| \_|  \____/ 
                                                                                             
*/
    // Copyright (C) 2025 Balanceterno
    // ... (Comentários da licença AGPL) ...
    
    
    // -------------------------------------------------------------------
    //   LÓGICA DA PÁGINA (Refatorada para Múltiplas Disciplinas)
    // -------------------------------------------------------------------
    
    /**
     * (MODIFICADO) Configuração das Disciplinas (com Cores)
     * - 'className' é a classe CSS que será aplicada
     */
    const configDisciplinas = {
        "Contabilidade Societária": {
            arquivo: 'disciplinas/contabilidade-societaria.json', 
            questoes: [],
            allTags: new Set(),
            className: 'disciplina-societaria' // Classe CSS para cor azul
        },
        "Contabilidade Gerencial": {
            arquivo: 'disciplinas/contabilidade-gerencial.json', 
            questoes: [],
            allTags: new Set(),
            className: 'disciplina-gerencial' // Classe CSS para cor verde
        },

        /*
        // Exemplo de como adicionar mais disciplinas no futuro:
        ,
        "Contabilidade de Custos": {
            arquivo: 'disciplinas/db_custos.json',
            questoes: [],
            allTags: new Set(),
            className: 'disciplina-custos' // (você precisaria criar essa classe no CSS)
        }
        */
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


    // Roda tudo quando a página carrega
    document.addEventListener('DOMContentLoaded', () => {

        // --- LÓGICA DAS TABS (com load-on-demand) ---
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
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
        // --- FIM: LÓGICA DAS TABS ---

        
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
        // --- FIM: LÓGICA PARA LINKS INTERNOS DAS TABS ---
        
        const btnToggleEmentas = document.getElementById('btn-toggle-ementas');
        const searchEmentasInput = document.getElementById('search-ementas-input');
        
        // --- LÓGICA DE OCULTAR E FILTRAR EMENTAS ---
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
        // --- FIM: LÓGICA DE OCULTAR E FILTRAR EMENTAS ---

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
        // --- FIM: LÓGICA DO TOOLTIP ---
        
        // --- LÓGICA DE CARREGAMENTO E FILTROS ---
        async function carregarDados() {
            const promessas = Object.entries(configDisciplinas).map(async ([nome, config]) => {
                try {
                    const response = await fetch(config.arquivo);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status} para ${config.arquivo}`);
                    }
                    const data = await response.json();
                    
                    config.questoes = data;
                    data.forEach(q => {
                        q.disciplina = nome; 
                        if (q.tags && Array.isArray(q.tags)) {
                            q.tags.forEach(tag => config.allTags.add(tag));
                        }
                    });
                    
                } catch (error) {
                    console.error(`Erro ao carregar a disciplina "${nome}" (${config.arquivo}):`, error);
                }
            });

            await Promise.all(promessas);

            // --- (NOVO) Carregar dados dos CPCs ---
            try {
                const response = await fetch('normas/cpcs.json'); // Ajuste o caminho se necessário
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} para cpcs.json`);
                }
                cpcData = await response.json();
            } catch (error) {
                console.error('Erro ao carregar cpcs.json:', error);
                cpcData = {}; // Garante que cpcData é um objeto e não falha
            }
            // --- Fim da nova seção ---

            renderizarFiltrosDeDisciplina();
            renderizarFiltrosDeExame(); 
            renderizarFiltrosDeEmenta(); 
            renderizarQuestoes(); 
        }
        carregarDados();
        carregarContribuidores();
        // --- FIM: LÓGICA DE CARREGAMENTO E FILTROS ---
        
        
        // --- Listeners para os filtros ---
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
            // --- (NOVO) Resolução comentada---
            document.getElementById('filter-resolucao').checked = false;
            
            sortAnoDropdown.value = 'decrescente';
            searchInput.value = '';
            document.getElementById('obsoleta-sim').checked = true;
            
            renderizarFiltrosDeEmenta();
            renderizarQuestoes();

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
                    if (check) {
                        check.checked = newState;
                    }
                }
            });
            btnCheckAllEmentas.dataset.checked = newState;
            btnCheckAllEmentas.textContent = newState ? "Desmarcar Todas" : "Marcar Todas";
            renderizarQuestoes();
        });

        sortAnoDropdown.addEventListener('change', renderizarQuestoes);
        searchInput.addEventListener('input', renderizarQuestoes);
        document.querySelectorAll('input[name="obsoleta-filter"]').forEach(radio => {
            radio.addEventListener('change', renderizarQuestoes);
        });

        // --- (NOVO) Filtrar por resolução ---
        const filterResolucaoCheck = document.getElementById('filter-resolucao');
        if (filterResolucaoCheck) {
            filterResolucaoCheck.addEventListener('change', renderizarQuestoes);
        }

        // --- FIM: Listeners ---
    });
    // --- FIM do DOMContentLoaded ---


    // 0. Função Helper para remover acentos
    function normalizeText(text) {
        if (typeof text !== 'string') return '';
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // 1. (MODIFICADO) Função para criar os checkboxes de DISCIPLINA (com Cores)
    function renderizarFiltrosDeDisciplina() {
        let filterHTML = '';
        const nomesDisciplinas = Object.keys(configDisciplinas).sort((a, b) => a.localeCompare(b, 'pt-BR'));
        
        nomesDisciplinas.forEach(nome => {
            const config = configDisciplinas[nome]; // Pega a config da disciplina
            const count = config.questoes.length;
            const className = config.className || ''; // Pega a classe CSS
            
            filterHTML += `
                <label class="${className}">
                    <input type="checkbox" class="disciplina-filter-check" value="${nome}">
                    ${nome} (${count})
                </label>
            `;
        });
        disciplinaCheckContainer.innerHTML = filterHTML;

        disciplinaCheckContainer.querySelectorAll('.disciplina-filter-check').forEach(check => {
            check.addEventListener('change', () => {
                renderizarFiltrosDeEmenta();
                renderizarQuestoes();
            });
        });
    }

    // 2. Função para criar os checkboxes de EMENTA
    function renderizarFiltrosDeEmenta() {
        const ementasMarcadasAnteriormente = new Set(
            Array.from(checkContainer.querySelectorAll('.filter-check:checked'))
                 .map(check => check.value)
        );
        const disciplinasSelecionadas = Array.from(
            disciplinaCheckContainer.querySelectorAll('.disciplina-filter-check:checked')
        ).map(check => check.value);

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

        btnCheckAllEmentas.style.display = 'inline-block';
        document.getElementById('search-ementas-input').parentElement.style.display = 'block';

        let finalHTML = ''; 
        disciplinasSelecionadas.sort((a, b) => a.localeCompare(b, 'pt-BR'));

        disciplinasSelecionadas.forEach(nomeDisciplina => {
            const tagsDaDisciplina = Array.from(configDisciplinas[nomeDisciplina].allTags).sort();
            if (tagsDaDisciplina.length === 0) return;

            let groupCheckboxHTML = ''; 
            tagsDaDisciplina.forEach(tag => {
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

        checkContainer.querySelectorAll('.filter-check').forEach(check => {
            check.addEventListener('change', renderizarQuestoes);
        });
        
        btnCheckAllEmentas.dataset.checked = 'false';
        btnCheckAllEmentas.textContent = 'Marcar Todas';
        
        filtrarEmentasPorTexto();
    }


    // 3. Função para criar os checkboxes de EXAME
    function renderizarFiltrosDeExame() {
        const masterExameSet = new Set();
        Object.values(configDisciplinas).forEach(config => {
            config.questoes.forEach(q => masterExameSet.add(q.exame));
        });

        const exames = Array.from(masterExameSet);
        
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
     * (NOVO) Helper para renderizar enunciados estruturados (com tabelas)
     * Mantém compatibilidade com enunciados antigos (string)
     * @param {object} questao - O objeto da questão
     * @returns {string} - O HTML final para o enunciado
     */
    /**
     * (ATUALIZADO) Helper para renderizar enunciados estruturados (com tabelas)
     * Agora com suporte a tabelas complexas (colspan/rowspan)
     * Mantém compatibilidade com enunciados antigos (string)
     * @param {object} questao - O objeto da questão
     * @returns {string} - O HTML final para o enunciado
     */
    function renderizarEnunciado(questao) {
        // Se 'enunciado_blocos' existir, use o novo renderizador
        if (questao.enunciado_blocos && Array.isArray(questao.enunciado_blocos)) {
            let html = '';
            questao.enunciado_blocos.forEach(bloco => {
                
                if (bloco.type === 'p') {
                    // Adiciona um parágrafo
                    html += `<p>${bloco.content}</p>`;
                
                } else if (bloco.type === 'table') {
                    
                    // Adiciona o wrapper para rolagem mobile
                    html += '<div class="table-wrapper">';
                    html += '<table class="enunciado-table">';
                    
                    // (NOVO) Renderiza o cabeçalho complexo (thead)
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
                    
                    // (NOVO) Renderiza o corpo da tabela (tbody)
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
                    
                    // Fecha o wrapper
                    html += '</div>';
                }
            });
            // Retorna o conteúdo estruturado dentro de um DIV
            return `<div class="enunciado">${html}</div>`;
        }
    
        // Fallback: Se 'enunciado_blocos' não existir, use o 'enunciado' antigo
        if (questao.enunciado) {
            return `<p class="enunciado">${questao.enunciado}</p>`;
        }
        
        return '<p class="enunciado" style="color:red;">Erro: Enunciado não encontrado.</p>';
    }
    
    // 4. (MODIFICADO) Função principal para filtrar e mostrar as questões (com Cores e Autor)
    function renderizarQuestoes() {
        const filtrosDisciplina = Array.from(
            disciplinaCheckContainer.querySelectorAll('.disciplina-filter-check:checked')
        ).map(check => check.value);

        if (filtrosDisciplina.length === 0) {
            questoesContainer.innerHTML = ''; 
            questoesContainer.style.display = 'none'; 
            initialPrompt.style.display = 'block'; 
            infoSpan.textContent = ''; 
            return;
        }
        
        questoesContainer.style.display = 'block';
        initialPrompt.style.display = 'none';

        // ... (Pega todos os outros filtros) ...
        const filtrosEmenta = Array.from(
            checkContainer.querySelectorAll('.filter-check:checked')
        ).map(check => check.value);
        const examesSelecionados = Array.from(
            exameCheckContainer.querySelectorAll('.exame-filter-check:checked')
        ).map(check => check.value);
        const sortOrder = sortAnoDropdown.value;
        const searchTerm = normalizeText(searchInput.value.toLowerCase().trim());
        const mostrarObsoletas = document.querySelector('input[name="obsoleta-filter"]:checked').value;

        // --- (NOVO) Resolução comentada ---
        const apenasComResolucao = document.getElementById('filter-resolucao').checked;

        // ... (Lógica de filtragem principal) ...
        let questoesParaFiltrar = [];
        filtrosDisciplina.forEach(nome => {
            questoesParaFiltrar.push(...configDisciplinas[nome].questoes);
        });
        const totalQuestoesDasDisciplinas = questoesParaFiltrar.length;
        
        if (mostrarObsoletas === 'nao') {
            questoesParaFiltrar = questoesParaFiltrar.filter(questao => !questao.obsoleta);
        }
        // --- (NOVO) Resolução comentada ---
        if (apenasComResolucao) {
            questoesParaFiltrar = questoesParaFiltrar.filter(questao => 
                questao.resolucao && questao.resolucao.trim() !== ''
            );
        }
        if (filtrosEmenta.length > 0) {
            questoesParaFiltrar = questoesParaFiltrar.filter(questao => {
                return filtrosEmenta.some(filtro => questao.tags && questao.tags.includes(filtro));
            });
        }
        if (examesSelecionados.length > 0) {
            questoesParaFiltrar = questoesParaFiltrar.filter(questao => {
                return examesSelecionados.includes(questao.exame);
            });
        }
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

        // ... (Lógica de ordenação) ...
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
            } else {
                if (parsedB.ano !== parsedA.ano) return parsedB.ano - parsedA.ano; 
                if (parsedB.parte !== parsedA.parte) return parsedB.parte - parsedB.parte;
                return b.id - a.id;
            }
        });

        // ... (Atualiza infoSpan) ...
        const totalMostrando = questoesParaFiltrar.length;
        if (totalMostrando === totalQuestoesDasDisciplinas && totalMostrando > 0) {
            infoSpan.textContent = `Exibindo todas as ${totalQuestoesDasDisciplinas} questões das disciplinas selecionadas.`;
        } else {
            infoSpan.textContent = `Exibindo ${totalMostrando} de ${totalQuestoesDasDisciplinas} questões (das disciplinas selecionadas).`;
        }

        // ... (Renderização das Questões) ...
        questoesContainer.innerHTML = '';
        if (questoesParaFiltrar.length === 0) {
            questoesContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Nenhuma questão encontrada com os filtros selecionados.</p>';
            return; 
        }

        questoesParaFiltrar.forEach(questao => {
            let opcoesHTML = '';
            questao.opcoes.forEach(opcao => {
                opcoesHTML += `<li class="opcao-clicavel" data-letra="${opcao.letra}"><strong>(${opcao.letra})</strong> ${opcao.texto}</li>`;
            });

            const safeExameId = questao.exame.replace(/[^a-zA-Z0-9]/g, '-'); 
            const uniqueID = `resposta-${safeExameId}-${questao.id}`; 
            const obsoletaTagHTML = questao.obsoleta ? '<span class="tag-obsoleta">Questão Obsoleta</span>' : '';
            
            // --- (MODIFICADO) Pega a classe da disciplina para a cor ---
            const config = configDisciplinas[questao.disciplina];
            const disciplinaClassName = (config && config.className) ? config.className : '';
            const disciplinaTagHTML = `<span class="disciplina ${disciplinaClassName}">${questao.disciplina}</span>`;

            // --- (NOVO) Cria as tags de Ementa para o card ---
            let ementasTagsHTML = '';
            if (questao.tags && Array.isArray(questao.tags)) {
                // Ordena as tags alfabeticamente para consistência
                const sortedTags = [...questao.tags].sort(); 
                sortedTags.forEach(tag => {
                    ementasTagsHTML += `<span class="ementa-tag">${tag}</span>`;
                });
            }
            // --- Fim da nova seção ---
            
            // HTML da Resolução
            let resolucaoHTML = '';
            if (questao.resolucao && questao.resolucao.trim() !== '') {
                resolucaoHTML = `<div class="resolucao-texto"><strong>Resolução Comentada:</strong><br>${questao.resolucao}</div>`;
            } else {
                resolucaoHTML = `<div class="sem-resolucao">Esta questão ainda não possui uma resolução comentada. Gostaria de ajudar a construí-la? Acesse a aba "Sobre" e saiba como!</div>`;
            }
            
            // --- (NOVO) HTML do Autor (só aparece se existir) ---
            let autorHTML = '';
            if (questao.autor_resolucao && questao.autor_resolucao.trim() !== '') {
                autorHTML = `
                    <details class="autor-resolucao">
                        <summary>Autor da Resolução</summary>
                        <p>${questao.autor_resolucao}</p>
                    </details>
                `;
            }

            // --- (NOVO) HTML das Referências CPC ---
            let cpcHTML = '';
            let cpcLinks = '';
            
            // Verifica se a questão tem tags E se o cpcData foi carregado
            if (questao.tags && cpcData) {
                questao.tags.forEach(tag => {
                    const cpcInfo = cpcData[tag]; // Procura a tag no JSON dos CPCs
                    if (cpcInfo) {
                        // Se achar, cria um item de lista com o link
                        cpcLinks += `<li><a href="${cpcInfo.url}" target="_blank" rel="noopener noreferrer">${cpcInfo.cpc} - ${tag}</a></li>`;
                    }
                });
            }
            
            // Se foi encontrado algum link, cria o menu suspenso
            if (cpcLinks) {
                cpcHTML = `
                    <details class="cpc-referencia">
                        <summary>Normas (CPCs) Relacionadas</summary>
                        <ul>${cpcLinks}</ul>
                    </details>
                `;
            }
            // --- Fim da nova seção ---
            
            const cardHTML = `
                <div class="questao-card" data-gabarito="${questao.gabarito}">
                    <div class="questao-header">
                        <h4>Questão ${questao.id}</h4>
                        <div class="questao-meta">
                            <span>${questao.exame}</span> 
                            <span class="banca">${questao.banca}</span> 
                            ${obsoletaTagHTML} 
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
            questoesContainer.innerHTML += cardHTML;
        });

        adicionarEventosQuiz();
    }

    // 5. Função para fazer o modo "estudo" (com toggle) funcionar
    function adicionarEventosQuiz() {
        const listasOpcoes = document.querySelectorAll('.opcoes-lista');

        listasOpcoes.forEach(ul => {
            ul.addEventListener('click', (e) => {
                const liClicado = e.target.closest('li.opcao-clicavel');
                if (!liClicado) { return; }

                const letraClicada = liClicado.getAttribute('data-letra');
                const card = ul.closest('.questao-card');
                const gabarito = card.getAttribute('data-gabarito');
                const targetId = ul.getAttribute('data-target-id');
                const respostaDiv = document.getElementById(targetId);
                const hint = card.querySelector('.quiz-hint');

                const isAlreadyActive = liClicado.classList.contains('opcao-correta') || liClicado.classList.contains('opcao-incorreta');

                ul.querySelectorAll('li.opcao-clicavel').forEach(li => {
                    li.classList.remove('opcao-correta', 'opcao-incorreta');
                });

                if (isAlreadyActive) {
                    respostaDiv.style.display = 'none';
                    if (hint) hint.style.display = 'block';
                } else {
                    respostaDiv.style.display = 'block';
                    if (hint) hint.style.display = 'none';

                    if (letraClicada === gabarito) {
                        liClicado.classList.add('opcao-correta');
                    } else {
                        liClicado.classList.add('opcao-incorreta');
                    }
                }
            });
        });
    }
    
    // 6. Função para filtrar as ementas visíveis baseado no input
    function filtrarEmentasPorTexto() {
        const searchTerm = normalizeText(document.getElementById('search-ementas-input').value.toLowerCase());
        const grupos = document.querySelectorAll('#checkbox-container .ementa-group');

        grupos.forEach(grupo => {
            let visiveisNoGrupo = 0;
            const labels = grupo.querySelectorAll('.ementa-group-grid label');

            labels.forEach(label => {
                const labelText = normalizeText(label.textContent.toLowerCase());
                
                if (labelText.includes(searchTerm)) {
                    label.style.display = 'flex'; 
                    visiveisNoGrupo++;
                } else {
                    label.style.display = 'none';
                }
            });

            if (visiveisNoGrupo > 0) {
                grupo.style.display = 'block';
            } else {
                grupo.style.display = 'none';
            }
        });
    }

    
    // --- LÓGICA PARA CARREGAR CHANGELOG ---
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
            
            const html = marked.parse(markdownText);
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Erro ao carregar o changelog:', error);
            container.innerHTML = `<p style="color: red;">Erro ao carregar o changelog. Verifique se o arquivo <code>CHANGELOG.md</code> existe na raiz do projeto.</p>`;
        }
    }

    /**
     * (NOVO) Carrega a lista de contribuidores do JSON
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

            // --- (NOVO) Lógica de Ordenação Híbrida ---
            
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

            // 2. Ordena alfabeticamente (usando localeCompare para pt-BR)
            creators.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
            otherContributors.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

            // 3. Junta as listas na ordem desejada: Criadores, Outros, Placeholder
            const sortedList = [...creators, ...otherContributors, ...placeholder];
            
            // --- Fim da Lógica de Ordenação ---

            let html = '';
            // Agora, itera sobre a 'sortedList' em vez de 'data'
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