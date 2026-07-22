import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import '@/features/i18n/i18n';
import { deserialize, serialize } from 'node:v8';

if (!globalThis.structuredClone)
  Object.defineProperty(globalThis, 'structuredClone', {
    configurable: true,
    value: <T>(value: T): T => deserialize(serialize(value)) as T,
  });
