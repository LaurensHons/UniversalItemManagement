import { test, expect } from '@playwright/test';

const API = 'http://localhost:5232';

test.describe('Record API - Extended CRUD', () => {
  const createdIds: string[] = [];

  test.afterAll(async ({ request }) => {
    for (const id of createdIds) {
      await request.delete(`${API}/api/record/${id}`);
    }
  });

  test('PATCH /api/record updates name and description', async ({ request }) => {
    const data = {
      id: crypto.randomUUID(),
      name: `Patch Record ${Date.now()}`,
      description: 'original description',
      fields: [],
    };
    const created = await (await request.post(`${API}/api/record`, { data })).json();
    createdIds.push(created.id);

    const newName = `Updated Record ${Date.now()}`;
    const newDesc = 'updated description';
    const res = await request.patch(`${API}/api/record`, {
      data: { ...created, name: newName, description: newDesc },
    });
    expect(res.ok()).toBeTruthy();

    const updated = await res.json();
    expect(updated.name).toBe(newName);
    expect(updated.description).toBe(newDesc);
  });

  test('GET /api/record/:id returns a single record', async ({ request }) => {
    const data = {
      id: crypto.randomUUID(),
      name: `GetById Record ${Date.now()}`,
      description: 'test',
      fields: [],
    };
    const created = await (await request.post(`${API}/api/record`, { data })).json();
    createdIds.push(created.id);

    const res = await request.get(`${API}/api/record/${created.id}`);
    expect(res.ok()).toBeTruthy();

    const record = await res.json();
    expect(record.id).toBe(created.id);
    expect(record.name).toBe(data.name);
    expect(record.description).toBe(data.description);
    expect(Array.isArray(record.fields)).toBeTruthy();
  });

  test('GET /api/record/:id returns 404 for non-existent id', async ({ request }) => {
    const res = await request.get(`${API}/api/record/${crypto.randomUUID()}`);
    expect(res.status()).toBe(404);
  });

  test('POST /api/record includes audit fields in response', async ({ request }) => {
    const data = {
      id: crypto.randomUUID(),
      name: `Audit Record ${Date.now()}`,
      description: 'audit test',
      fields: [],
    };
    const res = await request.post(`${API}/api/record`, { data });
    expect(res.ok()).toBeTruthy();

    const record = await res.json();
    createdIds.push(record.id);
    expect(record.createdOn).toBeTruthy();
    expect(record.modifiedOn).toBeTruthy();
  });

  test('record includes its fields when fetched by ID', async ({ request }) => {
    // Create record
    const recordData = {
      id: crypto.randomUUID(),
      name: `With Fields ${Date.now()}`,
      description: 'has fields',
      fields: [],
    };
    const record = await (await request.post(`${API}/api/record`, { data: recordData })).json();
    createdIds.push(record.id);

    // Create a property
    const prop = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `FieldProp ${Date.now()}`, type: 'Text' },
    })).json();

    // Create a field on this record
    const field = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId: record.id,
        fieldPropertyId: prop.id,
        x: 0, y: 0, width: 3, height: 1,
        textValue: 'nested check',
      },
    })).json();

    // Fetch record by ID and check fields are included
    const res = await request.get(`${API}/api/record/${record.id}`);
    expect(res.ok()).toBeTruthy();
    const fetched = await res.json();
    expect(fetched.fields.length).toBeGreaterThanOrEqual(1);

    const found = fetched.fields.find((f: any) => f.id === field.id);
    expect(found).toBeTruthy();
    expect(found.textValue).toBe('nested check');

    // Cleanup
    await request.delete(`${API}/api/field/${field.id}`);
    await request.delete(`${API}/api/fieldproperty/${prop.id}`);
  });

  test('DELETE /api/record/:id cascades to fields', async ({ request }) => {
    // Create record + property + field
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `Cascade ${Date.now()}`, description: 'cascade test', fields: [] },
    })).json();

    const prop = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `CascadeProp ${Date.now()}`, type: 'Text' },
    })).json();

    const field = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId: record.id, fieldPropertyId: prop.id,
        x: 0, y: 0, width: 3, height: 1,
      },
    })).json();

    // Delete the record
    const del = await request.delete(`${API}/api/record/${record.id}`);
    expect(del.ok()).toBeTruthy();

    // The field should be cascade-deleted
    const getField = await request.get(`${API}/api/field/${field.id}`);
    expect(getField.status()).toBe(404);

    // Cleanup property (not cascade-deleted)
    await request.delete(`${API}/api/fieldproperty/${prop.id}`);
  });
});
