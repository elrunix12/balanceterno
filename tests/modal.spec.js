import { test, expect } from '@playwright/test';

test('Deve abrir o Modal de Lançamentos e validar as contas de Débito e Crédito', async ({ page }) => {
  // 1. Acessa a página
  await page.goto('http://127.0.0.1:5500/index.html');

  // 2. Garante que as questões estejam visíveis (Marca todas as disciplinas)
  await page.getByRole('button', { name: 'Marcar Todas' }).click();

  // 3. Filtra pela Questão 30 usando a primeira frase do enunciado
  // Isso evita o problema do Lazy Loading, trazendo a questão para o topo
  const trechoEnunciado = 'Em 01/01/2025, uma livraria tinha em estoque 20 livros';
  await page.locator('#search-input').fill(trechoEnunciado);

  // 4. Clica na alternativa correta (C) para exibir o gabarito
  // Nota: O gabarito da questão 30 é C (R$ 4.660,00)
  await page.locator('.opcao-clicavel').filter({ hasText: 'R$ 4.660,00.' }).click();

  // 5. Clica no botão "Lançamentos Contábeis" que apareceu no gabarito
  const btnLancamentos = page.getByRole('button', { name: 'Lançamentos Contábeis' });
  await expect(btnLancamentos).toBeVisible();
  await btnLancamentos.click();

  // 6. Valida se o Modal abriu
  const modal = page.locator('#modal-lancamentos');
  await expect(modal).toBeVisible();

  // 7. Valida o conteúdo de um lançamento específico dentro do modal
  // Exemplo: Verificando o primeiro lançamento "Venda de livros" em 28/01
  const corpoModal = page.locator('#modal-body');
  
  // Verifica o título do lançamento
  await expect(corpoModal).toContainText('Venda de livros');
  
  // Verifica uma conta de Débito (Banco)
  await expect(corpoModal).toContainText('Banco (AC)');
  
  // Verifica uma conta de Crédito (Receita de vendas)
  await expect(corpoModal).toContainText('Receita de vendas (DRE)');

  // 8. Opcional: Fecha o modal e verifica se sumiu
  await page.locator('.modal-close').click();
  await expect(modal).toBeHidden();
});