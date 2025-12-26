/**
 * Debug test for C minor chord spelling
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';

// C minor: C, Eb, G
// MIDI: C=60, Eb=63, G=67
const cMinorVoicing = [60, 63, 67];

const projection = new FretboardProjection();
const result = projection.project({
  voicing: cMinorVoicing,
  inversion: 'root',
  registerPosition: 'mid',
  hold: false,
  reasonCodes: []
});

console.log('C Minor Projection Result:');
console.log('Voicing (input):', cMinorVoicing);
console.log('MIDI Notes (output):', result.midiNotes);
console.log('Frets:', result.frets);
console.log('String Set:', result.stringSet);

// Test note name conversion
function midiToNoteName(midiNote, contextMidiNotes = null) {
  const noteIndex = midiNote % 12;
  
  if (contextMidiNotes && contextMidiNotes.length > 0) {
    return midiToNoteNameWithContext(midiNote, contextMidiNotes);
  }
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[noteIndex];
}

function midiToNoteNameWithContext(midiNote, contextMidiNotes) {
  const noteIndex = midiNote % 12;
  const rootMidi = Math.min(...contextMidiNotes);
  const rootIndex = rootMidi % 12;
  
  const sortedNotes = [...contextMidiNotes].sort((a, b) => a - b);
  const hasMinorThird = sortedNotes.some(note => (note - rootMidi) % 12 === 3);
  
  console.log(`\nNote name conversion for MIDI ${midiNote}:`);
  console.log(`  Root MIDI: ${rootMidi}, Root Index: ${rootIndex}`);
  console.log(`  Has minor third: ${hasMinorThird}`);
  console.log(`  Context notes: [${contextMidiNotes.join(', ')}]`);
  
  const flatRoots = [1, 3, 5, 6, 8, 10];
  const minorFlatRoots = [0, 5, 7, 10];
  
  let useFlats = false;
  if (flatRoots.includes(rootIndex)) {
    useFlats = true;
    console.log(`  Using flats (flat root)`);
  } else if (hasMinorThird && minorFlatRoots.includes(rootIndex)) {
    useFlats = true;
    console.log(`  Using flats (minor chord in flat key)`);
  } else {
    console.log(`  Using sharps`);
  }
  
  const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  const result = useFlats ? flatNames[noteIndex] : sharpNames[noteIndex];
  console.log(`  Result: ${result}`);
  return result;
}

// Extract note names
const contextMidiNotes = result.midiNotes.filter(n => n !== null);
console.log('\n=== Note Name Conversion ===');
console.log('Context MIDI Notes:', contextMidiNotes);

const noteNames = [];
for (let i = 0; i < result.frets.length; i++) {
  if (result.frets[i] !== null && result.stringSet.includes(i + 1)) {
    const midiNote = result.midiNotes[i];
    const noteName = midiToNoteName(midiNote, contextMidiNotes);
    noteNames.push(noteName);
  }
}

console.log('\nFinal Note Names:', noteNames);
console.log('Expected: [C, Eb, G]');

if (noteNames.includes('E') && !noteNames.includes('Eb')) {
  console.error('\n❌ ERROR: Found E instead of Eb!');
  process.exit(1);
} else if (noteNames.includes('Eb')) {
  console.log('\n✓ Correct: Eb is present');
  process.exit(0);
} else {
  console.log('\n⚠ Warning: Unexpected result');
  process.exit(1);
}

