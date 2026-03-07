import { test, expect, Page } from '@playwright/test';

const API = 'http://localhost:5232';

// ─── Seed helpers ─────────────────────────────────────────────────────

async function seedRecord(request: any) {
  const res = await request.post(`${API}/api/record`, {
    data: { id: crypto.randomUUID(), name: `Dropdown Test ${Date.now()}`, description: 'dropdown e2e', fields: [] },
  });
  return res.json();
}

async function seedSelectProperty(request: any, name: string) {
  const res = await request.post(`${API}/api/fieldproperty`, {
    data: { id: crypto.randomUUID(), name, type: 'Select' },
  });
  return res.json();
}

async function seedOptions(request: any, propertyId: string, options: { name: string; color: string }[]) {
  const ids: string[] = [];
  for (const [i, opt] of options.entries()) {
    const res = await (await request.post(`${API}/api/selectoption`, {
      data: { id: crypto.randomUUID(), name: opt.name, color: opt.color, order: i, fieldPropertyId: propertyId },
    })).json();
    ids.push(res.id);
  }
  return ids;
}

async function seedField(request: any, recordId: string, propertyId: string, extra: any = {}) {
  const res = await request.post(`${API}/api/field`, {
    data: {
      id: crypto.randomUUID(),
      recordId, fieldPropertyId: propertyId,
      x: 1, y: 1, width: 3, height: 1,
      ...extra,
    },
  });
  return res.json();
}

