import { validateVrmFile } from './vrm-file';

const DATABASE_NAME = 'local-ai-tuber-assets';
const STORE_NAME = 'vrm-models';
const PNGTUBER_STORE_NAME = 'pngtuber-models';
const DATABASE_VERSION = 2;
const SELECTED_MODEL_KEY = 'local-ai-tuber-selected-vrm';

export interface StoredVrmModel {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  data: ArrayBuffer;
}

export type VrmModelSummary = Omit<StoredVrmModel, 'data'>;

function readFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () =>
      reject(reader.error ?? new Error('Unable to read VRM model'));
    reader.readAsArrayBuffer(file);
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction failed'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME))
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      if (!request.result.objectStoreNames.contains(PNGTUBER_STORE_NAME))
        request.result.createObjectStore(PNGTUBER_STORE_NAME, {
          keyPath: 'id',
        });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Unable to open model storage'));
  });
}

export async function saveVrmModel(file: File): Promise<StoredVrmModel> {
  validateVrmFile(file);
  const model: StoredVrmModel = {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    createdAt: new Date().toISOString(),
    data: await readFile(file),
  };
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(model);
    await transactionComplete(transaction);
    return model;
  } finally {
    database.close();
  }
}

export async function listVrmModels(): Promise<VrmModelSummary[]> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const records = await requestResult<StoredVrmModel[]>(
      transaction.objectStore(STORE_NAME).getAll(),
    );
    return records
      .map((record) => ({
        id: record.id,
        name: record.name,
        size: record.size,
        createdAt: record.createdAt,
      }))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } finally {
    database.close();
  }
}

export async function getVrmModel(
  id: string,
): Promise<StoredVrmModel | undefined> {
  const database = await openDatabase();
  try {
    return await requestResult<StoredVrmModel | undefined>(
      database
        .transaction(STORE_NAME, 'readonly')
        .objectStore(STORE_NAME)
        .get(id),
    );
  } finally {
    database.close();
  }
}

export async function deleteVrmModel(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export function readSelectedVrmModelId(): string | undefined {
  return localStorage.getItem(SELECTED_MODEL_KEY) ?? undefined;
}

export function writeSelectedVrmModelId(id?: string): void {
  if (id) localStorage.setItem(SELECTED_MODEL_KEY, id);
  else localStorage.removeItem(SELECTED_MODEL_KEY);
}
