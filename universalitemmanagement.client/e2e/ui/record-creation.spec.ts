import { test, expect } from '@playwright/test';

const API = 'http://localhost:5232';

test.describe('Record Creation', () => {
  test('create a new record via the UI', async ({ page }) => {
    await page.goto('/new');
    await page.waitForLoadState('networkidle');

    // Wait for the new record form to load
    await expect(page.getByPlaceholder('Name')).toBeVisible({ timeout: 10000 });

    // Fill in the form
    const name = `E2E Record ${Date.now()}`;
    await page.getByPlaceholder('Name').fill(name);
    await page.getByPlaceholder('Description').fill('Created by Playwright');

    // Click the save button (button containing save icon)
    await page.locator('.button-group button').first().click();

    // Should navigate to the record view
    await expect(page).toHaveURL(/\/record\//, { timeout: 10000 });

    // The record name should be visible
    await expect(page.locator('.record__name')).toContainText(name, { timeout: 10000 });
  });

  test('new record appears in the sidebar list after page load', async ({ page, request }) => {
    // Create a record via API
    const name = `Sidebar Test ${Date.now()}`;
    const res = await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name, description: 'sidebar test', fields: [] },
    });
    const record = await res.json();

    // Navigate to the record directly — the sidebar renders alongside it
    await page.goto(`/record/${record.id}`);
    await page.waitForLoadState('networkidle');

    // Wait for record component to load (proves the page rendered)
    await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 10000 });

    // The record should appear in the sidebar
    await expect(page.locator('.sideBar')).toContainText(name, { timeout: 10000 });

    // Cleanup
    await request.delete(`${API}/api/record/${record.id}`);
  });

  test('edit record name and description', async ({ page, request }) => {
    // Seed a record
    const res = await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `Edit Test ${Date.now()}`, description: 'original', fields: [] },
    });
    const record = await res.json();

    await page.goto(`/record/${record.id}`);
    await page.waitForLoadState('networkidle');

    // Wait for the record form to load
    await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 10000 });

    // Update name
    const nameInput = page.getByPlaceholder('Record name');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.clear();
    await nameInput.fill('Updated Name');

    // Update description
    const descInput = page.locator('.record__meta').getByPlaceholder('Description');
    await descInput.clear();
    await descInput.fill('Updated description');

    // Save
    await page.locator('.record__save-btn').click();
    await page.waitForTimeout(1000);

    // Verify via API
    const getRes = await request.get(`${API}/api/record/${record.id}`);
    const updated = await getRes.json();
    expect(updated.name).toBe('Updated Name');
    expect(updated.description).toBe('Updated description');

    // Cleanup
    await request.delete(`${API}/api/record/${record.id}`);
  });
});
