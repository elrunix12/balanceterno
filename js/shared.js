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

document.addEventListener('DOMContentLoaded', () => {

    // --- (CORRIGIDO) LÓGICA BOTÃO VOLTAR AO TOPO ---
    const btnBackToTop = document.getElementById('btn-back-to-top');
    
    if(btnBackToTop) {
        
        // Esta é a função que checa o scroll
        const checkScroll = () => {
            // Usamos os dois (body e documentElement) para garantir compatibilidade
            const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                btnBackToTop.style.display = "block";
            } else {
                btnBackToTop.style.display = "none";
            }
        };

        // 1. Usamos 'addEventListener' em vez de '.onscroll'
        // Isso permite que o lazy-loading também ouça o scroll sem conflitos.
        window.addEventListener('scroll', checkScroll);

        // 2. Adicionamos o listener de clique
        btnBackToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // 3. Checamos o scroll uma vez no início (caso a página carregue no meio)
        checkScroll();
    }
    // --- FIM: LÓGICA BOTÃO VOLTAR AO TOPO ---

    // Chama o rodapé
    carregarRodape();
});

// --- LÓGICA PARA CARREGAR RODAPÉ DINÂMICO ---
async function carregarRodape() {
    const footerElement = document.querySelector('.site-footer');
    if (!footerElement) {
        console.warn('Elemento .site-footer não encontrado. Não foi possível carregar o rodapé.');
        return;
    }

    try {
        const response = await fetch('footer-data.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        let adminLinkHTML = '';
        if (data.adminLink && data.adminLink.url && data.adminLink.text) {
            adminLinkHTML = `
                |
                <a href="${data.adminLink.url}">
                    ${data.adminLink.text}
                </a>
            `;
        }
        
        footerElement.innerHTML = `
            <p>
                &copy; ${data.currentYear} ${data.projectName} | Versão ${data.version} |
                <a href="${data.github.url}" target="_blank" rel="noopener noreferrer">
                    ${data.github.text}
                </a>
                ${adminLinkHTML}
            </p>
            <p>
                ${data.disclaimer}
            </p>
            <p>
                ${data.license.prefix} 
                <a href="${data.license.url}" target="_blank" rel="noopener noreferrer">
                    ${data.license.text}
                </a>
            </p>
        `;

    } catch (error) {
        console.error('Erro ao carregar dados do rodapé:', error);
        footerElement.innerHTML = '<p style="color: red;">Erro ao carregar informações do rodapé.</p>';
    }
}
