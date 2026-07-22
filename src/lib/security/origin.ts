export function parseAllowedOrigins(value: string): ReadonlySet<string> {
  return new Set(
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => new URL(origin).origin),
  );
}

export function isOriginAllowed(
  origin: string | undefined,
  host: string | undefined,
  allowed: ReadonlySet<string>,
): boolean {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    if (host && parsed.host === host) return true;
    return allowed.has(parsed.origin);
  } catch {
    return false;
  }
}
