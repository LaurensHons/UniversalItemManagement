import { test, expect } from '@playwright/test';

const API = 'http://localhost:5232';

test.describe('Field API - Text value', () => {
  let recordId: string;
  let propertyId: string;
  const fieldIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `Text Field Test ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();
    recordId = record.id;

    const property = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `TextProp ${Date.now()}`, type: 'Text' },
    })).json();
    propertyId = property.id;
  });

  test.afterAll(async ({ request }) => {
    for (const id of fieldIds) await request.delete(`${API}/api/field/${id}`);
    if (recordId) await request.delete(`${API}/api/record/${recordId}`);
    if (propertyId) await request.delete(`${API}/api/fieldproperty/${propertyId}`);
  });

  test('create a field with a text value', async ({ request }) => {
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 0, y: 0, width: 3, height: 1,
        textValue: 'Hello World',
      },
    });
    expect(res.ok()).toBeTruthy();
    const field = await res.json();
    expect(field.textValue).toBe('Hello World');
    expect(field.valueId).toBeTruthy();
    fieldIds.push(field.id);
  });

  test('update a field text value', async ({ request }) => {
    const created = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 4, y: 0, width: 3, height: 1,
        textValue: 'original',
      },
    })).json();
    fieldIds.push(created.id);

    const res = await request.patch(`${API}/api/field`, {
      data: { ...created, textValue: 'updated text' },
    });
    expect(res.ok()).toBeTruthy();
    const updated = await res.json();
    expect(updated.textValue).toBe('updated text');
  });

  test('create a field without text value', async ({ request }) => {
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 8, y: 0, width: 3, height: 1,
      },
    });
    expect(res.ok()).toBeTruthy();
    const field = await res.json();
    expect(field.textValue).toBeNull();
    expect(field.valueId).toBeNull();
    fieldIds.push(field.id);
  });
});

test.describe('Field API - Boolean value', () => {
  let recordId: string;
  let propertyId: string;
  const fieldIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `Bool Field Test ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();
    recordId = record.id;

    const property = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `BoolProp ${Date.now()}`, type: 'Boolean' },
    })).json();
    propertyId = property.id;
  });

  test.afterAll(async ({ request }) => {
    for (const id of fieldIds) await request.delete(`${API}/api/field/${id}`);
    if (recordId) await request.delete(`${API}/api/record/${recordId}`);
    if (propertyId) await request.delete(`${API}/api/fieldproperty/${propertyId}`);
  });

  test('create a field with booleanValue true', async ({ request }) => {
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 0, y: 0, width: 3, height: 1,
        booleanValue: true,
      },
    });
    expect(res.ok()).toBeTruthy();
    const field = await res.json();
    expect(field.booleanValue).toBe(true);
    expect(field.valueId).toBeTruthy();
    fieldIds.push(field.id);
  });

  test('create a field with booleanValue false', async ({ request }) => {
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 4, y: 0, width: 3, height: 1,
        booleanValue: false,
      },
    });
    expect(res.ok()).toBeTruthy();
    const field = await res.json();
    expect(field.booleanValue).toBe(false);
    expect(field.valueId).toBeTruthy();
    fieldIds.push(field.id);
  });

  test('toggle boolean value via PATCH', async ({ request }) => {
    const created = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 8, y: 0, width: 3, height: 1,
        booleanValue: false,
      },
    })).json();
    fieldIds.push(created.id);

    const res = await request.patch(`${API}/api/field`, {
      data: { ...created, booleanValue: true },
    });
    expect(res.ok()).toBeTruthy();
    const updated = await res.json();
    expect(updated.booleanValue).toBe(true);
  });
});

test.describe('Field API - Date value', () => {
  let recordId: string;
  let propertyId: string;
  const fieldIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `Date Field Test ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();
    recordId = record.id;

    const property = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `DateProp ${Date.now()}`, type: 'Date' },
    })).json();
    propertyId = property.id;
  });

  test.afterAll(async ({ request }) => {
    for (const id of fieldIds) await request.delete(`${API}/api/field/${id}`);
    if (recordId) await request.delete(`${API}/api/record/${recordId}`);
    if (propertyId) await request.delete(`${API}/api/fieldproperty/${propertyId}`);
  });

  test('create a field with a date value', async ({ request }) => {
    const dateStr = '2026-03-15T00:00:00Z';
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 0, y: 0, width: 3, height: 1,
        dateValue: dateStr,
      },
    });
    expect(res.ok()).toBeTruthy();
    const field = await res.json();
    expect(field.dateValue).toBeTruthy();
    expect(new Date(field.dateValue).toISOString().slice(0, 10)).toBe('2026-03-15');
    expect(field.valueId).toBeTruthy();
    fieldIds.push(field.id);
  });

  test('update a date value', async ({ request }) => {
    const created = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 4, y: 0, width: 3, height: 1,
        dateValue: '2026-01-01T00:00:00Z',
      },
    })).json();
    fieldIds.push(created.id);

    const res = await request.patch(`${API}/api/field`, {
      data: { ...created, dateValue: '2026-12-25T00:00:00Z' },
    });
    expect(res.ok()).toBeTruthy();
    const updated = await res.json();
    expect(new Date(updated.dateValue).toISOString().slice(0, 10)).toBe('2026-12-25');
  });

  test('create a field without date value', async ({ request }) => {
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 8, y: 0, width: 3, height: 1,
      },
    });
    expect(res.ok()).toBeTruthy();
    const field = await res.json();
    expect(field.dateValue).toBeNull();
    expect(field.valueId).toBeNull();
    fieldIds.push(field.id);
  });
});

test.describe('Field API - DELETE', () => {
  let recordId: string;
  let propertyId: string;

  test.beforeAll(async ({ request }) => {
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `Delete Field Test ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();
    recordId = record.id;

    const property = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `DelProp ${Date.now()}`, type: 'Text' },
    })).json();
    propertyId = property.id;
  });

  test.afterAll(async ({ request }) => {
    if (recordId) await request.delete(`${API}/api/record/${recordId}`);
    if (propertyId) await request.delete(`${API}/api/fieldproperty/${propertyId}`);
  });

  test('DELETE /api/field/:id removes a field', async ({ request }) => {
    const created = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 0, y: 0, width: 3, height: 1,
      },
    })).json();

    const del = await request.delete(`${API}/api/field/${created.id}`);
    expect(del.ok()).toBeTruthy();

    const get = await request.get(`${API}/api/field/${created.id}`);
    expect(get.status()).toBe(404);
  });

  test('DELETE /api/field/:id with value leaves FieldValue intact', async ({ request }) => {
    // Field references FieldValue via FK — deleting Field does NOT cascade to FieldValue
    const created = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId, fieldPropertyId: propertyId,
        x: 4, y: 0, width: 3, height: 1,
        textValue: 'field will be deleted',
      },
    })).json();

    const valueId = created.valueId;
    expect(valueId).toBeTruthy();

    const del = await request.delete(`${API}/api/field/${created.id}`);
    expect(del.ok()).toBeTruthy();

    // FieldValue still exists (Field is the dependent, not the principal)
    const getVal = await request.get(`${API}/api/fieldvalue/${valueId}`);
    expect(getVal.ok()).toBeTruthy();

    // Cleanup orphaned FieldValue
    await request.delete(`${API}/api/fieldvalue/${valueId}`);
  });

  test('GET /api/field returns list of fields', async ({ request }) => {
    const res = await request.get(`${API}/api/field`);
    expect(res.ok()).toBeTruthy();
    const list = await res.json();
    expect(Array.isArray(list)).toBeTruthy();
  });
});
