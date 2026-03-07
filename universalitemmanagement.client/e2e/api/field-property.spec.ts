import { test, expect } from '@playwright/test';

const API = 'http://localhost:5232';

test.describe('FieldProperty API - CRUD', () => {
  const createdIds: string[] = [];

  test.afterAll(async ({ request }) => {
    for (const id of createdIds) {
      await request.delete(`${API}/api/fieldproperty/${id}`);
    }
  });

  test('GET /api/fieldproperty returns a list', async ({ request }) => {
    const res = await request.get(`${API}/api/fieldproperty`);
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toContain('application/json');
    const list = await res.json();
    expect(Array.isArray(list)).toBeTruthy();
  });

  test('POST /api/fieldproperty creates a Text property', async ({ request }) => {
    const data = { id: crypto.randomUUID(), name: `TextProp ${Date.now()}`, type: 'Text' };
    const res = await request.post(`${API}/api/fieldproperty`, { data });
    expect(res.ok()).toBeTruthy();

    const prop = await res.json();
    expect(prop.id).toBeTruthy();
    expect(prop.name).toBe(data.name);
    expect(prop.type).toBe('Text');
    createdIds.push(prop.id);
  });

  test('POST /api/fieldproperty creates a Boolean property', async ({ request }) => {
    const data = { id: crypto.randomUUID(), name: `BoolProp ${Date.now()}`, type: 'Boolean' };
    const res = await request.post(`${API}/api/fieldproperty`, { data });
    expect(res.ok()).toBeTruthy();

    const prop = await res.json();
    expect(prop.type).toBe('Boolean');
    createdIds.push(prop.id);
  });

  test('POST /api/fieldproperty creates a Date property', async ({ request }) => {
    const data = { id: crypto.randomUUID(), name: `DateProp ${Date.now()}`, type: 'Date' };
    const res = await request.post(`${API}/api/fieldproperty`, { data });
    expect(res.ok()).toBeTruthy();

    const prop = await res.json();
    expect(prop.type).toBe('Date');
    createdIds.push(prop.id);
  });

  test('POST /api/fieldproperty creates a Number property', async ({ request }) => {
    const data = { id: crypto.randomUUID(), name: `NumProp ${Date.now()}`, type: 'Number' };
    const res = await request.post(`${API}/api/fieldproperty`, { data });
    expect(res.ok()).toBeTruthy();

    const prop = await res.json();
    expect(prop.type).toBe('Number');
    createdIds.push(prop.id);
  });

  test('POST /api/fieldproperty creates a Select property', async ({ request }) => {
    const data = { id: crypto.randomUUID(), name: `SelectProp ${Date.now()}`, type: 'Select' };
    const res = await request.post(`${API}/api/fieldproperty`, { data });
    expect(res.ok()).toBeTruthy();

    const prop = await res.json();
    expect(prop.type).toBe('Select');
    createdIds.push(prop.id);
  });

  test('GET /api/fieldproperty/:id returns a single property', async ({ request }) => {
    const data = { id: crypto.randomUUID(), name: `GetByIdProp ${Date.now()}`, type: 'Text' };
    const created = await (await request.post(`${API}/api/fieldproperty`, { data })).json();
    createdIds.push(created.id);

    const res = await request.get(`${API}/api/fieldproperty/${created.id}`);
    expect(res.ok()).toBeTruthy();

    const prop = await res.json();
    expect(prop.id).toBe(created.id);
    expect(prop.name).toBe(data.name);
  });

  test('GET /api/fieldproperty/:id returns 404 for non-existent id', async ({ request }) => {
    const res = await request.get(`${API}/api/fieldproperty/${crypto.randomUUID()}`);
    expect(res.status()).toBe(404);
  });

  test('PATCH /api/fieldproperty updates name', async ({ request }) => {
    const data = { id: crypto.randomUUID(), name: `PatchProp ${Date.now()}`, type: 'Text' };
    const created = await (await request.post(`${API}/api/fieldproperty`, { data })).json();
    createdIds.push(created.id);

    const newName = `Updated ${Date.now()}`;
    const res = await request.patch(`${API}/api/fieldproperty`, {
      data: { ...created, name: newName },
    });
    expect(res.ok()).toBeTruthy();

    const updated = await res.json();
    expect(updated.name).toBe(newName);
  });

  test('DELETE /api/fieldproperty/:id removes the property', async ({ request }) => {
    const data = { id: crypto.randomUUID(), name: `DeleteProp ${Date.now()}`, type: 'Text' };
    const created = await (await request.post(`${API}/api/fieldproperty`, { data })).json();

    const del = await request.delete(`${API}/api/fieldproperty/${created.id}`);
    expect(del.ok()).toBeTruthy();

    const get = await request.get(`${API}/api/fieldproperty/${created.id}`);
    expect(get.status()).toBe(404);
  });

  test('Select property with options returns selectOptions in GET', async ({ request }) => {
    // Create a Select property
    const propData = { id: crypto.randomUUID(), name: `WithOpts ${Date.now()}`, type: 'Select' };
    const prop = await (await request.post(`${API}/api/fieldproperty`, { data: propData })).json();
    createdIds.push(prop.id);

    // Create options
    const optionIds: string[] = [];
    for (const [i, name] of ['Red', 'Green', 'Blue'].entries()) {
      const opt = await (await request.post(`${API}/api/selectoption`, {
        data: { id: crypto.randomUUID(), name, color: '#000000', order: i, fieldPropertyId: prop.id },
      })).json();
      optionIds.push(opt.id);
    }

    // GET the property - should include options
    const res = await request.get(`${API}/api/fieldproperty/${prop.id}`);
    expect(res.ok()).toBeTruthy();
    const fetched = await res.json();
    expect(fetched.selectOptions).toBeTruthy();
    expect(fetched.selectOptions.length).toBe(3);
    expect(fetched.selectOptions.map((o: any) => o.name)).toEqual(['Red', 'Green', 'Blue']);

    // Cleanup options
    for (const id of optionIds) {
      await request.delete(`${API}/api/selectoption/${id}`);
    }
  });
});
