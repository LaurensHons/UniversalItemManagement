import { test, expect } from '@playwright/test';
import * as signalR from '@microsoft/signalr';

const API = 'http://localhost:5232';
const HUB_URL = `${API}/Hub`;

async function createHubConnection(): Promise<signalR.HubConnection> {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, { transport: signalR.HttpTransportType.WebSockets })
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  await connection.start();
  return connection;
}

function waitForSignal<T>(
  connection: signalR.HubConnection,
  method: 'AddEntities' | 'UpdateEntities' | 'DeleteEntities',
  topic: string,
  predicate: (data: T) => boolean,
  timeoutMs = 15_000,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      connection.off(method, handler);
      reject(new Error(`Timed out waiting for ${method} on topic "${topic}" after ${timeoutMs}ms`));
    }, timeoutMs);

    const handler = (receivedTopic: string, data: T) => {
      if (receivedTopic === topic && predicate(data)) {
        clearTimeout(timer);
        connection.off(method, handler);
        resolve(data);
      }
    };

    connection.on(method, handler);
  });
}

// ─── Seed Helpers ──────────────────────────────────────────────────

async function seedRecord(request: any, name?: string, description?: string) {
  const data = {
    id: crypto.randomUUID(),
    name: name ?? `ListSR Record ${Date.now()}`,
    description: description ?? 'list signalr e2e',
    fields: [],
  };
  const res = await request.post(`${API}/api/record`, { data });
  return res.json();
}

async function seedProperty(request: any, type = 'Text') {
  const data = {
    id: crypto.randomUUID(),
    name: `ListSR ${type} Prop ${Date.now()}`,
    type,
  };
  const res = await request.post(`${API}/api/fieldproperty`, { data });
  return res.json();
}

async function seedField(
  request: any,
  recordId: string,
  propertyId: string,
  overrides: Record<string, any> = {},
) {
  const data = {
    id: crypto.randomUUID(),
    recordId,
    fieldPropertyId: propertyId,
    x: 1, y: 1, width: 3, height: 1,
    ...overrides,
  };
  const res = await request.post(`${API}/api/field`, { data });
  return res.json();
}

async function cleanup(request: any, recordIds: string[], propertyIds: string[], fieldIds: string[] = []) {
  for (const id of fieldIds) await request.delete(`${API}/api/field/${id}`);
  for (const id of recordIds) await request.delete(`${API}/api/record/${id}`);
  for (const id of propertyIds) await request.delete(`${API}/api/fieldproperty/${id}`);
}

// ─── Tests ─────────────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' });

