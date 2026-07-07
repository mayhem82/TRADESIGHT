export function tagEvidence(record = {}) {
  const text = `${record.source || ''} ${record.description || ''}`.toLowerCase();
  const tags = new Set(record.tags || []);

  addTagIf(tags, text, /leak|water|moisture|damp|mould/, 'water-related');
  addTagIf(tags, text, /crack|movement|settlement/, 'movement-signal');
  addTagIf(tags, text, /dust|contamination|hazard|unsafe/, 'hazard-signal');
  addTagIf(tags, text, /invoice|quote|contract|variation|warranty/, 'commercial-record');
  addTagIf(tags, text, /council|certifier|regulator|government/, 'authority-record');
  addTagIf(tags, text, /photo|image|jpg|jpeg|png|heic/, 'visual-record');
  addTagIf(tags, text, /plan|drawing|sketch|layout/, 'plan-record');
  addTagIf(tags, text, /3d|scan|glb|gltf|photogrammetry|model|spatial/, 'spatial-evidence');

  if (!tags.size) tags.add('unclassified');

  return [...tags];
}

function addTagIf(tags, text, pattern, tag) {
  if (pattern.test(text)) tags.add(tag);
}