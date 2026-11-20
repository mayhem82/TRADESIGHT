// SHA-256 of original bytes; unavailable is reported as unknown.
export async function sourceDigest(buffer, subtle = globalThis.crypto?.subtle) {
  if (!subtle) return null;
  const digest = new Uint8Array(await subtle.digest('SHA-256', buffer));
  return Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
}
