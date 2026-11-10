// EXIF GPS IFD, following CIPA DC-008. JPEG scan data and unrelated TIFF
// values retain their bytes and offsets; a replacement root/GPS IFD is appended.
const text = new TextEncoder(), ascii = bytes => new TextDecoder('ascii').decode(bytes).replace(/\0+$/, '');
const sizes = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
const bytesOf = value => value instanceof Uint8Array ? value : new Uint8Array(value);
const equal = (bytes, offset, value) => value.every((b, i) => bytes[offset + i] === b);
const EXIF = [69, 120, 105, 102, 0, 0], PNG = [137, 80, 78, 71, 13, 10, 26, 10];
const be32 = (bytes, offset) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset);

function jpegParts(bytes) {
  if (!equal(bytes, 0, [255, 216])) return null;
  const parts = []; let offset = 2;
  while (offset < bytes.length) {
    const start = offset;
    if (bytes[offset++] !== 255) throw new Error('Invalid JPEG marker');
    while (bytes[offset] === 255) offset++;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) return { parts, scan: start };
    if (marker === 1 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) throw new Error('Truncated JPEG');
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) throw new Error('Invalid JPEG segment length');
    parts.push({ start, end: offset + length, marker, payload: offset + 2 }); offset += length;
  }
  throw new Error('JPEG has no scan or end marker');
}
function pngParts(bytes) {
  if (!equal(bytes, 0, PNG)) return null;
  const parts = []; let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = be32(bytes, offset), end = offset + length + 12;
    if (end > bytes.length) throw new Error('Truncated PNG chunk');
    const type = ascii(bytes.subarray(offset + 4, offset + 8));
    parts.push({ start: offset, end, type, payload: offset + 8, length }); offset = end;
    if (type === 'IEND') return parts;
  }
  throw new Error('PNG has no end chunk');
}
function tiffReader(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const little = equal(bytes, 0, [73, 73]);
  if ((!little && !equal(bytes, 0, [77, 77])) || bytes.length < 8) throw new Error('Unsupported EXIF byte order');
  const bound = (offset, size) => { if (!Number.isInteger(offset) || offset < 0 || offset + size > bytes.length) throw new Error('EXIF offset is out of bounds'); };
  const u16 = offset => { bound(offset, 2); return view.getUint16(offset, little); };
  const u32 = offset => { bound(offset, 4); return view.getUint32(offset, little); };
  if (u16(2) !== 42) throw new Error('Unsupported EXIF TIFF header');
  const ifd = offset => {
    const count = u16(offset); bound(offset + 2, count * 12 + 4);
    return { entries: Array.from({ length: count }, (_, i) => {
      const pos = offset + 2 + i * 12, tag = u16(pos), type = u16(pos + 2), count = u32(pos + 4);
      return { tag, type, count, pos, value: u32(pos + 8) };
    }), next: u32(offset + 2 + count * 12) };
  };
  const data = entry => {
    if (!entry || !sizes[entry.type]) return null;
    const length = sizes[entry.type] * entry.count, offset = length <= 4 ? entry.pos + 8 : entry.value;
    bound(offset, length); return { offset, length, bytes: bytes.subarray(offset, offset + length) };
  };
  const rationals = entry => {
    if (!entry || entry.type !== 5 || entry.count > 16) return null;
    const field = data(entry), values = [];
    for (let i = 0; i < entry.count; i++) {
      const denominator = u32(field.offset + i * 8 + 4);
      if (!denominator) throw new Error('EXIF rational has zero denominator');
      values.push(u32(field.offset + i * 8) / denominator);
    }
    return values;
  };
  return { little, ifd, u32, data, rationals };
}
function getTiff(bytes) {
  const jpeg = jpegParts(bytes);
  if (jpeg) {
    const part = jpeg.parts.find(p => p.marker === 0xe1 && equal(bytes, p.payload, EXIF));
    return part ? bytes.subarray(part.payload + 6, part.end) : null;
  }
  const png = pngParts(bytes);
  if (png) { const part = png.find(p => p.type === 'eXIf'); return part ? bytes.subarray(part.payload, part.payload + part.length) : null; }
  // WebP EXIF can be read; exports of other formats use a decoded JPEG copy.
  if (equal(bytes, 0, [82, 73, 70, 70]) && equal(bytes, 8, [87, 69, 66, 80])) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const size = view.getUint32(offset + 4, true), end = offset + 8 + size;
      if (end > bytes.length) throw new Error('Invalid WebP EXIF size');
      if (ascii(bytes.subarray(offset, offset + 4)) === 'EXIF') {
        const start = equal(bytes, offset + 8, EXIF) ? offset + 14 : offset + 8;
        return bytes.subarray(start, end);
      }
      offset = end + size % 2;
    }
  }
  return null;
}
export function validPhotoLocation(point) {
  return !!point && Number.isFinite(point.lat) && Number.isFinite(point.lng) &&
    Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
}
export function readPhotoLocation(value) {
  try {
    const bytes = bytesOf(value), tiff = getTiff(bytes);
    if (!tiff) return { location: null, message: 'No embedded EXIF GPS found. Set a map pin or explicitly assign your current GPS.' };
    const r = tiffReader(tiff), root = r.ifd(r.u32(4));
    const pointer = root.entries.find(e => e.tag === 0x8825 && e.type === 4 && e.count === 1);
    if (!pointer) return { location: null, message: 'This photo has no embedded GPS coordinates.' };
    const gps = new Map(r.ifd(pointer.value).entries.map(e => [e.tag, e]));
    const string = tag => { const field = r.data(gps.get(tag)); return field ? ascii(field.bytes) : ''; };
    const latRef = string(1), lngRef = string(3), lat = r.rationals(gps.get(2)), lng = r.rationals(gps.get(4));
    if (!['N', 'S'].includes(latRef) || !['E', 'W'].includes(lngRef) || lat?.length !== 3 || lng?.length !== 3 ||
        [...lat.slice(1), ...lng.slice(1)].some(n => n < 0 || n >= 60)) throw new Error('Incomplete GPS coordinates');
    const datum = string(18), method = string(27).replace(/^ASCII\0\0\0/, '');
    if (datum && !/^WGS[ -]?84$/i.test(datum)) return { location: null, message: `Embedded GPS uses ${datum}; set a WGS-84 map pin before using this position.` };
    const accuracy = r.rationals(gps.get(31))?.[0] ?? null;
    const location = { lat: (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef === 'S' ? -1 : 1),
      lng: (lng[0] + lng[1] / 60 + lng[2] / 3600) * (lngRef === 'W' ? -1 : 1),
      accuracy: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
      source: /MANUAL/i.test(method) ? 'embedded-manual' : 'embedded-exif',
      datum: 'WGS-84', datumAssumed: !datum, processingMethod: method || null };
    if (!validPhotoLocation(location)) throw new Error('GPS coordinates are outside the valid range');
    return { location, message: 'Embedded photo location loaded.' };
  } catch (error) { return { location: null, message: 'Photo GPS metadata could not be read: ' + error.message + '. You can set a map pin.' }; }
}

