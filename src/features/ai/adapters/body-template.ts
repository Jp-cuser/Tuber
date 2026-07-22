import { AppError } from '@/lib/errors/app-error';

export function renderBodyTemplate(
  template: unknown,
  values: Record<string, unknown>,
): unknown {
  if (typeof template === 'string') {
    const exact = template.match(/^\{\{([a-zA-Z][\w]*)\}\}$/);
    if (exact) {
      const key = exact[1] ?? '';
      if (!(key in values))
        throw new AppError(
          'BAD_REQUEST',
          400,
          `Unknown template variable: ${key}`,
        );
      return values[key];
    }
    return template.replace(
      /\{\{([a-zA-Z][\w]*)\}\}/g,
      (_match, key: string) => {
        const value = values[key];
        if (value === undefined)
          throw new AppError(
            'BAD_REQUEST',
            400,
            `Unknown template variable: ${key}`,
          );
        if (typeof value === 'object')
          throw new AppError(
            'BAD_REQUEST',
            400,
            `Object variable requires an exact placeholder: ${key}`,
          );
        return String(value);
      },
    );
  }
  if (Array.isArray(template))
    return template.map((item) => renderBodyTemplate(item, values));
  if (template && typeof template === 'object')
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [
        key,
        renderBodyTemplate(value, values),
      ]),
    );
  return template;
}
