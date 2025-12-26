/**
 * Test note name conversion for all major and minor chords with accidentals
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';

// Note name conversion function with context (copied from UI logic)
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
  
  // Check if chord is minor
  const sortedNotes = [...contextMidiNotes].sort((a, b) => a - b);
  const hasMinorThird = sortedNotes.some(note => (note - rootMidi) % 12 === 3);
  
  const flatRoots = [1, 3, 5, 6, 8, 10]; // Db, Eb, F, Gb, Ab, Bb
  const minorFlatRoots = [0, 5, 7, 10]; // Cm, Fm, Gm, Bbm use flats
  
  let useFlats = false;
  if (flatRoots.includes(rootIndex)) {
    useFlats = true;
  } else if (hasMinorThird && minorFlatRoots.includes(rootIndex)) {
    useFlats = true;
  }
  
  const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  return useFlats ? flatNames[noteIndex] : sharpNames[noteIndex];
}

// MIDI note numbers for all 12 chromatic notes (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
// Using octave 4 (MIDI 60-71)
const CHROMATIC_NOTES = {
  'C': 60,
  'C#': 61, 'Db': 61,
  'D': 62,
  'D#': 63, 'Eb': 63,
  'E': 64,
  'F': 65,
  'F#': 66, 'Gb': 66,
  'G': 67,
  'G#': 68, 'Ab': 68,
  'A': 69,
  'A#': 70, 'Bb': 70,
  'B': 71
};

// Major chord intervals: root, major third, perfect fifth
const MAJOR_INTERVALS = [0, 4, 7];

// Minor chord intervals: root, minor third, perfect fifth
const MINOR_INTERVALS = [0, 3, 7];

function getChordNotes(rootMidi, intervals) {
  return intervals.map(interval => rootMidi + interval);
}

function testChord(rootName, isMajor) {
  const rootMidi = CHROMATIC_NOTES[rootName];
  if (!rootMidi) {
    throw new Error(`Unknown root: ${rootName}`);
  }
  
  const intervals = isMajor ? MAJOR_INTERVALS : MINOR_INTERVALS;
  const voicing = getChordNotes(rootMidi, intervals);
  
  const projection = new FretboardProjection();
  const result = projection.project({
    voicing: voicing,
    inversion: 'root',
    registerPosition: 'mid',
    hold: false,
    reasonCodes: []
  });
  
  // Extract note names from projection result with context
  const noteNames = [];
  const contextMidiNotes = result.midiNotes.filter(n => n !== null);
  
  for (let i = 0; i < result.frets.length; i++) {
    if (result.frets[i] !== null && result.stringSet.includes(i + 1)) {
      const midiNote = result.midiNotes[i];
      const noteName = midiToNoteName(midiNote, contextMidiNotes);
      noteNames.push(noteName);
    }
  }
  
  // Calculate expected notes with context
  const expectedNotes = intervals.map(interval => {
    const noteMidi = rootMidi + interval;
    return midiToNoteName(noteMidi, voicing);
  });
  
  return {
    root: rootName,
    type: isMajor ? 'major' : 'minor',
    voicing: voicing,
    result: result,
    noteNames: noteNames,
    expectedNotes: expectedNotes
  };
}

// Test all major and minor chords with accidentals
const chordsToTest = [
  // Major chords with accidentals
  { root: 'C#', major: true },
  { root: 'Db', major: true },
  { root: 'D#', major: true },
  { root: 'Eb', major: true },
  { root: 'F#', major: true },
  { root: 'Gb', major: true },
  { root: 'G#', major: true },
  { root: 'Ab', major: true },
  { root: 'A#', major: true },
  { root: 'Bb', major: true },
  
  // Minor chords with accidentals
  { root: 'C#', major: false },
  { root: 'Db', major: false },
  { root: 'D#', major: false },
  { root: 'Eb', major: false },
  { root: 'F#', major: false },
  { root: 'Gb', major: false },
  { root: 'G#', major: false },
  { root: 'Ab', major: false },
  { root: 'A#', major: false },
  { root: 'Bb', major: false },
  
  // Also test natural chords for reference
  { root: 'C', major: true },
  { root: 'C', major: false },
  { root: 'D', major: true },
  { root: 'D', major: false },
  { root: 'E', major: true },
  { root: 'E', major: false },
  { root: 'F', major: true },
  { root: 'F', major: false },
  { root: 'G', major: true },
  { root: 'G', major: false },
  { root: 'A', major: true },
  { root: 'A', major: false },
  { root: 'B', major: true },
  { root: 'B', major: false },
];

console.log('Testing note name conversion for all major and minor chords...\n');

let passed = 0;
let failed = 0;
const failures = [];

for (const chord of chordsToTest) {
  try {
    const result = testChord(chord.root, chord.major);
    
    // Check if all expected notes are present in the result
    const allNotesPresent = result.expectedNotes.every(expected => 
      result.noteNames.includes(expected)
    );
    
    if (allNotesPresent && result.noteNames.length === result.expectedNotes.length) {
      passed++;
      const chordName = `${chord.root}${chord.major ? '' : 'm'}`;
      console.log(`✓ ${chordName.padEnd(6)} - Notes: [${result.noteNames.join(', ')}]`);
    } else {
      failed++;
      const chordName = `${chord.root}${chord.major ? '' : 'm'}`;
      const error = `Expected: [${result.expectedNotes.join(', ')}], Got: [${result.noteNames.join(', ')}]`;
      failures.push({ chord: chordName, error });
      console.error(`✗ ${chordName.padEnd(6)} - ${error}`);
    }
  } catch (error) {
    failed++;
    const chordName = `${chord.root}${chord.major ? '' : 'm'}`;
    failures.push({ chord: chordName, error: error.message });
    console.error(`✗ ${chordName.padEnd(6)} - Error: ${error.message}`);
  }
}

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${chordsToTest.length}`);

if (failures.length > 0) {
  console.log(`\nFailures:`);
  failures.forEach(f => console.log(`  ${f.chord}: ${f.error}`));
  process.exit(1);
} else {
  console.log(`\n✓ All tests passed!`);
  process.exit(0);
}

