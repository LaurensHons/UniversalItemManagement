import { test, expect } from '@playwright/test';

test.describe('Field API - FK Validation', () => {
  let recordId: string;
  let fieldPropertyId: string;

  test.beforeAll(async ({ request }) => {
    // Seed a record and a field property for valid FK references
    const recordRes = await request.post('/api/record', {
      data: {
        id: crypto.randomUUID(),
        name: `E2E FK Test Record ${Date.now()}`,
        description: 'Seeded for FK validation tests',
        fields: [],
      },
    });
    const record = await recordRes.json();
    recordId = record.id;

    const propertyRes = await request.post('/api/fieldproperty', {
      data: {
        id: crypto.randomUUID(),
        name: `E2E FK Test Property ${Date.now()}`,
        type: 'Text',
      },
    });
    const property = await propertyRes.json();
    fieldPropertyId = property.id;
  });

  test.afterAll(async ({ request }) => {
    if (recordId) await request.delete(`/api/record/${recordId}`);
    if (fieldPropertyId) await request.delete(`/api/fieldproperty/${fieldPropertyId}`);
  });

  test('POST /api/field with non-existent RecordId returns 400', async ({ request }) => {
    const response = await request.post('/api/field', {
      data: {
        id: crypto.randomUUID(),
        recordId: crypto.randomUUID(), // does not exist
        fieldPropertyId: fieldPropertyId,
        x: 0, y: 0, width: 3, height: 1,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain('Record');
    expect(body.message).toContain('does not exist');
  });

  test('POST /api/field with non-existent FieldPropertyId returns 400', async ({ request }) => {
    const response = await request.post('/api/field', {
      data: {
        id: crypto.randomUUID(),
        recordId: recordId,
        fieldPropertyId: crypto.randomUUID(), // does not exist
        x: 0, y: 0, width: 3, height: 1,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain('FieldProperty');
    expect(body.message).toContain('does not exist');
  });

  test('POST /api/field with valid FKs succeeds', async ({ request }) => {
    const response = await request.post('/api/field', {
      data: {
        id: crypto.randomUUID(),
        recordId: recordId,
        fieldPropertyId: fieldPropertyId,
        x: 0, y: 0, width: 3, height: 1,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.id).toBeTruthy();
  });
});
