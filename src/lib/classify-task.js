export function classifyTask(input = '') {
  const text = input.toLowerCase();

  if (/defect|crack|leak|mould|rot|failed|damage|unsafe|non[- ]?compliant/.test(text)) return 'defect';
  if (/plan|drawing|sketch|approval|da|cdc|certifier|layout/.test(text)) return 'plan';
  if (/builder|dispute|quote|contract|invoice|variation|warranty|tribunal|fair trading/.test(text)) return 'dispute';
  if (/material|product|sheet|spec|cladding|membrane|waterproof|timber|concrete|steel/.test(text)) return 'materials';
  if (/hazard|risk|fall|asbestos|excavation|ladder|site safety|whs/.test(text)) return 'safety';
  if (/council|government|regulator|policy|procurement|audit|agency/.test(text)) return 'government';
  if (/comply|compliance|standard|ncc|nsw|licen[cs]e|legal|allowed/.test(text)) return 'compliance';

  return 'unknown';
}
