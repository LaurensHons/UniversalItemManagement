import { test, expect } from '@playwright/test';

const API = 'http://localhost:5232';

async function waitForPropertyCreatorPage(page: any) {
  await page.goto('/property-creator');
  await page.waitForLoadState('networkidle');
  // Wait for the Angular Material form to be interactive
  await expect(page.locator('input[formcontrolname="name"]')).toBeVisible({ timeout: 10000 });
}

test.describe('Field Property Creation', () => {
  test('create a text property via the property creator page', async ({ page }) => {
    await waitForPropertyCreatorPage(page);

    const name = `Text Prop ${Date.now()}`;
    await page.locator('input[formcontrolname="name"]').fill(name);

    // Click the Add Property button (contains "Add Property" text)
    await page.locator('button', { hasText: 'Add Property' }).click();

    // Property should appear in the table
    await expect(page.locator('mat-table')).toContainText(name, { timeout: 5000 });

    // Save all
    await page.locator('button', { hasText: 'Save All' }).click();
    await page.waitForTimeout(1000);

    // Verify via API
    const res = await page.request.get(`${API}/api/fieldproperty`);
    const properties = await res.json();
    const found = properties.find((p: any) => p.name === name);
    expect(found).toBeTruthy();

    if (found) await page.request.delete(`${API}/api/fieldproperty/${found.id}`);
  });

  test('create a boolean property', async ({ page }) => {
    await waitForPropertyCreatorPage(page);

    const name = `Bool Prop ${Date.now()}`;
    await page.locator('input[formcontrolname="name"]').fill(name);

    // Select Boolean type
    await page.locator('mat-select[formcontrolname="type"]').click();
    await page.locator('mat-option', { hasText: 'Boolean' }).click();

    await page.locator('button', { hasText: 'Add Property' }).click();
    await expect(page.locator('mat-table')).toContainText(name, { timeout: 5000 });

    await page.locator('button', { hasText: 'Save All' }).click();
    await page.waitForTimeout(1000);

    const res = await page.request.get(`${API}/api/fieldproperty`);
    const properties = await res.json();
    const found = properties.find((p: any) => p.name === name);
    expect(found).toBeTruthy();

    if (found) await page.request.delete(`${API}/api/fieldproperty/${found.id}`);
  });

  test('create a date property', async ({ page }) => {
    await waitForPropertyCreatorPage(page);

    const name = `Date Prop ${Date.now()}`;
    await page.locator('input[formcontrolname="name"]').fill(name);

    await page.locator('mat-select[formcontrolname="type"]').click();
    await page.locator('mat-option', { hasText: 'Date' }).click();

    await page.locator('button', { hasText: 'Add Property' }).click();
    await page.locator('button', { hasText: 'Save All' }).click();
    await page.waitForTimeout(1000);

    const res = await page.request.get(`${API}/api/fieldproperty`);
    const properties = await res.json();
    const found = properties.find((p: any) => p.name === name);
    expect(found).toBeTruthy();

    if (found) await page.request.delete(`${API}/api/fieldproperty/${found.id}`);
  });

  test('remove a property from the table before saving', async ({ page }) => {
    await waitForPropertyCreatorPage(page);

    // Add first property
    await page.locator('input[formcontrolname="name"]').fill('Will Keep');
    await page.locator('button', { hasText: 'Add Property' }).click();
    await expect(page.locator('mat-table')).toContainText('Will Keep');

    // Add second property
    await page.locator('input[formcontrolname="name"]').fill('Will Delete');
    await page.locator('button', { hasText: 'Add Property' }).click();
    await expect(page.locator('mat-table')).toContainText('Will Delete');

    // Delete the last one
    await page.locator('button:has(mat-icon:text("delete"))').last().click();

    await expect(page.locator('mat-table')).toContainText('Will Keep');
    await expect(page.locator('mat-table')).not.toContainText('Will Delete');
  });
});
