/**
 * Test the deterministic chord spelling function
 */

import { spellChord } from '../src/chord-spelling.js';

const testCases = [
  // Major triads
  { root: 'C', type: 'major', expected: ['C', 'E', 'G'] },
  { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
  { root: 'D♭', type: 'major', expected: ['D♭', 'F', 'A♭'] },
  { root: 'G♯', type: 'major', expected: ['G♯', 'B♯', 'D♯'] },
  { root: 'A♯', type: 'major', expected: ['A♯', 'C𝄪', 'E♯'] },
  { root: 'C♭', type: 'major', expected: ['C♭', 'E♭', 'G♭'] },
  { root: 'B𝄫', type: 'major', expected: ['B𝄫', 'D♭', 'F♭'] }, // D𝄫 is enharmonic to C, but D♭ is the correct spelling for letter-name integrity
  
  // Minor triads
  { root: 'C', type: 'minor', expected: ['C', 'E♭', 'G'] },
  { root: 'D', type: 'minor', expected: ['D', 'F', 'A'] },
  { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
  { root: 'F♭', type: 'minor', expected: ['F♭', 'A𝄫', 'C♭'] }, // A𝄫 and A♭♭ are the same
  { root: 'G♭', type: 'minor', expected: ['G♭', 'B𝄫', 'D♭'] },
  { root: 'A♯', type: 'minor', expected: ['A♯', 'C♯', 'E♯'] },
  
  // Seventh chords
  { root: 'C', type: 'maj7', expected: ['C', 'E', 'G', 'B'] },
  { root: 'D', type: 'm7', expected: ['D', 'F', 'A', 'C'] },
  { root: 'G', type: '7', expected: ['G', 'B', 'D', 'F'] },
  { root: 'A', type: 'm7', expected: ['A', 'C', 'E', 'G'] },
  
  // Diminished and augmented
  { root: 'C', type: 'diminished', expected: ['C', 'E♭', 'G♭'] },
  { root: 'C', type: 'augmented', expected: ['C', 'E', 'G♯'] },
];

console.log('Testing deterministic chord spelling...\n');

let passed = 0;
let failed = 0;

for (const test of testCases) {
  try {
    const result = spellChord(test.root, test.type);
    const matches = JSON.stringify(result) === JSON.stringify(test.expected);
    
    console.log(`${test.root} ${test.type}:`);
    console.log(`  Expected: [${test.expected.join(', ')}]`);
    console.log(`  Got:      [${result.join(', ')}]`);
    
    if (matches) {
      passed++;
      console.log(`  ✓ Correct\n`);
    } else {
      failed++;
      console.log(`  ✗ Incorrect\n`);
    }
  } catch (error) {
    failed++;
    console.log(`${test.root} ${test.type}:`);
    console.log(`  ✗ Error: ${error.message}\n`);
  }
}

console.log(`=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${testCases.length}`);

process.exit(failed > 0 ? 1 : 0);

