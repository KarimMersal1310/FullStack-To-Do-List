function base64UrlDecode(input: string): string {
  // base64url -> base64
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);

  // atob expects latin1; JWT payload is JSON ASCII/UTF-8
  const binary = atob(base64);
  // Decode as UTF-8
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecode(parts[1]);
    const parsed = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function getJwtClaim(token: string, claim: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const value = payload[claim];
  return typeof value === 'string' ? value : null;
}

