import {
  buildCustomHeaders,
  redactCustomHeaders,
} from '@/features/ai/adapters/custom-headers';

test('builds headers and redacts secrets', () => {
  const headers = buildCustomHeaders({
    Authorization: 'Bearer secret',
    'X-Trace': 'ok',
  });
  expect(redactCustomHeaders(headers)).toMatchObject({
    authorization: '[REDACTED]',
    'x-trace': 'ok',
  });
});
test('rejects forbidden and newline headers', () => {
  expect(() => buildCustomHeaders({ Host: 'evil' })).toThrow('Unsafe');
  expect(() => buildCustomHeaders({ 'X-Test': 'ok\r\nInjected: yes' })).toThrow(
    'Unsafe',
  );
});
