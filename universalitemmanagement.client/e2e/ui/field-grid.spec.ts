import { test, expect, Page } from '@playwright/test';

const API = 'http://localhost:5232';

// --- Seed helpers ---

async function seedRecord(request: any): Promise<{ id: string; name: string }> {
  const name = `Grid Test ${Date.now()}`;
  const res = await request.post(`${API}/api/record`, {
    data: { id: crypto.randomUUID(), name, description: 'field grid e2e', fields: [] },
  });
  return res.json();
}

async function seedProperty(request: any, type: string = 'Text'): Promise<{ id: string; name: string }> {
  const name = `${type} Prop ${Date.now()}`;
  const res = await request.post(`${API}/api/fieldproperty`, {
    data: { id: crypto.randomUUID(), name, type },
  });
  return res.json();
}

async function seedField(request: any, recordId: string, propertyId: string, x = 0, y = 0, w = 4, h = 1) {
  const res = await request.post(`${API}/api/field`, {
    data: {
      id: crypto.randomUUID(),
      recordId, fieldPropertyId: propertyId,
      x, y, width: w, height: h,
    },
  });
  return res.json();
}

async function cleanup(request: any, recordId?: string, propertyIds?: string[]) {
  if (recordId) await request.delete(`${API}/api/record/${recordId}`);
  for (const id of propertyIds ?? []) {
    await request.delete(`${API}/api/fieldproperty/${id}`);
  }
}

async function gotoRecord(page: Page, recordId: string) {
  await page.goto(`/record/${recordId}`);
  await page.waitForLoadState('networkidle');
  // Wait for the field grid component to render
  await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 10000 });
}

async function enterEditMode(page: Page) {
  const editBtn = page.locator('.fg__toolbar button', { hasText: /edit/i });
  if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await editBtn.click();
    await expect(page.locator('.fg--editing')).toBeVisible();
  }
}

/**
 * Simulate HTML5 drag and drop by dispatching DragEvent on source and target elements.
 * Playwright's mouse doesn't trigger the HTML5 drag/drop API, so we use page.evaluate()
 * to dispatch synthetic dragstart, dragover, and drop events with a real DataTransfer.
 */
async function html5DragDrop(page: Page, sourceSelector: string, targetSelector: string) {
  await page.evaluate(({ src, tgt }) => {
    const source = document.querySelector(src) as HTMLElement;
    const target = document.querySelector(tgt) as HTMLElement;
    if (!source || !target) throw new Error(`Could not find elements: ${src} / ${tgt}`);

    const dataTransfer = new DataTransfer();

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // dragstart on source
    source.dispatchEvent(new DragEvent('dragstart', {
      bubbles: true, cancelable: true, dataTransfer,
      clientX: sourceRect.x + sourceRect.width / 2,
      clientY: sourceRect.y + sourceRect.height / 2,
    }));

    // dragover on target (required to allow drop)
    target.dispatchEvent(new DragEvent('dragover', {
      bubbles: true, cancelable: true, dataTransfer,
      clientX: targetRect.x + targetRect.width / 3,
      clientY: targetRect.y + targetRect.height / 3,
    }));

    // drop on target
    target.dispatchEvent(new DragEvent('drop', {
      bubbles: true, cancelable: true, dataTransfer,
      clientX: targetRect.x + targetRect.width / 3,
      clientY: targetRect.y + targetRect.height / 3,
    }));

    // dragend on source
    source.dispatchEvent(new DragEvent('dragend', {
      bubbles: true, cancelable: true, dataTransfer,
    }));
  }, { src: sourceSelector, tgt: targetSelector });
}

// --- Tests ---

test.describe('Field Grid - Adding Fields via Drag', () => {
  let recordId: string;
  let textPropId: string;
  let boolPropId: string;

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;
    const textProp = await seedProperty(request, 'Text');
    textPropId = textProp.id;
    const boolProp = await seedProperty(request, 'Boolean');
    boolPropId = boolProp.id;
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, recordId, [textPropId, boolPropId]);
  });

  test('sidebar shows available properties in edit mode', async ({ page }) => {
    await gotoRecord(page, recordId);
    await enterEditMode(page);

    // Sidebar should be visible
    await expect(page.locator('.fg__sidebar')).toBeVisible();

    // Wait for sidebar items to load (NgRx fetches field properties)
    await expect(page.locator('.fg__sidebar-item').first()).toBeVisible({ timeout: 10000 });

    const count = await page.locator('.fg__sidebar-item').count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('drag a property from sidebar onto the grid creates a field', async ({ page }) => {
    await gotoRecord(page, recordId);
    await enterEditMode(page);

    // Wait for sidebar items
    await expect(page.locator('.fg__sidebar-item').first()).toBeVisible({ timeout: 10000 });

    const fieldsBefore = await page.locator('.fg__card').count();

    // Drag from sidebar to grid using HTML5 drag events
    await html5DragDrop(page, '.fg__sidebar-item', '.fg__grid');

    // Wait for the field to be created (API call + re-render)
    await expect(page.locator('.fg__card')).toHaveCount(fieldsBefore + 1, { timeout: 10000 });
  });
});