async function gotoRecord(page: Page, recordId: string) {
  await page.goto(`/record/${recordId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 15_000 });
}

async function cleanup(request: any, recordId?: string, propertyId?: string, optionIds?: string[]) {
  if (recordId) await request.delete(`${API}/api/record/${recordId}`);
  for (const id of optionIds ?? []) await request.delete(`${API}/api/selectoption/${id}`);
  if (propertyId) await request.delete(`${API}/api/fieldproperty/${propertyId}`);
}

// ─── Tests ────────────────────────────────────────────────────────────

test.describe('Select Dropdown - Options visibility', () => {
  let recordId: string;
  let propertyId: string;
  let optionIds: string[];

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;

    const prop = await seedSelectProperty(request, 'Priority');
    propertyId = prop.id;

    optionIds = await seedOptions(request, propertyId, [
      { name: 'High', color: '#e74c3c' },
      { name: 'Medium', color: '#f39c12' },
      { name: 'Low', color: '#27ae60' },
    ]);

    await seedField(request, recordId, propertyId);
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, recordId, propertyId, optionIds);
  });

  test('API returns property with selectOptions populated', async ({ request }) => {
    // Sanity check: the API actually returns options
    const res = await request.get(`${API}/api/fieldproperty/${propertyId}`);
    expect(res.ok()).toBeTruthy();
    const prop = await res.json();
    expect(prop.selectOptions).toBeTruthy();
    expect(prop.selectOptions.length).toBe(3);
    expect(prop.selectOptions.map((o: any) => o.name)).toEqual(['High', 'Medium', 'Low']);
  });

  test('select field renders on the page', async ({ page }) => {
    await gotoRecord(page, recordId);
    const selectField = page.locator('.sf--select');
    await expect(selectField).toBeVisible({ timeout: 15_000 });
  });

  test('trigger shows placeholder text when no value selected', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });
    await expect(trigger).toContainText('Select...');
  });

  test('clicking trigger opens the dropdown', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    await trigger.click();

    const dropdown = page.locator('.sf__dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5_000 });
  });

  test('dropdown shows all 3 options plus clear button', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    await trigger.click();

    const dropdown = page.locator('.sf__dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5_000 });

    // Should NOT show the empty message
    await expect(page.locator('.sf__dropdown-empty')).not.toBeVisible();

    // Should have clear + 3 options = 4 items
    const items = dropdown.locator('.sf__dropdown-item');
    await expect(items).toHaveCount(4);
  });

  test('dropdown contains the correct option names', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    await trigger.click();

    const dropdown = page.locator('.sf__dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5_000 });

    await expect(dropdown).toContainText('High');
    await expect(dropdown).toContainText('Medium');
    await expect(dropdown).toContainText('Low');
  });

  test('options show colored dots', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });
    await trigger.click();

    // Each option item should have a colored dot
    const optionDots = page.locator('.sf__dropdown-item:not(.sf__dropdown-item--clear) .sf__select-dot');
    await expect(optionDots).toHaveCount(3);
  });

  test('clicking an option selects it and shows chip on trigger', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'High' }).click();

    // Trigger should now show "High" as a chip
    await expect(trigger).toContainText('High');
    // Placeholder should be gone
    await expect(page.locator('.sf__select-text')).not.toBeVisible();
  });

  test('selecting an option triggers save indicator', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'Medium' }).click();

    // Save icon should appear
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10_000 });
  });

  test('selected option shows check mark in dropdown', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    // Select "High"
    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'High' }).click();
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10_000 });

    // Wait for status to clear
    await page.waitForTimeout(3000);

    // Re-open dropdown and check that "High" has a check mark
    await trigger.click();
    const highItem = page.locator('.sf__dropdown-item', { hasText: 'High' });
    await expect(highItem).toHaveClass(/sf__dropdown-item--selected/);
    await expect(highItem.locator('.sf__dropdown-check')).toBeVisible();
  });

  test('can select multiple options', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    // Select "High"
    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'High' }).click();
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(3000);

    // Select "Low" as well
    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'Low' }).click();
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10_000 });

    // Trigger should show both chips
    await expect(trigger).toContainText('High');
    await expect(trigger).toContainText('Low');

    const chips = trigger.locator('.sf__chip');
    await expect(chips).toHaveCount(2);
  });

  test('deselecting an option removes it', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    // Select
    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'High' }).click();
    await expect(trigger).toContainText('High');
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(3000);

    // Deselect by clicking again
    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'High' }).click();

    // Should go back to placeholder
    await expect(trigger).toContainText('Select...');
  });

  test('clear all removes all selections', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    // Select two options
    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'High' }).click();
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(3000);

    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'Medium' }).click();
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(3000);

    // Clear all
    await trigger.click();
    await page.locator('.sf__dropdown-item--clear').click();

    // Back to placeholder
    await expect(trigger).toContainText('Select...');
  });

  test('selection persists after page reload', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    // Select an option
    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'Low' }).click();
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10_000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 15_000 });

    // "Low" should still be shown
    await expect(page.locator('.sf__select-trigger')).toContainText('Low', { timeout: 15_000 });
  });

  test('chevron toggles between expand_more and expand_less', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    // Closed: expand_more
    await expect(page.locator('.sf__select-chevron')).toContainText('expand_more');

    // Open
    await trigger.click();
    await expect(page.locator('.sf__select-chevron')).toContainText('expand_less');

    // Close
    await trigger.click();
    await expect(page.locator('.sf__select-chevron')).toContainText('expand_more');
  });

  test('label shows property name and list icon', async ({ page }) => {
    await gotoRecord(page, recordId);
    const label = page.locator('.sf--select .sf__label');
    await expect(label).toBeVisible({ timeout: 15_000 });
    await expect(label).toContainText('Priority');
    await expect(label.locator('mat-icon')).toContainText('list');
  });
});

test.describe('Select Dropdown - Empty state', () => {
  let recordId: string;
  let propertyId: string;

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;

    // Create a Select property with NO options
    const prop = await seedSelectProperty(request, 'EmptySelect');
    propertyId = prop.id;

    await seedField(request, recordId, propertyId);
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, recordId, propertyId);
  });

  test('dropdown with no options shows "No options defined" message', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    await trigger.click();

    const dropdown = page.locator('.sf__dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5_000 });

    await expect(page.locator('.sf__dropdown-empty')).toBeVisible();
    await expect(page.locator('.sf__dropdown-empty')).toContainText('No options defined');

    // Only the clear button should exist, no option items
    const regularItems = dropdown.locator('.sf__dropdown-item:not(.sf__dropdown-item--clear)');
    await expect(regularItems).toHaveCount(0);
  });
});

test.describe('Select Dropdown - Pre-selected value', () => {
  let recordId: string;
  let propertyId: string;
  let optionIds: string[];

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;

    const prop = await seedSelectProperty(request, 'Status');
    propertyId = prop.id;

    optionIds = await seedOptions(request, propertyId, [
      { name: 'Open', color: '#3498db' },
      { name: 'Closed', color: '#95a5a6' },
    ]);

    // Create a field WITH a pre-selected value
    await seedField(request, recordId, propertyId, {
      selectOptionIds: [optionIds[0]],
    });
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, recordId, propertyId, optionIds);
  });

  test('field with pre-selected value shows the option on load', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });

    // Should show "Open" (the pre-selected option), not the placeholder
    await expect(trigger).toContainText('Open', { timeout: 15_000 });
    await expect(page.locator('.sf__select-text')).not.toBeVisible();
  });

  test('pre-selected option appears highlighted in dropdown', async ({ page }) => {
    await gotoRecord(page, recordId);
    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 15_000 });
    // Wait for value to load
    await expect(trigger).toContainText('Open', { timeout: 15_000 });

    await trigger.click();

    const openItem = page.locator('.sf__dropdown-item', { hasText: 'Open' });
    await expect(openItem).toHaveClass(/sf__dropdown-item--selected/);
    await expect(openItem.locator('.sf__dropdown-check')).toBeVisible();

    const closedItem = page.locator('.sf__dropdown-item', { hasText: 'Closed' });
    await expect(closedItem).not.toHaveClass(/sf__dropdown-item--selected/);
  });
});
