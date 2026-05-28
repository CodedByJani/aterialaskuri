const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/login');

function getRestaurantRow(page, dayText, restaurantName) {
  const dayBlock = page.locator('tr.day-header', { hasText: dayText });

  return dayBlock
    .locator('xpath=following-sibling::tr[not(@class="day-header")]')
    .filter({
      has: page.locator('td.restaurant-name', { hasText: restaurantName })
    })
    .first();
}

function getFieldInput(row, mealName) {
  return row
    .locator(".field-row", { hasText: mealName })
    .getByRole("spinbutton")
    .first();
}
 
test("Paasivu näyttää viikkonäkymän oikein", async ({ page, request }) => {
    await login(page, request);

    await expect(page.getByText("🍽️ Ruokailijatiedot")).toBeVisible();

    await expect(page.getByText(/Viikko \d+/)).toBeVisible();

    const days = [
        "Ma 25.5.",
        "Ti 26.5.",
        "Ke 27.5.",
        "To 28.5.",
        "Pe 29.5."
    ];

    for (const day of days) {
        await expect(page.getByText(day, { exact: true })).toBeVisible();
    }

    const units = ["Napostella", "Ilona", "Käenkaali", "Kiito-Orava"];

    for (const u of units) {
        await expect(
            page.locator("td.restaurant-name").filter({ hasText: u }).first()
        ).toBeVisible();
    }

    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("input").first()).toBeVisible();
});
test('Käyttäjä voi syöttää ateriat maanantaille', async ({ page, request }) => {
    await login(page, request);

    const napostellaRow = getRestaurantRow(page, 'Ma 25.5.', 'Napostella');

    const puuro = getFieldInput(napostellaRow, 'puuro');
    const lounas = getFieldInput(napostellaRow, 'lounas');

    await puuro.fill('5');
    await expect(puuro).toHaveValue('5');

    await lounas.fill('3');
    await expect(lounas).toHaveValue('3');
});
test('Käyttäjä voi syöttää Käenkaalin metsäeväät ja päivällisen maanantaille', async ({ page, request }) => {
    await login(page, request);

    const kaenkaaliRow = getRestaurantRow(page, 'Ma 25.5.', 'Käenkaali');

    const metsa = getFieldInput(kaenkaaliRow, 'metsäeväät');
    const paivallinen = getFieldInput(kaenkaaliRow, 'päivällinen');
    
    await metsa.fill('2');
    await expect(metsa).toHaveValue('2');

    await paivallinen.fill('4');
    await expect(paivallinen).toHaveValue('4');
});
test('Näytä vain lounaat - suodattaa vain lounas-kentät', async ({ page, request }) => {
    await login(page, request);

    const filterButton = page.getByRole('button', { name: /näytä vain lounaat/i });
    await filterButton.click();

    const napostellaRow = getRestaurantRow(page, 'Ma 25.5.', 'Napostella');

    await expect(napostellaRow.locator('.field-row:has-text("lounas")')).toBeVisible();
    await expect(napostellaRow.locator('.field-row:has-text("puuro")')).toHaveCount(0);

    const kaenkaaliRow = getRestaurantRow(page, 'Ma 25.5.', 'Käenkaali');

    await expect(kaenkaaliRow.locator('.field-row:has-text("lounas")')).toBeVisible();
    await expect(kaenkaaliRow.locator('.field-row:has-text("aamupala")')).toHaveCount(0);
    await expect(kaenkaaliRow.locator('.field-row:has-text("metsäeväät")')).toHaveCount(0);
    await expect(kaenkaaliRow.locator('.field-row:has-text("päivällinen")')).toHaveCount(0);

    const ilonaRow = getRestaurantRow(page, 'Ma 25.5.', 'Ilona');

    await expect(ilonaRow.locator('.field-row:has-text("lounas")')).toBeVisible();
    await expect(ilonaRow.locator('.field-row:has-text("puuro")')).toHaveCount(0);

    const kiitoRow = getRestaurantRow(page, 'Ma 25.5.', 'Kiito-Orava');
    await expect(kiitoRow.locator('.field-row:has-text("lounas")')).toBeVisible();
    await expect(kiitoRow.locator('.field-row:has-text("puuro")')).toHaveCount(0);
});
test('käyttäjä voi siirtyä edelliselle viikolle', async ({ page, request }) => {
  await login(page, request);

  const weekLabel = page.locator('h2');

  const initialText = await weekLabel.textContent();

  await page.getByRole('button', { name: /edellinen/i }).click();

  await expect(weekLabel).not.toHaveText(initialText);

  await expect(weekLabel).toContainText('Viikko');
});
test('käyttäjä voi palata seuraavalla viikolla takaisin nykyiseen viikkoon', async ({ page, request }) => {
  await login(page, request);

  const weekLabel = page.locator('h2');

  const original = await weekLabel.textContent();

  await page.getByRole('button', { name: /edellinen/i }).click();
  await expect(weekLabel).not.toHaveText(original);

  const previous = await weekLabel.textContent();

  await page.getByRole('button', { name: /seuraava/i }).click();

  await expect(weekLabel).toHaveText(original);

  await expect(weekLabel).not.toHaveText(previous);
});