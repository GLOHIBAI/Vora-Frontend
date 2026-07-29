import {
  formatGate2Answer,
  formatGate2ResponsesPayload,
  countWords,
  validateMinWords,
} from './gate2-submit-shape.util';

function assertEqual(actual: any, expected: any, message: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`[FAILED] ${message}\nExpected: ${expectedStr}\nActual:   ${actualStr}`);
  } else {
    console.log(`[PASSED] ${message}`);
  }
}

console.log('=== Running Gate 2 Submit Shapes Utility Tests ===\n');

// 1. sb (single best) -> bare string
assertEqual(formatGate2Answer('sb', 'b'), 'b', 'sb with bare string optionId');
assertEqual(formatGate2Answer('sb', { choice: 'b' }), 'b', 'sb with choice object');

// 2. jb (single best + reason)
assertEqual(
  formatGate2Answer('jb', { choice: 'a', reason: 'Reliability first' }),
  { choice: 'a', reason: 'Reliability first' },
  'jb choice + reason object'
);

// 3. choice + optional reason (allocate, data, hotspot, etc.)
assertEqual(
  formatGate2Answer('highlight', { selectedIds: ['a', 'd'], reason: 'Critical point' }),
  { choice: ['a', 'd'], reason: 'Critical point' },
  'highlight selectedIds + reason → choice array'
);
assertEqual(
  formatGate2Answer('highlight', { choice: 'a', reason: '' }),
  { choice: ['a'] },
  'highlight single choice without reason'
);
assertEqual(
  formatGate2Answer('hotspot', { choice: 'a', reason: 'Critical point' }),
  { choice: 'a', reason: 'Critical point' },
  'hotspot choice with reason'
);
assertEqual(
  formatGate2Answer('hotspot', { choice: 'a', reason: '' }),
  'a',
  'hotspot choice without reason returns bare string'
);

// 4. compare (A/B cards)
assertEqual(
  formatGate2Answer('compare', { choice: 'A', reason: 'Approach A limits risk' }),
  { choice: 'A', reason: 'Approach A limits risk' },
  'compare A/B choice + reason'
);

// 5. ml (most and least effective)
assertEqual(
  formatGate2Answer('ml', { most: 'a', least: 'c' }),
  { most: 'a', least: 'c' },
  'ml most and least effective'
);

// 6. ms (select all that apply)
assertEqual(
  formatGate2Answer('ms', ['a', 'c']),
  ['a', 'c'],
  'ms string array of option IDs'
);

// 7. rank (rank best -> worst)
assertEqual(
  formatGate2Answer('rank', ['b', 'a', 'd', 'c']),
  ['b', 'a', 'd', 'c'],
  'rank string array of option IDs'
);

// 8. match (match pairs)
assertEqual(
  formatGate2Answer('match', { l1: 'Match A', l2: 'Match B' }),
  { l1: 'Match A', l2: 'Match B' },
  'match pairs dictionary'
);

// 9. cloze (fill blanks)
assertEqual(
  formatGate2Answer('cloze', { b1: 'idempotent', b2: 'retry' }),
  { b1: 'idempotent', b2: 'retry' },
  'cloze fill blanks dictionary'
);

// 10. cat (sort into groups)
assertEqual(
  formatGate2Answer('cat', { i1: 'Group A', i2: 'Group B' }),
  { i1: 'Group A', i2: 'Group B' },
  'cat sort into groups dictionary'
);

// 11. code / livecode (code exercise)
assertEqual(
  formatGate2Answer('livecode', { code: 'function solve(n) { return n * 2; }', stdout: 'ok' }),
  { code: 'function solve(n) { return n * 2; }', stdout: 'ok' },
  'livecode object with code and stdout'
);
assertEqual(
  formatGate2Answer('code', 'function solve(n) { return n * 2; }'),
  { code: 'function solve(n) { return n * 2; }' },
  'code bare string normalized to { code }'
);

// 12. probe (short prose)
assertEqual(
  formatGate2Answer('probe', 'I would freeze the rollout'),
  'I would freeze the rollout',
  'probe short prose string'
);

// 13. work_sample (simulation brief)
assertEqual(
  formatGate2Answer('work_sample', { prose: 'artefact text', followUp: 'optional text' }),
  { prose: 'artefact text', followUp: 'optional text' },
  'work_sample prose + followUp'
);

// 14. scale / numeric (number)
assertEqual(formatGate2Answer('numeric', '3'), 3, 'numeric string converted to number');
assertEqual(formatGate2Answer('scale', 2), 2, 'scale number');

// 15. specialists (proofread, visual, liveui)
assertEqual(
  formatGate2Answer('proofread', { choice: 'a', reason: 'Grammar fix' }),
  { choice: 'a', reason: 'Grammar fix' },
  'proofread specialist choice + reason'
);

// 16. countWords & validateMinWords
assertEqual(countWords('Reliability first because the path is already fragile'), 8, 'countWords 8 words');
assertEqual(validateMinWords('One two three four', 5), false, 'validateMinWords fails when count < minWords');
assertEqual(validateMinWords('One two three four five', 5), true, 'validateMinWords passes when count >= minWords');

// 17. formatGate2ResponsesPayload batch test
const rawPayload = {
  'demo-g2-knowledge-q1': 'b',
  'demo-g2-knowledge-q2': { choice: 'a', reason: 'Reliability first' },
  'demo-g2-knowledge-q3': { most: 'a', least: 'c' },
  'demo-g2-knowledge-q4': ['a', 'd'],
  'demo-g2-knowledge-q5': 'function solve() {}',
};
const items = [
  { id: 'demo-g2-knowledge-q1', type: 'sb' },
  { id: 'demo-g2-knowledge-q2', type: 'jb' },
  { id: 'demo-g2-knowledge-q3', type: 'ml' },
  { id: 'demo-g2-knowledge-q4', type: 'ms' },
  { id: 'demo-g2-knowledge-q5', type: 'livecode' },
];

const batchFormatted = formatGate2ResponsesPayload(rawPayload, items);
assertEqual(
  batchFormatted,
  {
    'demo-g2-knowledge-q1': 'b',
    'demo-g2-knowledge-q2': { choice: 'a', reason: 'Reliability first' },
    'demo-g2-knowledge-q3': { most: 'a', least: 'c' },
    'demo-g2-knowledge-q4': ['a', 'd'],
    'demo-g2-knowledge-q5': { code: 'function solve() {}' },
  },
  'formatGate2ResponsesPayload batch formatting'
);

console.log('\n=== All Gate 2 Submit Shapes Utility Tests Passed Successfully! ===');
