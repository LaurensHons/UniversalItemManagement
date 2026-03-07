import { test, expect } from '@playwright/test';

const API = 'http://localhost:5232';

test.describe('Number Field - API', () => {
  let recordId: string;
  let propertyId: string;

  test.beforeAll(async ({ request }) => {
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `Number Test ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();
    recordId = record.id;

    const property = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `NumProp ${Date.now()}`, type: 'Number' },
    })).json();
    propertyId = property.id;
  });

  test.afterAll(async ({ request }) => {
    if (recordId) await request.delete(`${API}/api/record/${recordId}`);
    if (propertyId) await request.delete(`${API}/api/fieldproperty/${propertyId}`);
  });

  test('create a field with a number value', async ({ request }) => {
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 0, y: 0, width: 3, height: 1,
        numberValue: 42.5,
      },
    });
    expect(res.ok()).toBeTruthy();
    const field = await res.json();
    expect(field.numberValue).toBe(42.5);
    expect(field.valueId).toBeTruthy();
  });

  test('update a field with a new number value', async ({ request }) => {
    // Create
    const created = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 4, y: 0, width: 3, height: 1,
        numberValue: 100,
      },
    })).json();

    // Update
    const res = await request.patch(`${API}/api/field`, {
      data: { ...created, numberValue: 999.99 },
    });
    expect(res.ok()).toBeTruthy();
    const updated = await res.json();
    expect(updated.numberValue).toBe(999.99);
  });

  test('create a field without number value', async ({ request }) => {
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 8, y: 0, width: 3, height: 1,
      },
    });
    expect(res.ok()).toBeTruthy();
    const field = await res.json();
    expect(field.numberValue).toBeNull();
    expect(field.valueId).toBeNull();
  });
});

test.describe('Select Field - API', () => {
  let recordId: string;
  let propertyId: string;
  let optionIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `Select Test ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();
    recordId = record.id;

    const property = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `StatusProp ${Date.now()}`, type: 'Select' },
    })).json();
    propertyId = property.id;

    // Create select options
    for (const [i, opt] of ['Active', 'Inactive', 'Pending'].entries()) {
      const res = await (await request.post(`${API}/api/selectoption`, {
        data: { id: crypto.randomUUID(), name: opt, color: '#c45d3e', order: i, fieldPropertyId: propertyId },
      })).json();
      optionIds.push(res.id);
    }
  });

  test.afterAll(async ({ request }) => {
    if (recordId) await request.delete(`${API}/api/record/${recordId}`);
    for (const id of optionIds) await request.delete(`${API}/api/selectoption/${id}`);
    if (propertyId) await request.delete(`${API}/api/fieldproperty/${propertyId}`);
  });

  test('select options are created and retrievable', async ({ request }) => {
    const res = await request.get(`${API}/api/selectoption`);
    expect(res.ok()).toBeTruthy();
    const options = await res.json();
    const ours = options.filter((o: any) => o.fieldPropertyId === propertyId);
    expect(ours.length).toBe(3);
  });

  test('create a field with select option values', async ({ request }) => {
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 0, y: 0, width: 3, height: 1,
        selectOptionIds: [optionIds[0]],
      },
    });
    expect(res.ok()).toBeTruthy();
    const field = await res.json();
    expect(field.selectOptionIds).toEqual([optionIds[0]]);
    expect(field.valueId).toBeTruthy();
  });

  test('update a field to multiple select options', async ({ request }) => {
    const created = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 4, y: 0, width: 3, height: 1,
        selectOptionIds: [optionIds[0]],
      },
    })).json();

    const res = await request.patch(`${API}/api/field`, {
      data: { ...created, selectOptionIds: [optionIds[0], optionIds[1]] },
    });
    expect(res.ok()).toBeTruthy();
    const updated = await res.json();
    expect(updated.selectOptionIds).toContain(optionIds[0]);
    expect(updated.selectOptionIds).toContain(optionIds[1]);
    expect(updated.selectOptionIds.length).toBe(2);
  });

  test('field property returns select options', async ({ request }) => {
    const res = await request.get(`${API}/api/fieldproperty/${propertyId}`);
    expect(res.ok()).toBeTruthy();
    const prop = await res.json();
    expect(prop.selectOptions).toBeTruthy();
    expect(prop.selectOptions.length).toBe(3);
    expect(prop.selectOptions[0].name).toBe('Active');
  });
});