test.describe('Field Grid - Editing Values', () => {
  let recordId: string;
  let textPropId: string;
  let boolPropId: string;

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;
    const textProp = await seedProperty(request, 'Text');
    textPropId = textProp.id;
    const boolProp = await seedProperty(request, 'Boolean');
    boolPropId = boolProp.id;

    // Create fields via API
    await seedField(request, recordId, textPropId, 0, 0, 4, 1);
    await seedField(request, recordId, boolPropId, 4, 0, 4, 1);
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, recordId, [textPropId, boolPropId]);
  });

  test('text field shows input and accepts value', async ({ page }) => {
    await gotoRecord(page, recordId);

    const textInput = page.locator('.sf--text .sf__input');
    await expect(textInput).toBeVisible({ timeout: 10000 });

    await textInput.fill('Hello E2E');
    await textInput.blur();

    // Wait for save indicator
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10000 });
  });

  test('boolean field toggles on click', async ({ page }) => {
    await gotoRecord(page, recordId);

    const toggle = page.locator('.sf__toggle').first();
    await expect(toggle).toBeVisible({ timeout: 10000 });

    const initialLabel = await page.locator('.sf__toggle-label').first().textContent();

    await toggle.click();

    // Label should change (Yes <-> No)
    const newLabel = await page.locator('.sf__toggle-label').first().textContent();
    expect(newLabel).not.toBe(initialLabel);

    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10000 });
  });

  test('text field value persists after reload', async ({ page, request }) => {
    await gotoRecord(page, recordId);

    const textInput = page.locator('.sf--text .sf__input');
    await expect(textInput).toBeVisible({ timeout: 10000 });

    await textInput.fill('Persisted Value');
    await textInput.blur();

    // Wait for save to complete (saved icon appears then fades)
    await expect(page.locator('.sf__status-icon--saved').first()).toBeVisible({ timeout: 10000 });

    // Also verify via API that value was actually saved
    const fieldRes = await request.get(`${API}/api/record/${recordId}`);
    const record = await fieldRes.json();
    const textField = record.fields?.find((f: any) => f.fieldPropertyId === textPropId);
    expect(textField?.textValue).toBe('Persisted Value');

    // Reload and check UI reflects the persisted value
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('app-field-grid')).toBeVisible({ timeout: 10000 });

    await expect(page.locator('.sf--text .sf__input')).toHaveValue('Persisted Value', { timeout: 10000 });
  });
});

test.describe('Field Grid - Deleting Fields', () => {
  let recordId: string;
  let textPropId: string;

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;
    const textProp = await seedProperty(request, 'Text');
    textPropId = textProp.id;
    await seedField(request, recordId, textPropId);
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, recordId, [textPropId]);
  });

  test('delete a field with two-click confirmation', async ({ page }) => {
    await gotoRecord(page, recordId);
    await enterEditMode(page);

    await expect(page.locator('.fg__card')).toHaveCount(1, { timeout: 10000 });

    // First click - shows confirmation
    await page.locator('.fg__card-delete').first().click();
    await expect(page.locator('.fg__card--delete-confirm')).toBeVisible();

    // Second click - actually deletes
    await page.locator('.fg__card-delete').first().click();

    await expect(page.locator('.fg__card')).toHaveCount(0, { timeout: 10000 });
  });

  test('delete confirmation resets after timeout', async ({ page }) => {
    await gotoRecord(page, recordId);
    await enterEditMode(page);

    await page.locator('.fg__card-delete').first().click();
    await expect(page.locator('.fg__card--delete-confirm')).toBeVisible();

    // Wait for auto-timeout to reset
    await expect(page.locator('.fg__card--delete-confirm')).not.toBeVisible({ timeout: 6000 });

    // Field should still exist
    await expect(page.locator('.fg__card')).toHaveCount(1);
  });
});

test.describe('Field Grid - Layout Lock', () => {
  let recordId: string;
  let propId: string;

  test.beforeEach(async ({ request }) => {
    const record = await seedRecord(request);
    recordId = record.id;
    const prop = await seedProperty(request, 'Text');
    propId = prop.id;
    await seedField(request, recordId, propId);
  });

  test.afterEach(async ({ request }) => {
    await cleanup(request, recordId, [propId]);
  });

  test('toggle between edit and locked mode', async ({ page }) => {
    await gotoRecord(page, recordId);

    // Should start in locked mode
    await expect(page.locator('.fg__sidebar')).not.toBeVisible();
    await expect(page.locator('.fg__card-resize')).not.toBeVisible();

    // Enter edit mode
    await enterEditMode(page);

    // Editing UI should appear
    await expect(page.locator('.fg--editing')).toBeVisible();
    await expect(page.locator('.fg__card-resize')).toBeVisible();

    // Lock again
    await page.locator('.fg__toolbar button', { hasText: /done/i }).click();

    // Should be back to locked
    await expect(page.locator('.fg--editing')).not.toBeVisible();
    await expect(page.locator('.fg__card-resize')).not.toBeVisible();
  });

  test('sidebar can be toggled open and closed', async ({ page }) => {
    await gotoRecord(page, recordId);
    await enterEditMode(page);

    await expect(page.locator('.fg__sidebar')).toBeVisible();

    // Collapse
    await page.locator('.fg__btn--ghost').click();
    await expect(page.locator('.fg__sidebar')).not.toBeVisible();

    // Expand
    await page.locator('.fg__btn--ghost').click();
    await expect(page.locator('.fg__sidebar')).toBeVisible();
  });
});
