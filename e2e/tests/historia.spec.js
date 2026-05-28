const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/login');

test.beforeAll(async ({ request }) => {
  await request.get("http://localhost:3001/api/health");
});

test.beforeEach(async ({ request }) => {
    const res = await request.post("http://localhost:3001/api/testing/reset");
    await expect.poll(async () => {
    const res = await request.get("http://localhost:3001/api/stats/history?unitName=Napostella");
        return (await res.json()).length;
    }).toBeGreaterThanOrEqual(0);
});


test('Käyttäjä voi avata historian', async ({ request, page }) => {
    await login(page, request);

    await page.getByText('Katso historia').click();

    await page.getByRole('combobox').selectOption({ index: 1 });

    await page.getByText('Avaa historia').click();

    await page.waitForURL('**/history**');

    await expect(page.locator('h1')).toContainText('Historia');

    await expect(page.getByLabel('Alkupäivä')).toBeVisible();
    await expect(page.getByLabel('Loppupäivä')).toBeVisible();

    await expect(page.locator('table')).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'Päivä' })).toBeVisible();
});
test('Käyttäjä voi muuttaa historian päivämääräväliä', async ({ request, page }) => {
    await login(page, request);

    await page.getByText('Katso historia').click();

    await page.getByRole('combobox').selectOption({ index: 1 });

    await page.getByText('Avaa historia').click();

    await page.waitForURL('**/history**');

    await page.getByLabel('Alkupäivä').fill('2026-01-01');

    await page.getByLabel('Loppupäivä').fill('2026-01-31');

    await page.getByText('Hae historia').click();

    await expect(page.locator('table')).toBeVisible();

    await expect(page.getByRole('columnheader', { name: '2025' })).toBeVisible();
});
test("Historia näyttää vertailutiedot", async ({ page, request }) => {
    await login(page, request);

    await page.getByText("Katso historia").click();

    await page.getByRole("combobox").selectOption({ index: 1 });

    await page.getByText("Avaa historia").click();

    await page.waitForURL("**/history**");

    await page.getByLabel("Alkupäivä").fill("2026-05-18");
    await page.getByLabel("Loppupäivä").fill("2026-05-22");

    await page.getByText("Hae historia").click();
    
    const table = page.locator("table");

    await expect(table).toContainText("puuro: 6");
    await expect(table).toContainText("lounas: 4");
    await expect(table).toContainText("puuro: 10");
    await expect(table).toContainText("lounas: 8");

});
test("Historia näyttää oikeat vertailutiedot", async ({ page, request }) => {
  await login(page, request);

  await page.getByText("Katso historia").click();
  await page.getByRole("combobox").selectOption({ index: 1 });
  await page.getByText("Avaa historia").click();

  await page.waitForURL("**/history**");

  await page.getByLabel("Alkupäivä").fill("2026-05-18");
  await page.getByLabel("Loppupäivä").fill("2026-05-22");

  await page.getByText("Hae historia").click();

  const table = page.locator("table");

  await expect(table).toContainText("2026");
  await expect(table).toContainText("2025");

  await expect(table).toContainText("puuro: 6");
  await expect(table).toContainText("lounas: 4");
  await expect(table).toContainText("puuro: 10");
  await expect(table).toContainText("lounas: 8");
});
test("Kun käyttäjä painaa takaisin niin sovellus palaa etusivulle", async ({ page, request }) => {

    await login(page, request);
    
    await page.getByText("Katso historia").click();

    await page.getByRole("combobox").selectOption({ index: 1 });

    await page.getByText("Avaa historia").click();

    await page.getByRole("button", { name: "Takaisin" }).click();

    await page.waitForURL("**/");

    await expect(page.getByTestId('main-title')).toBeVisible();
});