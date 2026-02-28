import { test, expect } from '@playwright/test';

const API = 'http://localhost:5232';

test.describe('Inline Property Creation from Field Grid', () => {
  let recordId: string;

  test.beforeEach(async ({ request }) => {
    const name = `Inline Test ${Date.now()}`;
    const res = await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name, description: 'inline property test', fields: [] },
    });
    const record = await res.json();
    recordId = record.id;
  });

  test.afterEach(async ({ request }) => {
    if (recordId) await request.delete(`${API}/api/record/${recordId}`);
  });

  test('create a property via the sidebar dialog', async ({ page }) => {
    await page.goto(`/record/${recordId}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 10000 });

    // Enter edit mode
    const editBtn = page.locator('.fg__toolbar button', { hasText: /edit/i });
    await editBtn.click();
    await expect(page.locator('.fg--editing')).toBeVisible();

    // Click the "+" button in the sidebar header
    await page.locator('.fg__sidebar .fg__btn--terracotta').first().click();

    // Dialog should appear
    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Fill in property name
    const propName = `Inline Prop ${Date.now()}`;
    await dialog.locator('input[formcontrolname="name"]').fill(propName);

    // Type defaults to Text, click Create
    await dialog.getByRole('button', { name: /create/i }).click();

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // New property should appear in the sidebar
    await expect(page.locator('.fg__sidebar-item', { hasText: propName })).toBeVisible({ timeout: 10000 });
  });
});
