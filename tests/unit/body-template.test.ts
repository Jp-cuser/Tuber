import { renderBodyTemplate } from '@/features/ai/adapters/body-template';

test('renders nested JSON templates without evaluating code', () => {
  expect(
    renderBodyTemplate(
      {
        model: '{{model}}',
        messages: '{{messages}}',
        label: 'model={{model}}',
      },
      { model: 'demo', messages: [{ role: 'user' }] },
    ),
  ).toEqual({
    model: 'demo',
    messages: [{ role: 'user' }],
    label: 'model=demo',
  });
});
test('rejects unknown and embedded object variables', () => {
  expect(() => renderBodyTemplate('{{missing}}', {})).toThrow(
    'Unknown template variable',
  );
  expect(() => renderBodyTemplate('x={{messages}}', { messages: [] })).toThrow(
    'exact placeholder',
  );
});
