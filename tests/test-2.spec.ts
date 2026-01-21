import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/index.html');
  await page.getByRole('button', { name: 'Marcar Todas' }).click();
  await page.getByRole('textbox', { name: 'Pesquisar por Palavra-Chave:' }).click();
  await page.getByRole('textbox', { name: 'Pesquisar por Palavra-Chave:' }).fill('Em 01/01/2025, uma livraria tinha em estoque 20 livros "Estatística Simples". Cada livro tinha sido adquirido por R$ 80,00 e era vendido por R$ 140,00.');
  await page.getByText('(C) R$ 4.660,00.', { exact: true }).click();
  await page.getByText('Autor da Resolução').click();
});