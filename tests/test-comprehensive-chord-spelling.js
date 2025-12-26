/**
 * Comprehensive test for chord spelling - tests common chords that might have errors
 */

import { spellChord } from '../src/chord-spelling.js';

const testCases = [
  // Basic major and minor triads
  { root: 'C', type: 'major', expected: ['C', 'E', 'G'] },
  { root: 'C', type: 'minor', expected: ['C', 'E♭', 'G'] },
  { root: 'D', type: 'major', expected: ['D', 'F♯', 'A'] },
  { root: 'D', type: 'minor', expected: ['D', 'F', 'A'] },
  { root: 'E', type: 'major', expected: ['E', 'G♯', 'B'] },
  { root: 'E', type: 'minor', expected: ['E', 'G', 'B'] },
  { root: 'F', type: 'major', expected: ['F', 'A', 'C'] },
  { root: 'F', type: 'minor', expected: ['F', 'A♭', 'C'] },
  { root: 'G', type: 'major', expected: ['G', 'B', 'D'] },
  { root: 'G', type: 'minor', expected: ['G', 'B♭', 'D'] },
  { root: 'A', type: 'major', expected: ['A', 'C♯', 'E'] },
  { root: 'A', type: 'minor', expected: ['A', 'C', 'E'] },
  { root: 'B', type: 'major', expected: ['B', 'D♯', 'F♯'] },
  { root: 'B', type: 'minor', expected: ['B', 'D', 'F♯'] },
  
  // Sharp keys
  { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
  { root: 'C♯', type: 'minor', expected: ['C♯', 'E', 'G♯'] },
  { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
  { root: 'F♯', type: 'major', expected: ['F♯', 'A♯', 'C♯'] },
  { root: 'F♯', type: 'minor', expected: ['F♯', 'A', 'C♯'] },
  { root: 'G♯', type: 'major', expected: ['G♯', 'B♯', 'D♯'] },
  { root: 'G♯', type: 'minor', expected: ['G♯', 'B', 'D♯'] },
  { root: 'A♯', type: 'major', expected: ['A♯', 'C𝄪', 'E♯'] },
  { root: 'A♯', type: 'minor', expected: ['A♯', 'C♯', 'E♯'] },
  
  // Flat keys
  { root: 'D♭', type: 'major', expected: ['D♭', 'F', 'A♭'] },
  { root: 'D♭', type: 'minor', expected: ['D♭', 'F♭', 'A♭'] },
  { root: 'E♭', type: 'major', expected: ['E♭', 'G', 'B♭'] },
  { root: 'E♭', type: 'minor', expected: ['E♭', 'G♭', 'B♭'] },
  { root: 'G♭', type: 'major', expected: ['G♭', 'B♭', 'D♭'] },
  { root: 'G♭', type: 'minor', expected: ['G♭', 'B𝄫', 'D♭'] },
  { root: 'A♭', type: 'major', expected: ['A♭', 'C', 'E♭'] },
  { root: 'A♭', type: 'minor', expected: ['A♭', 'C♭', 'E♭'] },
  { root: 'B♭', type: 'major', expected: ['B♭', 'D', 'F'] },
  { root: 'B♭', type: 'minor', expected: ['B♭', 'D♭', 'F'] },
  
  // Theoretical keys
  { root: 'C♭', type: 'major', expected: ['C♭', 'E♭', 'G♭'] },
  { root: 'F♭', type: 'minor', expected: ['F♭', 'A𝄫', 'C♭'] },
  { root: 'B𝄫', type: 'major', expected: ['B𝄫', 'D♭', 'F♭'] },
  
  // Seventh chords
  { root: 'C', type: 'maj7', expected: ['C', 'E', 'G', 'B'] },
  { root: 'C', type: 'm7', expected: ['C', 'E♭', 'G', 'B♭'] },
  { root: 'C', type: '7', expected: ['C', 'E', 'G', 'B♭'] },
  { root: 'D', type: 'm7', expected: ['D', 'F', 'A', 'C'] },
  { root: 'G', type: '7', expected: ['G', 'B', 'D', 'F'] },
  { root: 'A', type: 'm7', expected: ['A', 'C', 'E', 'G'] },
  { root: 'E', type: '7', expected: ['E', 'G♯', 'B', 'D'] },
  { root: 'F', type: 'maj7', expected: ['F', 'A', 'C', 'E'] },
  
  // Diminished and augmented
  { root: 'C', type: 'diminished', expected: ['C', 'E♭', 'G♭'] },
  { root: 'C', type: 'augmented', expected: ['C', 'E', 'G♯'] },
  { root: 'C', type: 'dim7', expected: ['C', 'E♭', 'G♭', 'B𝄫'] },
];

console.log('Testing comprehensive chord spelling...\n');

let passed = 0;
let failed = 0;
const failures = [];

for (const test of testCases) {
  try {
    const result = spellChord(test.root, test.type);
    const matches = JSON.stringify(result) === JSON.stringify(test.expected);
    
    if (matches) {
      passed++;
    } else {
      failed++;
      failures.push({ ...test, got: result });
      console.log(`${test.root} ${test.type}:`);
      console.log(`  Expected: [${test.expected.join(', ')}]`);
      console.log(`  Got:      [${result.join(', ')}]`);
      console.log(`  ✗ Incorrect\n`);
    }
  } catch (error) {
    failed++;
    failures.push({ ...test, error: error.message });
    console.log(`${test.root} ${test.type}:`);
    console.log(`  ✗ Error: ${error.message}\n`);
  }
}

console.log(`=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${testCases.length}`);

if (failures.length > 0) {
  console.log(`\nFailures:`);
  failures.forEach(f => {
    if (f.error) {
      console.log(`  ${f.root} ${f.type}: ${f.error}`);
    } else {
      console.log(`  ${f.root} ${f.type}: Expected [${f.expected.join(', ')}], Got [${f.got.join(', ')}]`);
    }
  });
}

process.exit(failed > 0 ? 1 : 0);

