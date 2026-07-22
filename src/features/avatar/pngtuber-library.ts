import { validatePngTuberVideo } from './pngtuber';

const DATABASE_NAME = 'local-ai-tuber-assets';
const STORE_NAME = 'pngtuber-models';
const VRM_STORE_NAME = 'vrm-models';
const DATABASE_VERSION = 2;
const MODEL_ID = 'default';

export interface StoredPngTuberVideo {
  name: string;
  type: string;
  size: number;
  data: ArrayBuffer;
}

export interface StoredPngTuberModel {
  id: typeof MODEL_ID;
  idle?: StoredPngTuberVideo;
  talking?: StoredPngTuberVideo;
  updatedAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME))
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      if (!request.result.objectStoreNames.contains(VRM_STORE_NAME))
        request.result.createObjectStore(VRM_STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Unable to open PNGTuber storage'));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('PNGTuber storage request failed'));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('PNGTuber storage failed'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('PNGTuber storage aborted'));
  });
}

function readFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () =>
      reject(reader.error ?? new Error('Unable to read PNGTuber video'));
    reader.readAsArrayBuffer(file);
  });
}

export async function getPngTuberModel(): Promise<
  StoredPngTuberModel | undefined
> {
  const database = await openDatabase();
  try {
    return await requestResult<StoredPngTuberModel | undefined>(
      database
        .transaction(STORE_NAME, 'readonly')
        .objectStore(STORE_NAME)
        .get(MODEL_ID),
    );
  } finally {
    database.close();
  }
}

export async function savePngTuberVideo(
  kind: 'idle' | 'talking',
  file: File,
): Promise<StoredPngTuberModel> {
  validatePngTuberVideo(file);
  const existing = await getPngTuberModel();
  const model: StoredPngTuberModel = {
    id: MODEL_ID,
    ...existing,
    [kind]: {
      name: file.name,
      type: file.type,
      size: file.size,
      data: await readFile(file),
    },
    updatedAt: new Date().toISOString(),
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

export async function clearPngTuberModel(): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(MODEL_ID);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}