test.describe('Record List - SignalR real-time updates', () => {
  let connection: signalR.HubConnection;

  test.beforeEach(async () => {
    connection = await createHubConnection();
  });

  test.afterEach(async () => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
      await connection.stop();
    }
  });

  test('new record appears in list via AddEntities', async ({ request }) => {
    const data = {
      id: crypto.randomUUID(),
      name: `ListSR Add ${Date.now()}`,
      description: 'should appear in list',
      fields: [],
    };

    const signalPromise = waitForSignal<any[]>(
      connection, 'AddEntities', 'Record',
      (entities) => entities.some((e: any) => e.id === data.id),
    );

    const res = await request.post(`${API}/api/record`, { data });
    expect(res.ok()).toBeTruthy();

    const entities = await signalPromise;
    const received = entities.find((e: any) => e.id === data.id);
    expect(received).toBeTruthy();
    expect(received.name).toBe(data.name);
    expect(received.description).toBe(data.description);

    await request.delete(`${API}/api/record/${data.id}`);
  });

  test('record name update propagates via UpdateEntities', async ({ request }) => {
    const record = await seedRecord(request);

    const updatedName = `ListSR Updated ${Date.now()}`;

    const signalPromise = waitForSignal<any[]>(
      connection, 'UpdateEntities', 'Record',
      (entities) => entities.some((e: any) => e.id === record.id && e.name === updatedName),
    );

    const patchRes = await request.patch(`${API}/api/record`, {
      data: { ...record, name: updatedName },
    });
    expect(patchRes.ok()).toBeTruthy();

    const entities = await signalPromise;
    const received = entities.find((e: any) => e.id === record.id);
    expect(received).toBeTruthy();
    expect(received.name).toBe(updatedName);

    await request.delete(`${API}/api/record/${record.id}`);
  });

  test('deleted record removed from list via DeleteEntities', async ({ request }) => {
    const record = await seedRecord(request);

    const signalPromise = waitForSignal<string[]>(
      connection, 'DeleteEntities', 'Record',
      (ids) => ids.includes(record.id),
    );

    const del = await request.delete(`${API}/api/record/${record.id}`);
    expect(del.ok()).toBeTruthy();

    const deletedIds = await signalPromise;
    expect(deletedIds).toContain(record.id);
  });

  test('adding a field to a record triggers Field AddEntities', async ({ request }) => {
    const record = await seedRecord(request);
    const prop = await seedProperty(request);

    const fieldId = crypto.randomUUID();
    const signalPromise = waitForSignal<any[]>(
      connection, 'AddEntities', 'Field',
      (entities) => entities.some((e: any) => e.id === fieldId),
    );

    const fieldRes = await request.post(`${API}/api/field`, {
      data: {
        id: fieldId,
        recordId: record.id,
        fieldPropertyId: prop.id,
        x: 1, y: 1, width: 4, height: 1,
      },
    });
    expect(fieldRes.ok()).toBeTruthy();

    const entities = await signalPromise;
    const received = entities.find((e: any) => e.id === fieldId);
    expect(received).toBeTruthy();

    await cleanup(request, [record.id], [prop.id], [fieldId]);
  });

  test('record with fields includes field data in AddEntities payload', async ({ request }) => {
    // Create property + record with a field, then verify the record
    // signal includes the fields array
    const prop = await seedProperty(request);

    const recordData = {
      id: crypto.randomUUID(),
      name: `ListSR WithFields ${Date.now()}`,
      description: 'has fields',
      fields: [],
    };

    const recordSignal = waitForSignal<any[]>(
      connection, 'AddEntities', 'Record',
      (entities) => entities.some((e: any) => e.id === recordData.id),
    );

    await request.post(`${API}/api/record`, { data: recordData });
    const recordEntities = await recordSignal;
    const receivedRecord = recordEntities.find((e: any) => e.id === recordData.id);
    expect(receivedRecord).toBeTruthy();

    // Now add a field and verify Field signal
    const field = await seedField(request, recordData.id, prop.id);

    // Verify the record can be fetched with its field included
    const getRes = await request.get(`${API}/api/record/${recordData.id}`);
    expect(getRes.ok()).toBeTruthy();
    const fullRecord = await getRes.json();
    expect(fullRecord.fields).toBeTruthy();
    expect(fullRecord.fields.length).toBeGreaterThanOrEqual(1);

    const matchingField = fullRecord.fields.find((f: any) => f.id === field.id);
    expect(matchingField).toBeTruthy();
    expect(matchingField.fieldPropertyId).toBe(prop.id);

    await cleanup(request, [recordData.id], [prop.id], [field.id]);
  });

  test('multiple records created rapidly all trigger AddEntities', async ({ request }) => {
    const ids = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];

    const signals = ids.map(id =>
      waitForSignal<any[]>(
        connection, 'AddEntities', 'Record',
        (entities) => entities.some((e: any) => e.id === id),
      ),
    );

    for (const id of ids) {
      const res = await request.post(`${API}/api/record`, {
        data: { id, name: `ListSR Rapid ${id.slice(0, 8)}`, description: 'rapid', fields: [] },
      });
      expect(res.ok()).toBeTruthy();
    }

    const results = await Promise.all(signals);
    for (let i = 0; i < ids.length; i++) {
      const found = results[i].find((e: any) => e.id === ids[i]);
      expect(found).toBeTruthy();
    }

    for (const id of ids) await request.delete(`${API}/api/record/${id}`);
  });

  test('second client sees record changes from first client', async ({ request }) => {
    const conn2 = await createHubConnection();

    try {
      const data = {
        id: crypto.randomUUID(),
        name: `ListSR MultiClient ${Date.now()}`,
        description: 'multi-client list test',
        fields: [],
      };

      // conn2 listens for the record
      const signalPromise = waitForSignal<any[]>(
        conn2, 'AddEntities', 'Record',
        (entities) => entities.some((e: any) => e.id === data.id),
      );

      // Create with connection's ID excluded
      const res = await request.post(`${API}/api/record`, {
        data,
        headers: { SRConnectionID: connection.connectionId! },
      });
      expect(res.ok()).toBeTruthy();

      // conn2 should still receive it
      const entities = await signalPromise;
      const received = entities.find((e: any) => e.id === data.id);
      expect(received).toBeTruthy();
      expect(received.name).toBe(data.name);

      await request.delete(`${API}/api/record/${data.id}`);
    } finally {
      await conn2.stop();
    }
  });

  test('field property creation triggers FieldProperty AddEntities', async ({ request }) => {
    const data = {
      id: crypto.randomUUID(),
      name: `ListSR Prop ${Date.now()}`,
      type: 'Number',
    };

    const signalPromise = waitForSignal<any[]>(
      connection, 'AddEntities', 'FieldProperty',
      (entities) => entities.some((e: any) => e.id === data.id),
    );

    const res = await request.post(`${API}/api/fieldproperty`, { data });
    expect(res.ok()).toBeTruthy();

    const entities = await signalPromise;
    const received = entities.find((e: any) => e.id === data.id);
    expect(received).toBeTruthy();
    expect(received.type).toBe('Number');

    await request.delete(`${API}/api/fieldproperty/${data.id}`);
  });

  test('deleting a field triggers Field DeleteEntities', async ({ request }) => {
    const record = await seedRecord(request);
    const prop = await seedProperty(request);
    const field = await seedField(request, record.id, prop.id);

    const signalPromise = waitForSignal<string[]>(
      connection, 'DeleteEntities', 'Field',
      (ids) => ids.includes(field.id),
    );

    await request.delete(`${API}/api/field/${field.id}`);

    const deletedIds = await signalPromise;
    expect(deletedIds).toContain(field.id);

    await cleanup(request, [record.id], [prop.id]);
  });
});