function join(parts) { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let at = 0; for (const p of parts) { out.set(p, at); at += p.length; } return out; }
function withGps(old, location) {
  let bytes = old;
  if (!bytes) { bytes = new Uint8Array(14); bytes.set([73, 73, 42, 0, 8, 0, 0, 0]); }
  const reader = tiffReader(bytes), root = reader.ifd(reader.u32(4));
  const base = bytes.length + bytes.length % 2, rootEntries = root.entries.filter(e => e.tag !== 0x8825);
  const rootLength = 2 + (rootEntries.length + 1) * 12 + 4, gpsOffset = base + rootLength;
  const method = location.source === 'map-pin' || location.source === 'assigned-current-gps' || location.source === 'embedded-manual'
    ? 'MANUAL' : (/^[\x20-\x7e]{1,64}$/.test(location.processingMethod || '') ? location.processingMethod : 'GPS');
  const gps = [
    { tag: 0, type: 1, count: 4, bytes: new Uint8Array([2, 3, 0, 0]) },
    { tag: 1, type: 2, count: 2, bytes: text.encode(location.lat < 0 ? 'S\0' : 'N\0') },
    { tag: 2, type: 5, count: 3, coordinate: Math.abs(location.lat) },
    { tag: 3, type: 2, count: 2, bytes: text.encode(location.lng < 0 ? 'W\0' : 'E\0') },
    { tag: 4, type: 5, count: 3, coordinate: Math.abs(location.lng) },
    { tag: 18, type: 2, count: 7, bytes: text.encode('WGS-84\0') },
    { tag: 27, type: 7, count: 8 + text.encode(method).length, bytes: join([text.encode('ASCII\0\0\0'), text.encode(method)]) }
  ];
  if (Number.isFinite(location.accuracy) && location.accuracy >= 0) gps.push({ tag: 31, type: 5, count: 1, accuracy: location.accuracy });
  const gpsLength = 2 + gps.length * 12 + 4;
  const out = new Uint8Array(gpsOffset + gpsLength + 256), view = new DataView(out.buffer), little = reader.little;
  out.set(bytes); const u16 = (offset, n) => view.setUint16(offset, n, little), u32 = (offset, n) => view.setUint32(offset, n, little);
  u32(4, base); u16(base, rootEntries.length + 1);
  const entries = [...rootEntries.map(entry => ({ tag: entry.tag, raw: bytes.subarray(entry.pos, entry.pos + 12) })), { tag: 0x8825 }].sort((a, b) => a.tag - b.tag);
  entries.forEach((entry, i) => { const at = base + 2 + i * 12;
    if (entry.raw) out.set(entry.raw, at);
    else { u16(at, 0x8825); u16(at + 2, 4); u32(at + 4, 1); u32(at + 8, gpsOffset); }
  });
  u32(base + 2 + entries.length * 12, root.next);
  u16(gpsOffset, gps.length); let extra = gpsOffset + gpsLength;
  gps.forEach((entry, i) => {
    const at = gpsOffset + 2 + i * 12; u16(at, entry.tag); u16(at + 2, entry.type); u32(at + 4, entry.count);
    let payload = entry.bytes;
    if (entry.coordinate !== undefined) {
      payload = new Uint8Array(24); const v = new DataView(payload.buffer);
      // Fixed denominator avoids the 32-bit overflow of decimal-degree numerators.
      const ticks = Math.round(entry.coordinate * 3600 * 1000000), degrees = Math.floor(ticks / 3600000000);
      const rest = ticks - degrees * 3600000000, minutes = Math.floor(rest / 60000000), seconds = rest - minutes * 60000000;
      [[degrees, 1], [minutes, 1], [seconds, 1000000]].forEach(([n, d], j) => { v.setUint32(j * 8, n, little); v.setUint32(j * 8 + 4, d, little); });
    }
    if (entry.accuracy !== undefined) {
      if (entry.accuracy > 4000000) throw new Error('Reported position accuracy cannot be encoded');
      payload = new Uint8Array(8); const v = new DataView(payload.buffer);
      v.setUint32(0, Math.round(entry.accuracy * 1000), little); v.setUint32(4, 1000, little);
    }
    if (payload.length <= 4) out.set(payload, at + 8);
    else { u32(at + 8, extra); out.set(payload, extra); extra += payload.length; if (extra % 2) extra++; }
  });
  return out.slice(0, extra);
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const b of bytes) { crc ^= b; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
export function embedPhotoLocation(value, location) {
  if (!validPhotoLocation(location)) throw new Error('Valid coordinates are required');
  const bytes = bytesOf(value), jpeg = jpegParts(bytes), png = jpeg ? null : pngParts(bytes);
  if (!jpeg && !png) throw new Error('GPS metadata writing supports JPEG and PNG');
  const tiff = withGps(getTiff(bytes), location);
  if (jpeg) {
    if (tiff.length + 8 > 65535) throw new Error('Existing EXIF is too large to add GPS without discarding metadata');
    const size = tiff.length + 8, segment = join([new Uint8Array([255, 225, size >> 8, size & 255]), new Uint8Array(EXIF), tiff]);
    const old = jpeg.parts.find(p => p.marker === 0xe1 && equal(bytes, p.payload, EXIF));
    return old ? join([bytes.subarray(0, old.start), segment, bytes.subarray(old.end)])
      : join([bytes.subarray(0, 2), segment, bytes.subarray(2)]);
  }
  const chunk = new Uint8Array(tiff.length + 12), view = new DataView(chunk.buffer);
  view.setUint32(0, tiff.length); chunk.set(text.encode('eXIf'), 4); chunk.set(tiff, 8);
  view.setUint32(chunk.length - 4, crc32(chunk.subarray(4, chunk.length - 4)));
  const parts = [bytes.subarray(0, 8)]; let inserted = false;
  for (const part of png) {
    if (!inserted && (part.type === 'IDAT' || part.type === 'IEND')) { parts.push(chunk); inserted = true; }
    if (part.type !== 'eXIf') parts.push(bytes.subarray(part.start, part.end));
  }
  return join(parts);
}
export function locationLabel(point) {
  if (!validPhotoLocation(point)) return 'Photo location not set';
  const sources = { 'embedded-exif': 'Photo EXIF GPS', 'embedded-manual': 'Photo EXIF · manually assigned',
    'map-pin': 'Map pin · user assigned', 'assigned-current-gps': 'Current phone GPS · user assigned' };
  const accuracy = Number.isFinite(point.accuracy) ? `±${Math.round(point.accuracy)} m` : 'accuracy unknown';
  return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)} · ${sources[point.source] || 'Camera GPS'} · ${accuracy}${point.datumAssumed ? ' · WGS-84 assumed; datum not recorded' : ''}`;
}
