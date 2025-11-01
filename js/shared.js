document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA BOTÃO VOLTAR AO TOPO ---
    const btnBackToTop = document.getElementById('btn-back-to-top');
    if(btnBackToTop) {
        window.onscroll = () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                btnBackToTop.style.display = "block";
            } else {
                btnBackToTop.style.display = "none";
            }
        };
        btnBackToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
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
        
        // (NOVO) Cria o HTML do link admin, se ele existir
        let adminLinkHTML = '';
        if (data.adminLink && data.adminLink.url && data.adminLink.text) {
            // Cria o link no mesmo formato dos outros, com o separador "|"
            adminLinkHTML = `
                |
                <a href="${data.adminLink.url}">
                    ${data.adminLink.text}
                </a>
            `;
        }
        
        // (MODIFICADO) Adiciona a variável adminLinkHTML DENTRO do primeiro <p>
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