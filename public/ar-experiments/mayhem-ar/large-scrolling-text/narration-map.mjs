// Map the reader's rendered, whitespace-normalized lines back to the exact
// UTF-16 offsets sent to the narration bridge. No writing is stored.
function visibleSource(source) {
  let normalized = '', positions = [];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\r') {
      normalized += '\n'; positions.push(i);
      if (source[i + 1] === '\n') i++;
    } else { normalized += source[i]; positions.push(i); }
  }
  let visible = [], start = 0;
  const addBlock = (begin, end) => {
    let block = normalized.slice(begin, end);
    const leading = block.length - block.trimStart().length;
    const trailing = block.length - block.trimEnd().length;
    begin += leading; end -= trailing;
    if (begin >= end) return;
    block = normalized.slice(begin, end);
    if (block.startsWith('**')) begin += 2;
    if (normalized.slice(begin, end).endsWith('**')) end -= 2;
    const prefix = normalized.slice(begin, end).match(/^#{1,3}\s/);
    if (prefix) begin += prefix[0].length;
    for (let i = begin; i < end; i++) {
      if (!/\s/u.test(normalized[i])) visible.push({value:normalized[i], offset:positions[i]});
    }
  };
  const separator = /\n\s*\n/g;
  for (const match of normalized.matchAll(separator)) {
    addBlock(start, match.index); start = match.index + match[0].length;
  }
  addBlock(start, normalized.length);
  return visible;
}
export function mapRenderedLines(source, lines) {
  if (typeof source !== 'string' || !Array.isArray(lines)) throw new Error('Invalid narration layout.');
  const visible = visibleSource(source); let index = 0;
  const mapped = lines.map(line => {
    if (typeof line?.text !== 'string' || !Number.isFinite(line.y)) throw new Error('Invalid narration layout.');
    let first = null, end = null;
    for (let i = 0; i < line.text.length; i++) {
      const c = line.text[i]; if (/\s/u.test(c)) continue;
      const item = visible[index++];
      if (!item || item.value !== c) throw new Error('Narration cannot be synchronized to this text layout.');
      if (first === null) first = item.offset;
      end = item.offset + 1;
    }
    if (first === null) throw new Error('Narration cannot be synchronized to an empty line.');
    return {...line, sourceStart:first, sourceEnd:end};
  });
  if (index !== visible.length) throw new Error('Narration cannot be synchronized to this text layout.');
  return mapped;
}
export function makeScrollMapping(lines, maxScroll, anchor) {
  if (!Array.isArray(lines) || !lines.length || !Number.isFinite(maxScroll) || !Number.isFinite(anchor)) {
    throw new Error('Narration needs a valid text layout.');
  }
  for (let i=0; i<lines.length; i++) {
    if (!Number.isFinite(lines[i].y) || !Number.isInteger(lines[i].sourceStart) ||
        (i && (lines[i].sourceStart < lines[i-1].sourceStart || lines[i].y < lines[i-1].y))) {
      throw new Error('Narration needs an ordered text layout.');
    }
  }
  const scrollForCharacter = offset => {
    let i=0; while(i+1<lines.length && lines[i+1].sourceStart<=offset)i++;
    return Math.max(0,Math.min(maxScroll,lines[i].y-anchor));
  };
  const characterForScroll = scroll => {
    let i=0; const target=Math.max(0,Number(scroll)||0)+anchor;
    while(i+1<lines.length && lines[i+1].y<=target)i++;
    return lines[i].sourceStart;
  };
  return {scrollForCharacter,characterForScroll};
}
