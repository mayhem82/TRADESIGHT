// User-reported field properties, not a photo classifier or a gold assay.
export const GOLD_FIELD_SOURCE = 'https://www.usgs.gov/faqs/what-fools-gold';
const streaks = new Set(['untested', 'yellow', 'dark', 'white', 'other']);
const responses = new Set(['untested', 'dents', 'crumbles', 'flakes', 'other']);

export function assessGoldChecks({ streak = 'untested', response = 'untested' } = {}) {
  if (!streaks.has(streak) || !responses.has(response)) throw new RangeError('Unknown field observation');
  const observations = [], possibilities = [], cautions = [];
  if (streak === 'yellow') observations.push('A yellow streak was reported.');
  if (streak === 'dark') observations.push('A dark green to black streak was reported.');
  if (streak === 'white') observations.push('A white streak was reported.');
  if (streak === 'other') observations.push('Another streak colour was reported.');
  if (response === 'dents') observations.push('The grain was reported to dent or flatten under a metal point.');
  if (response === 'crumbles') observations.push('The grain was reported to crumble or powder under a metal point.');
  if (response === 'flakes') observations.push('The grain was reported to split or flake under a metal point.');
  if (response === 'other') observations.push('Another response to a metal point was reported.');

  if (streak === 'yellow' || response === 'dents')
    possibilities.push('Native gold is one possibility: gold can leave a yellow streak and dent rather than crumble. Neither result proves gold.');
  if (streak === 'dark' || response === 'crumbles')
    possibilities.push('Pyrite or chalcopyrite are possibilities: they can leave a dark green to black streak and crumble. Other minerals can behave similarly.');
  if (streak === 'white' || response === 'flakes')
    possibilities.push('Mica is one possibility: common micas can leave a white streak and may flake or crumble. Other minerals can behave similarly.');
  if ((streak === 'yellow' && ['crumbles', 'flakes'].includes(response)) ||
      (['dark', 'white'].includes(streak) && response === 'dents'))
    cautions.push('These observations do not fit one simple gold-versus-lookalike pattern. The sample may be mixed or a test may need repeating.');
  if (observations.length && !possibilities.length)
    cautions.push('These observations do not distinguish the listed possibilities.');
  const next = [];
  if (streak === 'untested') next.push('Test the streak of the actual grain on unglazed porcelain, if the sample can be tested.');
  if (response === 'untested') next.push('Gently test whether the actual grain dents, crumbles or flakes under a metal point.');
  next.push('Use a clean, representative grain; mixed material can give conflicting results. Confirm mineral identity with appropriate testing or an assay.');
  return { version: 'gold-field-check-v1', observations, possibilities, cautions, next,
    inputs: { streak, response }, source: GOLD_FIELD_SOURCE,
    status: 'user-reported physical properties; mineral and gold unconfirmed' };
}
