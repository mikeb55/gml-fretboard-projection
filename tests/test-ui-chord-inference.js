/**
 * Test UI chord inference and spelling
 */

import { FretboardUI } from '../src/fretboard-ui-v0.1.js';
import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';

// Create a mock DOM environment
global.document = {
  createElementNS: (ns, tag) => {
    const el = {
      setAttribute: () => {},
      appendChild: () => {},
      insertBefore: () => {},
      textContent: '',
      innerHTML: ''
    };
    return el;
  },
  createElement: (tag) => {
    const el = {
      setAttribute: () => {},
      appendChild: () => {},
      textContent: '',
      innerHTML: ''
    };
    return el;
  }
};

const ui = new FretboardUI({ innerHTML: '', appendChild: () => {} });

// Test chord inference
const testChords = [
  { name: 'Cmaj7', voicing: [48, 52, 55, 59], expected: { rootName: 'C', chordType: 'maj7' } },
  { name: 'Dm7', voicing: [50, 53, 57, 60], expected: { rootName: 'D', chordType: 'm7' } },
  { name: 'G7', voicing: [55, 59, 62, 65], expected: { rootName: 'G', chordType: '7' } },
  { name: 'Am7', voicing: [57, 60, 64, 67], expected: { rootName: 'A', chordType: 'm7' } },
  { name: 'C minor', voicing: [48, 51, 55], expected: { rootName: 'C', chordType: 'minor' } },
  { name: 'C major', voicing: [48, 52, 55], expected: { rootName: 'C', chordType: 'major' } },
];

console.log('Testing chord inference...\n');

let passed = 0;
let failed = 0;

for (const test of testChords) {
  const inferred = ui.inferChordFromMidi(test.voicing);
  
  if (inferred && inferred.rootName === test.expected.rootName && inferred.chordType === test.expected.chordType) {
    passed++;
    console.log(`${test.name}: ✓ Correct (${inferred.rootName} ${inferred.chordType})`);
  } else {
    failed++;
    console.log(`${test.name}: ✗ Incorrect`);
    console.log(`  Expected: ${test.expected.rootName} ${test.expected.chordType}`);
    console.log(`  Got: ${inferred ? `${inferred.rootName} ${inferred.chordType}` : 'null'}`);
  }
}

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

process.exit(failed > 0 ? 1 : 0);

