import { test, expect } from '@playwright/test';

test.describe('Record API', () => {
  test('GET /api/record returns a list', async ({ request }) => {
    const response = await request.get('/api/record');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');

    const records = await response.json();
    expect(Array.isArray(records)).toBeTruthy();
  });

  test('POST /api/record creates a record and GET returns it', async ({ request }) => {
    const newRecord = {
      id: crypto.randomUUID(),
      name: `E2E Test Record ${Date.now()}`,
      description: 'Created by Playwright e2e test',
      fields: [],
    };

    // Create
    const postResponse = await request.post('/api/record', { data: newRecord });
    expect(postResponse.ok()).toBeTruthy();

    const created = await postResponse.json();
    expect(created.name).toBe(newRecord.name);
    expect(created.id).toBeTruthy();

    // Verify it appears in the list
    const listResponse = await request.get('/api/record');
    const records = await listResponse.json();
    const found = records.find((r: any) => r.name === newRecord.name);
    expect(found).toBeTruthy();

    // Cleanup
    await request.delete(`/api/record/${created.id}`);
  });

  test('DELETE /api/record/:id removes the record', async ({ request }) => {
    // Create a record to delete
    const record = {
      id: crypto.randomUUID(),
      name: `E2E Delete Test ${Date.now()}`,
      description: 'Will be deleted',
      fields: [],
    };

    const postResponse = await request.post('/api/record', { data: record });
    const created = await postResponse.json();

    // Delete
    const deleteResponse = await request.delete(`/api/record/${created.id}`);
    expect(deleteResponse.ok()).toBeTruthy();

    // Verify gone
    const getResponse = await request.get(`/api/record/${created.id}`);
    expect(getResponse.status()).toBe(404);
  });
});
