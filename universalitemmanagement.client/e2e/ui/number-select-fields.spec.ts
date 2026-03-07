import { test, expect, Page } from '@playwright/test';

const API = 'http://localhost:5232';

// --- Seed helpers ---

async function seedRecord(request: any): Promise<{ id: string; name: string }> {
  const name = `NS Test ${Date.now()}`;
  const res = await request.post(`${API}/api/record`, {
    data: { id: crypto.randomUUID(), name, description: 'number/select e2e', fields: [] },
  });
  return res.json();
}

async function seedProperty(request: any, type: string, name?: string): Promise<{ id: string; name: string }> {
  const propName = name ?? `${type} Prop ${Date.now()}`;
  const res = await request.post(`${API}/api/fieldproperty`, {
    data: { id: crypto.randomUUID(), name: propName, type },
  });
  return res.json();
}

async function seedSelectOptions(request: any, propertyId: string, names: string[]) {
  const ids: string[] = [];
  for (const [i, name] of names.entries()) {
    const res = await (await request.post(`${API}/api/selectoption`, {
      data: { id: crypto.randomUUID(), name, color: '#c45d3e', order: i, fieldPropertyId: propertyId },
    })).json();
    ids.push(res.id);
  }
  return ids;
}

async function seedField(request: any, recordId: string, propertyId: string, x = 0, y = 0, w = 3, h = 1, extra: any = {}) {
  const res = await request.post(`${API}/api/field`, {
    data: {
      id: crypto.randomUUID(),
      recordId, fieldPropertyId: propertyId,
      x, y, width: w, height: h,
      ...extra,
    },
  });
  return res.json();
}

async function cleanup(request: any, recordId?: string, propertyIds?: string[], optionIds?: string[]) {
  if (recordId) await request.delete(`${API}/api/record/${recordId}`);
  for (const id of optionIds ?? []) await request.delete(`${API}/api/selectoption/${id}`);
  for (const id of propertyIds ?? []) await request.delete(`${API}/api/fieldproperty/${id}`);
}

