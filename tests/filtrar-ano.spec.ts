import { test, expect } from '@playwright/test';

test('Filtrar por ano', async ({ page }) => {
  await page.goto('https://elrunix12.github.io/balanceterno/');
  await page.locator('#btn-check-all-disciplinas').click();
  await page.getByLabel('Ordenar por Ano:').selectOption('crescente');
  await page.getByLabel('Ordenar por Ano:').selectOption('decrescente');
  await page.locator('#exame-checkbox-container').getByText('CFC 2025/2').click();
  await page.locator('#exame-checkbox-container').getByText('CFC 2025/2').click();
  await page.getByRole('checkbox', { name: 'CFC 2025/1' }).check();
  await page.getByRole('checkbox', { name: 'CFC 2025/1' }).uncheck();
  await page.getByRole('checkbox', { name: 'CFC 2024/2' }).check();
  await page.getByRole('checkbox', { name: 'CFC 2024/2' }).uncheck();
  await page.getByRole('checkbox', { name: 'CFC 2024/1 RS' }).check();
  await page.getByRole('checkbox', { name: 'CFC 2024/1 RS' }).dblclick();
  await page.getByRole('checkbox', { name: 'CFC 2024/1', exact: true }).check();
  await page.getByRole('checkbox', { name: 'CFC 2024/1', exact: true }).dblclick();
  await page.getByRole('checkbox', { name: 'CFC 2024/1', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'CFC 2023/2' }).check();
  await page.getByRole('checkbox', { name: 'CFC 2023/2' }).dblclick();
  await page.getByRole('checkbox', { name: 'CFC 2023/2' }).uncheck();
  await page.getByRole('checkbox', { name: 'CFC 2023/1' }).check();
  await page.getByRole('checkbox', { name: 'CFC 2023/1' }).uncheck();
  await page.getByRole('checkbox', { name: 'CFC 2022/2' }).check();
  await page.getByRole('checkbox', { name: 'CFC 2022/2' }).uncheck();
  await page.getByRole('checkbox', { name: 'CFC 2022/1' }).check();
  await page.getByRole('checkbox', { name: 'CFC 2022/1' }).uncheck();
  await page.getByRole('checkbox', { name: 'CFC 2024/1 RS' }).uncheck();
});