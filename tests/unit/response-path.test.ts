import { readResponsePath } from '@/features/ai/adapters/response-path';

test('reads nested response text', () =>
  expect(readResponsePath({ data: { answer: 'ok' } }, 'data.answer')).toBe(
    'ok',
  ));
test('rejects unsafe or missing paths', () => {
  expect(() => readResponsePath({}, '__proto__.x')).toThrow('Invalid');
  expect(() => readResponsePath({}, 'data.answer')).toThrow('not found');
});
