import { test, expect } from '@playwright/test';

const API = 'http://localhost:5232';

test.describe('Error Handling - API responses', () => {
  test('POST /api/field with invalid RecordId returns 400 with structured error', async ({ request }) => {
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId: crypto.randomUUID(),
        fieldPropertyId: crypto.randomUUID(),
        x: 0, y: 0, width: 3, height: 1,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toBeTruthy();
    expect(body.statusCode).toBe(400);
    expect(body.path).toContain('/api/field');
    expect(body.traceId).toBeTruthy();
    expect(body.timestamp).toBeTruthy();
  });

  test('error response timestamp is recent', async ({ request }) => {
    const before = Date.now();
    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId: crypto.randomUUID(),
        fieldPropertyId: crypto.randomUUID(),
        x: 0, y: 0, width: 3, height: 1,
      },
    });

    const body = await res.json();
    const timestamp = new Date(body.timestamp).getTime();
    const after = Date.now();
    // Timestamp should be within a reasonable window (allow 30s for clock skew)
    expect(timestamp).toBeGreaterThan(before - 30_000);
    expect(timestamp).toBeLessThan(after + 30_000);
  });

  test('GET /api/record/:id with non-existent id returns 404', async ({ request }) => {
    const res = await request.get(`${API}/api/record/${crypto.randomUUID()}`);
    expect(res.status()).toBe(404);
  });

  test('GET /api/field/:id with non-existent id returns 404', async ({ request }) => {
    const res = await request.get(`${API}/api/field/${crypto.randomUUID()}`);
    expect(res.status()).toBe(404);
  });

  test('GET /api/fieldproperty/:id with non-existent id returns 404', async ({ request }) => {
    const res = await request.get(`${API}/api/fieldproperty/${crypto.randomUUID()}`);
    expect(res.status()).toBe(404);
  });

  test('POST /api/field with non-existent FieldPropertyId returns error mentioning FieldProperty', async ({ request }) => {
    // First create a real record
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `ErrTest ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();

    const res = await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId: record.id,
        fieldPropertyId: crypto.randomUUID(), // does not exist
        x: 0, y: 0, width: 3, height: 1,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('FieldProperty');
    expect(body.message).toContain('does not exist');

    // Cleanup
    await request.delete(`${API}/api/record/${record.id}`);
  });

  test('PATCH /api/field with non-existent RecordId returns 400', async ({ request }) => {
    // Create valid setup
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `PatchErr ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();
    const prop = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `PatchErrProp ${Date.now()}`, type: 'Text' },
    })).json();
    const field = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId: record.id, fieldPropertyId: prop.id,
        x: 0, y: 0, width: 3, height: 1,
      },
    })).json();

    // Try to PATCH with a bad recordId
    const res = await request.patch(`${API}/api/field`, {
      data: { ...field, recordId: crypto.randomUUID() },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('Record');
    expect(body.message).toContain('does not exist');

    // Cleanup
    await request.delete(`${API}/api/field/${field.id}`);
    await request.delete(`${API}/api/record/${record.id}`);
    await request.delete(`${API}/api/fieldproperty/${prop.id}`);
  });

  test('all list endpoints return JSON arrays', async ({ request }) => {
    const endpoints = ['/api/record', '/api/field', '/api/fieldproperty', '/api/selectoption', '/api/fieldvalue'];
    for (const endpoint of endpoints) {
      const res = await request.get(`${API}${endpoint}`);
      expect(res.ok(), `${endpoint} should return 200`).toBeTruthy();
      expect(res.headers()['content-type']).toContain('application/json');
      const body = await res.json();
      expect(Array.isArray(body), `${endpoint} should return an array`).toBeTruthy();
    }
  });
});
