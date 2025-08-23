import { test, expect } from '@playwright/test';

test('login redirects to client dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('cliente@drove.es');
  await page.getByLabel(/contraseña|password/i).fill('123456');
  await page.getByRole('button', { name: /iniciar sesión|entrar/i }).click();

  await page.waitForURL(/\/cliente\/dashboard/);
  await expect(page).toHaveURL(/\/cliente\/dashboard/);
});


