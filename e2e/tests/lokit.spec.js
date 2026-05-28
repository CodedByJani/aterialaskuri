const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/login');

test('Käyttäjä voi avata lokitiedot', async ({ request, page }) => {
    await login(page, request);

    await page.getByText('Näytä lokit').click();

    await page.waitForURL('**/logs**');

    await expect(page.locator('h1')).toContainText('Tapahtumaloki');

    const grid = page.getByTestId('logs-grid');

    await expect(grid).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'Aika' })).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'Käyttäjä' })).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'Toiminto' })).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'Tarkemmat tiedot' })).toBeVisible();
});

test('Lokitiedot näyttävät tapahtumat', async ({ request, page }) => {
    await login(page, request);

    await page.getByText('Näytä lokit').click();

    await page.waitForURL('**/logs**');

    const grid = page.getByTestId('logs-grid');

    await expect(grid).toBeVisible();

    const rows = grid.locator('div');

    expect(await rows.count()).toBeGreaterThan(0);
});
test('Lokitiedoista voi poistua painamalla takaisin sovellukseen', async ({ request, page }) => {
    await login(page, request);

    await page.getByText('Näytä lokit').click();
    await page.waitForURL('**/logs**');

    await expect(page.locator('h1')).toContainText('Tapahtumaloki');

    const grid = page.getByTestId('logs-grid');

    await expect(grid).toBeVisible();
    await page.getByText('Takaisin sovellukseen').click();

    await page.waitForURL('**/');
    await expect(page.locator('h1')).toContainText('🍽️ Ruokailijatiedot');
});