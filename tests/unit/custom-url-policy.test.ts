import {
  validateCustomApiUrl,
  validateRedirect,
} from '@/features/ai/adapters/custom-url-policy';

test('allows loopback and allowlisted HTTPS origins', () => {
  expect(
    validateCustomApiUrl('http://127.0.0.1:8080/chat', new Set()).hostname,
  ).toBe('127.0.0.1');
  expect(
    validateCustomApiUrl(
      'https://api.example/chat',
      new Set(['https://api.example']),
    ).origin,
  ).toBe('https://api.example');
});
test('rejects schemes, unknown origins, and redirect escapes', () => {
  expect(() => validateCustomApiUrl('file:///secret', new Set())).toThrow(
    'scheme',
  );
  expect(() => validateCustomApiUrl('https://evil.example', new Set())).toThrow(
    'not allowed',
  );
  expect(() =>
    validateRedirect(
      new URL('https://api.example'),
      'https://evil.example',
      new Set(['https://api.example']),
    ),
  ).toThrow('not allowed');
});
