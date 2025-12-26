/**
 * Test chord symbol parser
 */

import { parseChordSymbol, parseChordProgression } from '../src/chord-symbol-parser.js';

console.log('Testing chord symbol parser...\n');

// Test individual chords - using octave 3 for roots (guitar-friendly range)
const testChords = [
  { symbol: 'Bb7', expected: [58, 62, 65, 68] }, // Bb3, D4, F4, Ab4
  { symbol: 'Eb7', expected: [51, 55, 58, 61] }, // Eb3, G3, Bb3, Db4
  { symbol: 'F7', expected: [53, 57, 60, 63] }, // F3, A3, C4, Eb4
  { symbol: 'Gm7', expected: [55, 58, 62, 65] }, // G3, Bb3, D4, F4
  { symbol: 'Cm7', expected: [48, 51, 55, 58] }, // C3, Eb3, G3, Bb3
  { symbol: 'Edim7', expected: [52, 55, 58, 61] }, // E3, G3, Bb3, Db4
  { symbol: 'G7', expected: [55, 59, 62, 65] }, // G3, B3, D4, F4
  { symbol: 'C', expected: [48, 52, 55] }, // C3, E3, G3
  { symbol: 'Cm', expected: [48, 51, 55] }, // C3, Eb3, G3
  { symbol: 'C#maj7', expected: [49, 53, 56, 60] }, // C#3, E#3, G#3, B#3 (B# = C4 = 60)
];

let passed = 0;
let failed = 0;

for (const test of testChords) {
  try {
    const result = parseChordSymbol(test.symbol);
    const matches = JSON.stringify(result) === JSON.stringify(test.expected);
    
    if (matches) {
      passed++;
      console.log(`✓ ${test.symbol}: [${result.join(', ')}]`);
    } else {
      failed++;
      console.log(`✗ ${test.symbol}:`);
      console.log(`  Expected: [${test.expected.join(', ')}]`);
      console.log(`  Got:      [${result.join(', ')}]`);
    }
  } catch (error) {
    failed++;
    console.log(`✗ ${test.symbol}: ERROR - ${error.message}`);
  }
}

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

// Test progression
console.log('\n\nTesting progression parsing:');
const progression = 'Bb7 | Eb7 | F7 | Bb7 | Gm7 | Cm7 | F7 | Bb7';
const parsed = parseChordProgression(progression);
console.log(`Input: "${progression}"`);
console.log(`Parsed ${parsed.length} chords:`);
parsed.forEach((chord, i) => {
  console.log(`  ${i + 1}. ${chord.symbol}: [${chord.voicing.join(', ')}]`);
});

process.exit(failed > 0 ? 1 : 0);