async function gotoRecord(page: Page, recordId: string) {
  await page.goto(`/record/${recordId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 10000 });
}

// --- Number Field UI Tests ---

test.describe('Number Field - UI', () => {
  let recordId: string;
  let numPropId: string;

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;
    const prop = await seedProperty(request, 'Number');
    numPropId = prop.id;
    await seedField(request, recordId, numPropId, 1, 1, 3, 1);
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, recordId, [numPropId]);
  });

  test('number field shows input with correct type', async ({ page }) => {
    await gotoRecord(page, recordId);

    const numberInput = page.locator('.sf--number .sf__input');
    await expect(numberInput).toBeVisible({ timeout: 10000 });
    await expect(numberInput).toHaveAttribute('type', 'number');
  });

  test('number field accepts and saves a numeric value', async ({ page }) => {
    await gotoRecord(page, recordId);

    const numberInput = page.locator('.sf--number .sf__input');
    await expect(numberInput).toBeVisible({ timeout: 10000 });

    await numberInput.fill('42.5');
    await numberInput.blur();

    // Wait for save
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10000 });
  });

  test('number field value persists after reload', async ({ page }) => {
    await gotoRecord(page, recordId);

    const numberInput = page.locator('.sf--number .sf__input');
    await expect(numberInput).toBeVisible({ timeout: 10000 });

    await numberInput.fill('123.456');
    await numberInput.blur();
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10000 });

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 10000 });

    await expect(page.locator('.sf--number .sf__input')).toHaveValue('123.456', { timeout: 10000 });
  });

  test('number field label shows property name and icon', async ({ page }) => {
    await gotoRecord(page, recordId);

    const label = page.locator('.sf--number .sf__label');
    await expect(label).toBeVisible({ timeout: 10000 });
    await expect(label.locator('mat-icon')).toContainText('tag');
  });
});

// --- Select Field UI Tests ---

test.describe('Select Field - UI', () => {
  let recordId: string;
  let selectPropId: string;
  let optionIds: string[];

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;
    const prop = await seedProperty(request, 'Select', 'Status');
    selectPropId = prop.id;
    optionIds = await seedSelectOptions(request, selectPropId, ['Active', 'Inactive', 'Pending']);
    await seedField(request, recordId, selectPropId, 1, 1, 3, 1);
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, recordId, [selectPropId], optionIds);
  });

  test('select field shows trigger with placeholder', async ({ page }) => {
    await gotoRecord(page, recordId);

    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 10000 });
    await expect(trigger).toContainText('Select...');
  });

  test('select field opens dropdown with options', async ({ page }) => {
    await gotoRecord(page, recordId);

    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 10000 });

    await trigger.click();

    const dropdown = page.locator('.sf__dropdown');
    await expect(dropdown).toBeVisible();

    // Should have 3 options + 1 clear option
    const items = dropdown.locator('.sf__dropdown-item');
    await expect(items).toHaveCount(4); // 3 options + 1 "Clear selection"

    await expect(dropdown).toContainText('Active');
    await expect(dropdown).toContainText('Inactive');
    await expect(dropdown).toContainText('Pending');
  });

  test('selecting an option saves and shows it', async ({ page }) => {
    await gotoRecord(page, recordId);

    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 10000 });

    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'Active' }).click();

    // Dropdown should close and trigger should show "Active"
    await expect(page.locator('.sf__dropdown')).not.toBeVisible();
    await expect(trigger).toContainText('Active');

    // Save indicator
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10000 });
  });

  test('clearing selection removes the value', async ({ page }) => {
    await gotoRecord(page, recordId);

    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 10000 });

    // Select an option first
    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'Inactive' }).click();
    await expect(trigger).toContainText('Inactive');
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10000 });

    // Wait for status to clear
    await page.waitForTimeout(3000);

    // Clear
    await trigger.click();
    await page.locator('.sf__dropdown-item--clear').click();
    await expect(trigger).toContainText('Select...');
  });

  test('selected option persists after reload', async ({ page }) => {
    await gotoRecord(page, recordId);

    const trigger = page.locator('.sf__select-trigger');
    await expect(trigger).toBeVisible({ timeout: 10000 });

    await trigger.click();
    await page.locator('.sf__dropdown-item', { hasText: 'Pending' }).click();
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10000 });

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 10000 });

    await expect(page.locator('.sf__select-trigger')).toContainText('Pending', { timeout: 10000 });
  });

  test('select field label shows property name and icon', async ({ page }) => {
    await gotoRecord(page, recordId);

    const label = page.locator('.sf--select .sf__label');
    await expect(label).toBeVisible({ timeout: 10000 });
    await expect(label).toContainText('Status');
    await expect(label.locator('mat-icon')).toContainText('list');
  });
});

// --- Property Creator Dialog Tests ---

test.describe('Property Creator - New Field Types', () => {
  let recordId: string;

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;
  });

  test.afterEach(async ({ request }) => {
    if (recordId) await request.delete(`${API}/api/record/${recordId}`);
  });

  test('property creator dialog shows all 5 field types', async ({ page }) => {
    await gotoRecord(page, recordId);

    // Enter edit mode
    const editBtn = page.locator('.fg__toolbar button', { hasText: /edit/i });
    await editBtn.click();
    await expect(page.locator('.fg--editing')).toBeVisible();

    // Open property creator
    await page.locator('.fg__btn--terracotta').first().click();

    // Verify all 5 type cards are visible
    const typeCards = page.locator('.pcd__type-card');
    await expect(typeCards).toHaveCount(5, { timeout: 5000 });

    const dialog = page.locator('.pcd');
    await expect(dialog).toContainText('Text');
    await expect(dialog).toContainText('Number');
    await expect(dialog).toContainText('Boolean');
    await expect(dialog).toContainText('Date');
    await expect(dialog).toContainText('Select');
  });

  test('selecting Select type shows option builder', async ({ page }) => {
    await gotoRecord(page, recordId);

    const editBtn = page.locator('.fg__toolbar button', { hasText: /edit/i });
    await editBtn.click();
    await page.locator('.fg__btn--terracotta').first().click();

    // Click the Select type card
    await page.locator('.pcd__type-card', { hasText: 'Select' }).click();

    // Options builder should appear
    await expect(page.locator('.pcd__options')).toBeVisible();
    await expect(page.locator('.pcd__options-hint')).toContainText('Need at least 2');

    // Create button should be disabled (no options yet)
    await expect(page.locator('.pcd__btn--primary')).toBeDisabled();
  });

  test('can add options to Select type', async ({ page }) => {
    await gotoRecord(page, recordId);

    const editBtn = page.locator('.fg__toolbar button', { hasText: /edit/i });
    await editBtn.click();
    await page.locator('.fg__btn--terracotta').first().click();

    // Fill name
    await page.locator('input[formcontrolname="name"]').fill('Priority');

    // Select "Select" type
    await page.locator('.pcd__type-card', { hasText: 'Select' }).click();

    // Add options
    const optInput = page.locator('.pcd__options-input');
    await optInput.fill('High');
    await optInput.press('Enter');
    await expect(page.locator('.pcd__option-name', { hasText: 'High' })).toBeVisible();

    await optInput.fill('Low');
    await optInput.press('Enter');
    await expect(page.locator('.pcd__option-name', { hasText: 'Low' })).toBeVisible();

    // Count badge should show 2
    await expect(page.locator('.pcd__options-count')).toContainText('2');

    // Create button should now be enabled
    await expect(page.locator('.pcd__btn--primary')).toBeEnabled();
  });
});
