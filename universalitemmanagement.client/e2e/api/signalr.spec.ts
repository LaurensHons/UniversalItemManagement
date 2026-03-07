import { test, expect } from '@playwright/test';
import * as signalR from '@microsoft/signalr';

const API = 'http://localhost:5232';
const HUB_URL = `${API}/Hub`;

/**
 * Helper: create a SignalR connection and wait for it to be connected.
 */
async function createHubConnection(): Promise<signalR.HubConnection> {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, { transport: signalR.HttpTransportType.WebSockets })
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  await connection.start();
  return connection;
}

/**
 * Helper: listen for a specific SignalR method+topic and resolve when predicate matches.
 * This is resilient to parallel test execution because it filters by a predicate
 * instead of resolving on the first event for the topic.
 */
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

// Run SignalR tests serially to avoid cross-test interference
test.describe.configure({ mode: 'serial' });

test.describe('SignalR - Real-time notifications', () => {
  let connection: signalR.HubConnection;

  test.beforeEach(async () => {
    connection = await createHubConnection();
  });

  test.afterEach(async () => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
      await connection.stop();
    }
  });

  test('receives AddEntities event when a record is created', async ({ request }) => {
    const data = {
      id: crypto.randomUUID(),
      name: `SignalR Add Test ${Date.now()}`,
      description: 'signalr e2e',
      fields: [],
    };

    // Start listening BEFORE making the API call — filter by expected ID
    const signalPromise = waitForSignal<any[]>(
      connection, 'AddEntities', 'Record',
      (entities) => entities.some((e: any) => e.id === data.id),
    );

    // Create a record (no SRConnectionID header = broadcast to ALL)
    const res = await request.post(`${API}/api/record`, { data });
    expect(res.ok()).toBeTruthy();

    // Wait for the SignalR event that contains our entity
    const entities = await signalPromise;
    expect(Array.isArray(entities)).toBeTruthy();
    const received = entities.find((e: any) => e.id === data.id);
    expect(received).toBeTruthy();
    expect(received.name).toBe(data.name);

    // Cleanup
    await request.delete(`${API}/api/record/${data.id}`);
  });

  test('receives UpdateEntities event when a record is updated', async ({ request }) => {
    // Create a record first
    const data = {
      id: crypto.randomUUID(),
      name: `SignalR Update Test ${Date.now()}`,
      description: 'original',
      fields: [],
    };
    const created = await (await request.post(`${API}/api/record`, { data })).json();

    // Start listening — filter by expected ID
    const signalPromise = waitForSignal<any[]>(
      connection, 'UpdateEntities', 'Record',
      (entities) => entities.some((e: any) => e.id === created.id),
    );

    // Update the record
    const newName = `Updated ${Date.now()}`;
    const patchRes = await request.patch(`${API}/api/record`, {
      data: { ...created, name: newName },
    });
    expect(patchRes.ok()).toBeTruthy();

    // Wait for the SignalR event
    const entities = await signalPromise;
    const received = entities.find((e: any) => e.id === created.id);
    expect(received).toBeTruthy();

    // Cleanup
    await request.delete(`${API}/api/record/${created.id}`);
  });

  test('receives DeleteEntities event when a record is deleted', async ({ request }) => {
    // Create a record
    const data = {
      id: crypto.randomUUID(),
      name: `SignalR Delete Test ${Date.now()}`,
      description: 'will be deleted',
      fields: [],
    };
    const created = await (await request.post(`${API}/api/record`, { data })).json();

    // Start listening — filter for our specific ID
    const signalPromise = waitForSignal<string[]>(
      connection, 'DeleteEntities', 'Record',
      (ids) => ids.includes(created.id),
    );

    // Delete the record
    const del = await request.delete(`${API}/api/record/${created.id}`);
    expect(del.ok()).toBeTruthy();

    // Wait for the SignalR event
    const deletedIds = await signalPromise;
    expect(Array.isArray(deletedIds)).toBeTruthy();
    expect(deletedIds).toContain(created.id);
  });

  test('receives AddEntities event for FieldProperty topic', async ({ request }) => {
    const data = { id: crypto.randomUUID(), name: `SR Prop ${Date.now()}`, type: 'Text' };

    const signalPromise = waitForSignal<any[]>(
      connection, 'AddEntities', 'FieldProperty',
      (entities) => entities.some((e: any) => e.id === data.id),
    );

    const res = await request.post(`${API}/api/fieldproperty`, { data });
    expect(res.ok()).toBeTruthy();

    const entities = await signalPromise;
    const received = entities.find((e: any) => e.id === data.id);
    expect(received).toBeTruthy();

    // Cleanup
    await request.delete(`${API}/api/fieldproperty/${data.id}`);
  });

  test('receives AddEntities event for Field topic', async ({ request }) => {
    // Setup: create record + property
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `SR Field ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();
    const prop = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `SR FieldProp ${Date.now()}`, type: 'Text' },
    })).json();

    const fieldId = crypto.randomUUID();
    const signalPromise = waitForSignal<any[]>(
      connection, 'AddEntities', 'Field',
      (entities) => entities.some((e: any) => e.id === fieldId),
    );

    const fieldData = {
      id: fieldId,
      recordId: record.id,
      fieldPropertyId: prop.id,
      x: 0, y: 0, width: 3, height: 1,
    };
    const res = await request.post(`${API}/api/field`, { data: fieldData });
    expect(res.ok()).toBeTruthy();

    const entities = await signalPromise;
    const received = entities.find((e: any) => e.id === fieldId);
    expect(received).toBeTruthy();

    // Cleanup
    await request.delete(`${API}/api/field/${fieldId}`);
    await request.delete(`${API}/api/record/${record.id}`);
    await request.delete(`${API}/api/fieldproperty/${prop.id}`);
  });

  test('receives DeleteEntities event for Field topic', async ({ request }) => {
    // Setup
    const record = await (await request.post(`${API}/api/record`, {
      data: { id: crypto.randomUUID(), name: `SR DelField ${Date.now()}`, description: 'e2e', fields: [] },
    })).json();
    const prop = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `SR DelFieldProp ${Date.now()}`, type: 'Text' },
    })).json();
    const field = await (await request.post(`${API}/api/field`, {
      data: {
        id: crypto.randomUUID(),
        recordId: record.id, fieldPropertyId: prop.id,
        x: 0, y: 0, width: 3, height: 1,
      },
    })).json();

    const signalPromise = waitForSignal<string[]>(
      connection, 'DeleteEntities', 'Field',
      (ids) => ids.includes(field.id),
    );

    await request.delete(`${API}/api/field/${field.id}`);

    const deletedIds = await signalPromise;
    expect(deletedIds).toContain(field.id);

    // Cleanup
    await request.delete(`${API}/api/record/${record.id}`);
    await request.delete(`${API}/api/fieldproperty/${prop.id}`);
  });

  test('does NOT receive own event when SRConnectionID header is sent', async ({ request }) => {
    // This verifies the "exclude sender" mechanism.
    const myConnectionId = connection.connectionId!;
    expect(myConnectionId).toBeTruthy();

    const uniqueName = `SR Exclude ${Date.now()}-${crypto.randomUUID()}`;
    let receivedOwnEvent = false;

    connection.on('AddEntities', (topic: string, entities: any[]) => {
      if (topic === 'Record' && entities.some((e: any) => e.name === uniqueName)) {
        receivedOwnEvent = true;
      }
    });

    // Create a record WITH the SRConnectionID header matching our listener
    const data = {
      id: crypto.randomUUID(),
      name: uniqueName,
      description: 'exclude test',
      fields: [],
    };
    const res = await request.post(`${API}/api/record`, {
      data,
      headers: { SRConnectionID: myConnectionId },
    });
    expect(res.ok()).toBeTruthy();

    // Wait enough time for the event to arrive (if it were going to)
    await new Promise(r => setTimeout(r, 5000));

    expect(receivedOwnEvent).toBe(false);

    // Cleanup
    await request.delete(`${API}/api/record/${data.id}`);
  });

  test('second client receives event that first client sends', async ({ request }) => {
    // Two connections: sender (connection) and receiver (conn2)
    const conn2 = await createHubConnection();

    try {
      const data = {
        id: crypto.randomUUID(),
        name: `SR MultiClient ${Date.now()}`,
        description: 'multi-client',
        fields: [],
      };

      // conn2 is the receiver — filter for our specific entity
      const signalPromise = waitForSignal<any[]>(
        conn2, 'AddEntities', 'Record',
        (entities) => entities.some((e: any) => e.id === data.id),
      );

      // Use connection's ID as the sender — conn2 should still receive it
      const res = await request.post(`${API}/api/record`, {
        data,
        headers: { SRConnectionID: connection.connectionId! },
      });
      expect(res.ok()).toBeTruthy();

      // conn2 (the non-sender) should receive the event
      const entities = await signalPromise;
      const received = entities.find((e: any) => e.id === data.id);
      expect(received).toBeTruthy();

      // Cleanup
      await request.delete(`${API}/api/record/${data.id}`);
    } finally {
      await conn2.stop();
    }
  });

  test('receives SelectOption events', async ({ request }) => {
    // Create a property for the option
    const prop = await (await request.post(`${API}/api/fieldproperty`, {
      data: { id: crypto.randomUUID(), name: `SR SelectProp ${Date.now()}`, type: 'Select' },
    })).json();

    const optId = crypto.randomUUID();
    const signalPromise = waitForSignal<any[]>(
      connection, 'AddEntities', 'SelectOption',
      (entities) => entities.some((e: any) => e.id === optId),
    );

    const optData = {
      id: optId,
      name: 'SignalR Option',
      color: '#ff0000',
      order: 0,
      fieldPropertyId: prop.id,
    };
    const res = await request.post(`${API}/api/selectoption`, { data: optData });
    expect(res.ok()).toBeTruthy();

    const entities = await signalPromise;
    const received = entities.find((e: any) => e.id === optId);
    expect(received).toBeTruthy();

    // Cleanup
    await request.delete(`${API}/api/selectoption/${optId}`);
    await request.delete(`${API}/api/fieldproperty/${prop.id}`);
  });
});
