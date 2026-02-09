/* js/simulador.js - Versão Com Salvamento de Sessão (LocalStorage) */

const PASTA_EXAMES = 'exames/';
const LISTA_ARQUIVOS = [
    'CFC_2022_01.json',
    'CFC_2022_02.json',
    'CFC_2023_01.json',
    'CFC_2023_02.json',
    'CFC_2024_01.json',
    'CFC_2024_01_RS.json',
    'CFC_2024_02.json',
    'CFC_2025_01.json',
    'CFC_2025_02.json'
];

const CHAVE_STORAGE = 'balanceterno_progresso_simulado'; // Nome do "arquivo" no navegador

const Simulador = {
    dadosCompletos: [],
    questoesAtuais: [],
    respostasUsuario: {}, 
    indiceAtual: 0,
    modoAtual: '',
    
    // Controle de Tempo
    timerInterval: null,
    segundosDecorridos: 0, // Novo controle de tempo acumulado

    // =========================================================================
    // 1. INICIALIZAÇÃO
    // =========================================================================
    
    init: async function() {
        console.log("Iniciando...");
        
        if (typeof carregarRodape === 'function') {
            carregarRodape();
        }

        try {
            const promises = LISTA_ARQUIVOS.map(arquivo => 
                fetch(PASTA_EXAMES + arquivo)
                    .then(r => r.ok ? r.json() : [])
                    .catch(err => [])
            );

            const resultados = await Promise.all(promises);
            this.dadosCompletos = resultados.flat();

            if (this.dadosCompletos.length === 0) return alert("Erro crítico: Nenhuma questão carregada.");
            
            this.carregarOpcoesDeExame();

            // VERIFICA SE HÁ PROGRESSO SALVO
            this.verificarProgressoSalvo();

        } catch (error) {
            console.error("Erro fatal:", error);
            alert("Erro ao carregar sistema.");
        }
    },

    carregarOpcoesDeExame: function() {
        const select = document.getElementById('select-edicao');
        const examesUnicos = [...new Set(this.dadosCompletos.map(q => q.exame))]
            .filter(Boolean).sort().reverse();
        
        select.innerHTML = '<option value="">Selecione uma edição...</option>';
        examesUnicos.forEach(exame => {
            const option = document.createElement('option');
            option.value = exame;
            option.textContent = exame;
            select.appendChild(option);
        });
    },

    // =========================================================================
    // 2. SISTEMA DE SAVE / LOAD (LOCALSTORAGE)
    // =========================================================================

    salvarProgresso: function() {
        // Cria um objeto com tudo que precisamos para restaurar a prova
        const estado = {
            questoesAtuais: this.questoesAtuais,
            respostasUsuario: this.respostasUsuario,
            indiceAtual: this.indiceAtual,
            modoAtual: this.modoAtual,
            segundosDecorridos: this.segundosDecorridos,
            dataSalvo: new Date().getTime()
        };

        try {
            localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
        } catch (e) {
            console.warn("Não foi possível salvar o progresso (Armazenamento cheio ou bloqueado).");
        }
    },

    verificarProgressoSalvo: function() {
        const salvo = localStorage.getItem(CHAVE_STORAGE);
        
        if (salvo) {
            const dados = JSON.parse(salvo);
            const dataSalvo = new Date(dados.dataSalvo).toLocaleString();
            
            // Pergunta ao usuário
            const aceitou = confirm(
                `Encontramos um simulado não finalizado de ${dataSalvo}.\n\n` +
                `Modo: ${dados.modoAtual === 'rapido' ? 'Rápido' : 'Prova Real'}\n` +
                `Questões Respondidas: ${Object.keys(dados.respostasUsuario).length} de ${dados.questoesAtuais.length}\n\n` +
                `Deseja continuar de onde parou?`
            );

            if (aceitou) {
                this.restaurarSessao(dados);
            } else {
                localStorage.removeItem(CHAVE_STORAGE); // Limpa se ele não quiser continuar
            }
        }
    },

    restaurarSessao: function(dados) {
        this.questoesAtuais = dados.questoesAtuais;
        this.respostasUsuario = dados.respostasUsuario;
        this.indiceAtual = dados.indiceAtual;
        this.modoAtual = dados.modoAtual;
        this.segundosDecorridos = dados.segundosDecorridos || 0;

        this.comecarQuiz(true); // true indica que é uma restauração
    },

    limparProgresso: function() {
        localStorage.removeItem(CHAVE_STORAGE);
    },

    // =========================================================================
    // 3. MODOS DE SIMULADO
    // =========================================================================

    iniciarModoRapido: function() {
        this.modoAtual = 'rapido';
        const selecionadas = [];
        const porDisciplina = {};
        
        // Filtra e ignora anuladas
        const poolValido = this.dadosCompletos.filter(q => q.anulada !== true && q.gabarito !== '*' && q.gabarito !== 'X');

        poolValido.forEach(q => {
            const disc = q.disciplina ? q.disciplina.trim() : "Outros";
            if (!porDisciplina[disc]) porDisciplina[disc] = [];
            porDisciplina[disc].push(q);
        });

        if (porDisciplina["Contabilidade Geral e NBCs"]) {
            selecionadas.push(...this.embaralharArray(porDisciplina["Contabilidade Geral e NBCs"]).slice(0, 5));
        }

        const outras = [
            "Auditoria Contábil", "Contabilidade Aplicada ao Setor Público", "Contabilidade de Custos",
            "Contabilidade Gerencial", "Controladoria", "Legislação e Ética Profissional",
            "Língua Portuguesa Aplicada", "Matemática Financeira e Estatística",
            "Noções de Direito e Legislação Aplicada", "Perícia Contábil", "Teoria da Contabilidade"
        ];

        outras.forEach(d => {
            if (porDisciplina[d] && porDisciplina[d].length > 0) {
                selecionadas.push(this.embaralharArray(porDisciplina[d])[0]);
            }
        });

        this.questoesAtuais = this.embaralharArray(selecionadas);
        if (this.questoesAtuais.length === 0) return alert("Erro: Questões insuficientes.");
        
        this.segundosDecorridos = 0; // Reseta tempo
        this.comecarQuiz();
    },

    iniciarModoReal: function() {
        const exame = document.getElementById('select-edicao').value;
        if (!exame) return alert("Selecione uma edição.");

        this.modoAtual = 'real';
        this.questoesAtuais = this.dadosCompletos.filter(q => q.exame === exame);
        if (this.questoesAtuais.length === 0) return alert("Nenhuma questão encontrada.");

        this.segundosDecorridos = 0; // Reseta tempo
        this.comecarQuiz();
    },

    embaralharArray: function(array) {
        const novo = [...array]; 
        for (let i = novo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [novo[i], novo[j]] = [novo[j], novo[i]];
        }
        return novo;
    },

    // =========================================================================
    // 4. RENDERIZAÇÃO
    // =========================================================================

    formatarEnunciado: function(conteudo) {
        if (!conteudo) return '';
        if (typeof conteudo === 'string') return conteudo;
        if (Array.isArray(conteudo)) return conteudo.map(item => this.processarItem(item)).join('');
        if (typeof conteudo === 'object') return this.processarItem(conteudo);
        return '';
    },

    processarItem: function(item) {
        if (!item) return '';
        if (typeof item === 'string') return `<p>${item}</p>`;

        if (typeof item === 'object') {
            if (item.type === 'table' || item.tabela) return this.renderizarTabela(item);
            
            if (item.type === 'img' || item.type === 'image') {
                return `<div style="text-align:center; margin: 15px 0;">
                            <img src="${item.src}" alt="${item.alt || 'Imagem'}" style="max-width:100%; border:1px solid #ddd; padding:5px;">
                        </div>`;
            }

            if (['list', 'ul', 'ol'].includes(item.type)) {
                const tag = (item.type === 'ol') ? 'ol' : 'ul';
                const lista = item.items || item.content || [];
                const itensHtml = Array.isArray(lista) 
                    ? lista.map(li => `<li>${typeof li === 'string' ? li : this.formatarEnunciado(li)}</li>`).join('') 
                    : '';
                return `<${tag}>${itensHtml}</${tag}>`;
            }

            if (item.content) {
                const conteudoInterno = this.formatarEnunciado(item.content);
                return (item.type === 'p') ? `<p>${conteudoInterno}</p>` : conteudoInterno;
            }
        }
        return '';
    },

    renderizarTabela: function(tabelaObj) {
        const headers = tabelaObj.headerRows || tabelaObj.cabecalho || tabelaObj.headers || [];
        const body = tabelaObj.bodyRows || tabelaObj.dados || tabelaObj.linhas || tabelaObj.rows || [];

        let html = `<div class="table-responsive"><table class="enunciado-table">`;
        if (headers.length > 0) {
            html += `<thead>`;
            headers.forEach(row => {
                const colunas = Array.isArray(row) ? row : [row];
                html += `<tr>`;
                colunas.forEach(cell => {
                    if (typeof cell === 'object' && cell !== null) {
                        const texto = cell.content || '';
                        const colspan = cell.colspan ? ` colspan="${cell.colspan}"` : '';
                        const rowspan = cell.rowspan ? ` rowspan="${cell.rowspan}"` : '';
                        html += `<th${colspan}${rowspan}>${texto}</th>`;
                    } else {
                        html += `<th>${cell}</th>`;
                    }
                });
                html += `</tr>`;
            });
            html += `</thead>`;
        }
        if (body.length > 0) {
            html += `<tbody>`;
            body.forEach(row => {
                html += `<tr>`;
                let celulas = [];
                if (Array.isArray(row)) celulas = row;
                else if (typeof row === 'object') celulas = Object.values(row);
                celulas.forEach(cell => {
                    if (typeof cell === 'object' && cell !== null) {
                        const texto = cell.content || '';
                        const colspan = cell.colspan ? ` colspan="${cell.colspan}"` : '';
                        const rowspan = cell.rowspan ? ` rowspan="${cell.rowspan}"` : '';
                        html += `<td${colspan}${rowspan}>${texto}</td>`;
                    } else {
                        html += `<td>${cell}</td>`;
                    }
                });
                html += `</tr>`;
            });
            html += `</tbody>`;
        }
        html += `</table></div>`;
        return html;
    },

    // =========================================================================
    // 5. CONTROLE DO QUIZ
    // =========================================================================

    comecarQuiz: function(ehRestauracao = false) {
        document.getElementById('tela-inicial').style.display = 'none';
        document.getElementById('tela-quiz').style.display = 'block';
        document.getElementById('tela-resultado').style.display = 'none';
        
        // Se NÃO for restauração, reseta as variáveis
        if (!ehRestauracao) {
            this.indiceAtual = 0;
            this.respostasUsuario = {};
        }
        
        this.iniciarTimer();
        this.renderizarQuestao();
        
        // Salva estado inicial
        this.salvarProgresso();
    },

    renderizarQuestao: function() {
        const questao = this.questoesAtuais[this.indiceAtual];
        const areaQuestao = document.getElementById('area-questao');
        
        document.getElementById('progresso-texto').innerText = `Questão ${this.indiceAtual + 1} de ${this.questoesAtuais.length}`;
        const pct = ((this.indiceAtual + 1) / this.questoesAtuais.length) * 100;
        document.getElementById('barra-progresso-fill').style.width = `${pct}%`;

        const respostaSalva = this.respostasUsuario[this.indiceAtual];

        let htmlOpcoes = '';
        questao.opcoes.forEach(opt => {
            const isSelected = respostaSalva === opt.letra ? 'selecionada' : '';
            htmlOpcoes += `
                <div class="opcao-container ${isSelected}" onclick="Simulador.selecionarOpcao('${opt.letra}', this)">
                    <div class="letra-opcao">${opt.letra}</div>
                    <div class="texto-opcao">${opt.texto}</div>
                </div>`;
        });

        const enunciadoHtml = this.formatarEnunciado(questao.enunciado);
        const badgeExame = `<span class="tag-disciplina" style="background-color:#eee; color:#333; margin-left:5px;">${questao.exame || ''}</span>`;

        areaQuestao.innerHTML = `
            <div><span class="tag-disciplina">${questao.disciplina}</span>${this.modoAtual === 'rapido' ? badgeExame : ''}</div>
            <div class="enunciado-texto">${enunciadoHtml}</div>
            <div class="lista-opcoes">${htmlOpcoes}</div>
        `;

        document.getElementById('btn-anterior').disabled = this.indiceAtual === 0;
        const ehUltima = this.indiceAtual === this.questoesAtuais.length - 1;
        document.getElementById('btn-proximo').style.display = ehUltima ? 'none' : 'inline-block';
        document.getElementById('btn-finalizar').style.display = ehUltima ? 'inline-block' : 'none';
    },

    selecionarOpcao: function(letra, elementoHtml) {
        this.respostasUsuario[this.indiceAtual] = letra;
        document.querySelectorAll('.opcao-container').forEach(div => div.classList.remove('selecionada'));
        elementoHtml.classList.add('selecionada');
        
        // SALVA AUTOMATICAMENTE APÓS RESPONDER
        this.salvarProgresso();
    },

    proximo: function() {
        if (this.indiceAtual < this.questoesAtuais.length - 1) {
            this.indiceAtual++;
            this.renderizarQuestao();
            this.salvarProgresso(); // Salva ao navegar
        }
    },

    anterior: function() {
        if (this.indiceAtual > 0) {
            this.indiceAtual--;
            this.renderizarQuestao();
            this.salvarProgresso(); // Salva ao navegar
        }
    },

    iniciarTimer: function() {
        const display = document.getElementById('timer');
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // Atualiza a cada segundo
        this.timerInterval = setInterval(() => {
            this.segundosDecorridos++;
            
            const min = Math.floor(this.segundosDecorridos / 60);
            const sec = this.segundosDecorridos % 60;
            display.textContent = `Tempo: ${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
            
            // Salva o tempo a cada 5 segundos para não sobrecarregar o storage
            if (this.segundosDecorridos % 5 === 0) {
                this.salvarProgresso();
            }

        }, 1000);
    },

    finalizar: function() {
        clearInterval(this.timerInterval);
        
        const respondidas = Object.keys(this.respostasUsuario).length;
        if (respondidas < this.questoesAtuais.length) {
            if(!confirm(`Você respondeu apenas ${respondidas} de ${this.questoesAtuais.length} questões. Deseja finalizar mesmo assim?`)) {
                this.iniciarTimer(); // Retoma o timer se cancelar
                return; 
            }
        }
        
        // LIMPA O SAVE AO FINALIZAR
        this.limparProgresso();
        this.calcularResultado();
    },

    // =========================================================================
    // 6. RESULTADO
    // =========================================================================

    calcularResultado: function() {
        let acertos = 0;
        let totalValidas = 0;
        let htmlRelatorio = '';
        
        // Objeto para guardar estatísticas por disciplina
        // Estrutura: { "Auditoria": { total: 0, acertos: 0 }, ... }
        let statsPorDisciplina = {};

        // Data e Hora
        const agora = new Date();
        const dataFormatada = agora.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'medium' });
        const divData = document.getElementById('data-hora-resultado');
        if(divData) divData.innerText = `Realizado em: ${dataFormatada}`;

        // === LOOP PRINCIPAL ===
        this.questoesAtuais.forEach((questao, index) => {
            const respostaDada = this.respostasUsuario[index];
            const gabaritoCorreto = questao.gabarito ? questao.gabarito.trim().toUpperCase() : "?"; 
            const isAnulada = questao.anulada === true || gabaritoCorreto === '*' || gabaritoCorreto === 'X';
            
            // Inicializa a disciplina no objeto de stats se não existir
            const disciplina = questao.disciplina || "Outras";
            if (!statsPorDisciplina[disciplina]) {
                statsPorDisciplina[disciplina] = { total: 0, acertos: 0 };
            }

            let statusClass = '', statusIcon = '';

            if (isAnulada) {
                statusClass = 'anulada';
                statusIcon = '⚠️ ANULADA';
                // Anuladas NÃO entram na estatística da disciplina (nem total, nem acerto)
            } else {
                // Contabiliza para a disciplina
                statsPorDisciplina[disciplina].total++;
                totalValidas++; // Contabiliza geral

                if (!respostaDada) {
                    statusClass = 'nao-respondida';
                    statusIcon = '⚪ Não respondeu';
                } else if (respostaDada === gabaritoCorreto) {
                    acertos++;
                    // Contabiliza acerto na disciplina
                    statsPorDisciplina[disciplina].acertos++;
                    
                    statusClass = 'acertou';
                    statusIcon = '✅ Acertou';
                } else {
                    statusClass = 'errou';
                    statusIcon = '❌ Errou';
                }
            }

            // ... (Código de renderização do enunciado/opções mantido igual) ...
            const enunciadoHtml = this.formatarEnunciado(questao.enunciado);
            let opcoesHtml = '<div class="relatorio-opcoes">';
            questao.opcoes.forEach(opt => {
                let classeOpcao = 'opcao-relatorio';
                let iconeOpcao = '';
                if (!isAnulada) {
                    if (opt.letra === gabaritoCorreto) { classeOpcao += ' op-correta'; iconeOpcao = '✔'; }
                    if (opt.letra === respostaDada) {
                        classeOpcao += ' op-selecionada';
                        if (respostaDada !== gabaritoCorreto) { classeOpcao += ' op-errada'; iconeOpcao = '✖'; }
                    }
                } else {
                    if (opt.letra === respostaDada) classeOpcao += ' op-selecionada';
                }
                opcoesHtml += `
                    <div class="${classeOpcao}">
                        <span class="letra-bd">${opt.letra}</span>
                        <span class="texto-bd">${opt.texto}</span>
                        <span class="icone-bd">${iconeOpcao}</span>
                    </div>`;
            });
            opcoesHtml += '</div>';

            // Resolução Comentada
            let resolucaoHtml = '';
            if (questao.resolucao && questao.resolucao.length > 0) {
                const textoResolucao = this.formatarEnunciado(questao.resolucao);
                const autorHtml = questao.autor_resolucao ? `<span class="autor-resolucao">Por: ${questao.autor_resolucao}</span>` : '';
                resolucaoHtml = `<div class="box-resolucao"><h4>🎓 Resolução Comentada</h4><div class="conteudo-resolucao">${textoResolucao}</div>${autorHtml}</div>`;
            }

            htmlRelatorio += `
                <div class="gabarito-item ${statusClass}">
                    <div class="cabecalho-questao-relatorio">
                        <div><strong>Questão ${index + 1}</strong> <span class="badge-id">ID: ${questao.id}</span> <span class="badge-exame">${questao.exame || ''}</span></div>
                        <div class="status-badge">${statusIcon}</div>
                    </div>
                    <div class="disciplina-relatorio">${questao.disciplina}</div>
                    <div class="enunciado-relatorio">${enunciadoHtml}</div>
                    ${opcoesHtml}
                    ${resolucaoHtml}
                </div>`;
        });

        // === GERAÇÃO DA TABELA DE ESTATÍSTICAS ===
        
        // Transforma objeto em array e ordena (Quem tem mais questões primeiro)
        const arrayStats = Object.entries(statsPorDisciplina)
            .map(([nome, dados]) => ({ nome, ...dados }))
            .filter(item => item.total > 0) // Remove disciplinas que só tiveram questões anuladas
            .sort((a, b) => b.total - a.total);

        let htmlStats = `
            <h3>Desempenho por Disciplina</h3>
            <table class="tabela-stats">
                <thead>
                    <tr>
                        <th>Disciplina</th>
                        <th>Acertos</th>
                        <th class="col-barra">Desempenho</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
        `;

        arrayStats.forEach(stat => {
            const pct = (stat.acertos / stat.total) * 100;
            const pctFormatado = pct.toFixed(0);
            
            // Define cor da barra
            let classeCor = 'fill-ruim'; // < 50%
            if (pct >= 50) classeCor = 'fill-medio'; // 50-69%
            if (pct >= 70) classeCor = 'fill-bom';   // 70%+

            htmlStats += `
                <tr>
                    <td>${stat.nome}</td>
                    <td>${stat.acertos} / ${stat.total}</td>
                    <td>
                        <div class="progress-track">
                            <div class="progress-fill ${classeCor}" style="width: ${pct}%"></div>
                        </div>
                    </td>
                    <td><strong>${pctFormatado}%</strong></td>
                </tr>
            `;
        });
        htmlStats += `</tbody></table>`;

        // Injeta o HTML das estatísticas
        document.getElementById('stats-container').innerHTML = htmlStats;


        // === FINALIZAÇÃO TELA ===
        document.getElementById('tela-quiz').style.display = 'none';
        document.getElementById('tela-resultado').style.display = 'block';

        const percentualGeral = totalValidas > 0 ? ((acertos / totalValidas) * 100).toFixed(1) : "0.0";
        document.getElementById('score-acertos').textContent = `${acertos} / ${totalValidas}`;
        document.getElementById('score-percentual').textContent = `${percentualGeral}%`;
        document.getElementById('lista-gabarito').innerHTML = htmlRelatorio;

        const msgDiv = document.getElementById('mensagem-final');
        msgDiv.innerHTML = percentualGeral >= 50 
            ? "<h3 style='color:green'>Aprovado! Parabéns!</h3>" 
            : "<h3 style='color:orange'>Não foi dessa vez. Continue estudando!</h3>";
    }
};

document.addEventListener('DOMContentLoaded', () => Simulador.init());