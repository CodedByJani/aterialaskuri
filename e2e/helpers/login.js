const { expect } = require('@playwright/test');

async function login(page, request) {
  const email = 'test@gmail.com';

  await request.post('http://localhost:3001/api/auth/magic-link', {
    data: { email },
  });

  const res = await request.get(
    'http://localhost:3001/api/auth/test-last-link'
  );

  const body = await res.json();

  expect(body.url).toBeTruthy();

  await page.goto(body.url);

  await page.waitForURL('**/');

  await expect(
    page.getByText('🍽️ Ruokailijatiedot')
  ).toBeVisible();
}

module.exports = { login };