const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/login');

test.beforeAll(async ({ request }) => {
  await request.get("http://localhost:3001/api/health");
});
test('Käyttäjä voi kirjautua sisään magic-linkin kautta', async ({ request, page }) => {
    await login(page, request);
});