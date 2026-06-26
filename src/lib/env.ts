export function normalizeEnvValue(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  let value = raw.trim();

  while (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  value = value.replace(/^"+|"+$/g, "");
  value = value.replace(/\\",?\s*$/g, "");
  value = value.replace(/["',\s]+$/g, "");

  return value.trim() || undefined;
}

export function normalizePrivateKey(raw: string | undefined): string | undefined {
  const value = normalizeEnvValue(raw);

  if (!value) {
    return undefined;
  }

  const key = value.replace(/\\n/g, "\n");
  const pemMatch = key.match(
    /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/,
  );

  return pemMatch ? pemMatch[0] : key;
}
