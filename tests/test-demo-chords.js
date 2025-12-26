/**
 * Test the exact chords from the demo
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';
import { FretboardUI } from '../src/fretboard-ui-v0.1.js';

// Create a mock UI to access the note name function
const mockContainer = document.createElement('div');
const ui = new FretboardUI(mockContainer);

// Demo voicings
const demoChords = [
  { name: 'Cmaj7', voicing: [48, 52, 55, 59], expected: ['C', 'E', 'G', 'B'] },
  { name: 'Dm7', voicing: [50, 53, 57, 60], expected: ['D', 'F', 'A', 'C'] },
  { name: 'G7', voicing: [55, 59, 62, 67], expected: ['G', 'B', 'D', 'F'] },
  { name: 'Am7', voicing: [57, 60, 64, 67], expected: ['A', 'C', 'E', 'G'] }
];

console.log('Testing demo chords...\n');

const projection = new FretboardProjection();
let passed = 0;
let failed = 0;

for (const chord of demoChords) {
  const result = projection.project({
    voicing: chord.voicing,
    inversion: 'root',
    registerPosition: 'mid',
    hold: false,
    reasonCodes: []
  });
  
  const contextMidiNotes = result.midiNotes.filter(n => n !== null);
  const noteNames = [];
  
  for (let i = 0; i < result.frets.length; i++) {
    if (result.frets[i] !== null && result.stringSet.includes(i + 1)) {
      const midiNote = result.midiNotes[i];
      const noteName = ui.midiToNoteName(midiNote, contextMidiNotes);
      noteNames.push(noteName);
    }
  }
  
  console.log(`${chord.name}:`);
  console.log(`  Expected: [${chord.expected.join(', ')}]`);
  console.log(`  Got:      [${noteNames.join(', ')}]`);
  console.log(`  MIDI:     [${chord.voicing.join(', ')}]`);
  console.log(`  Context:  [${contextMidiNotes.join(', ')}]`);
  
  const sortedGot = [...noteNames].sort();
  const sortedExpected = [...chord.expected].sort();
  const matches = JSON.stringify(sortedGot) === JSON.stringify(sortedExpected);
  
  if (matches) {
    passed++;
    console.log(`  ✓ Correct\n`);
  } else {
    failed++;
    console.log(`  ✗ Incorrect\n`);
  }
}

console.log(`=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

process.exit(failed > 0 ? 1 : 0);

