/**
 * Comprehensive test for all major and minor triad spellings
 * Verifies correct note names according to standard music theory
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';

// Expected spellings for all major and minor triads
const EXPECTED_SPELLINGS = {
  // Major triads
  'C': ['C', 'E', 'G'],
  'C#': ['C#', 'E#', 'G#'],  // E# = F, but spelled as E# in C# major
  'Db': ['Db', 'F', 'Ab'],
  'D': ['D', 'F#', 'A'],
  'D#': ['D#', 'F##', 'A#'],  // F## = G, but spelled as F## in D# major (rare)
  'Eb': ['Eb', 'G', 'Bb'],
  'E': ['E', 'G#', 'B'],
  'F': ['F', 'A', 'C'],
  'F#': ['F#', 'A#', 'C#'],
  'Gb': ['Gb', 'Bb', 'Db'],
  'G': ['G', 'B', 'D'],
  'G#': ['G#', 'B#', 'D#'],  // B# = C, but spelled as B# in G# major (rare)
  'Ab': ['Ab', 'C', 'Eb'],
  'A': ['A', 'C#', 'E'],
  'A#': ['A#', 'C##', 'E#'],  // C## = D, E# = F, but spelled with double sharps (rare)
  'Bb': ['Bb', 'D', 'F'],
  'B': ['B', 'D#', 'F#'],
  
  // Minor triads
  'Cm': ['C', 'Eb', 'G'],
  'C#m': ['C#', 'E', 'G#'],
  'Dbm': ['Db', 'E', 'Ab'],  // E = Fb in some contexts, but E is correct here
  'Dm': ['D', 'F', 'A'],
  'D#m': ['D#', 'F#', 'A#'],
  'Ebm': ['Eb', 'Gb', 'Bb'],
  'Em': ['E', 'G', 'B'],
  'Fm': ['F', 'Ab', 'C'],
  'F#m': ['F#', 'A', 'C#'],
  'Gbm': ['Gb', 'A', 'Db'],  // A = Bbb in some contexts, but A is correct here
  'Gm': ['G', 'Bb', 'D'],
  'G#m': ['G#', 'B', 'D#'],
  'Abm': ['Ab', 'B', 'Eb'],  // B = Cb in some contexts, but B is correct here
  'Am': ['A', 'C', 'E'],
  'A#m': ['A#', 'C#', 'E#'],  // E# = F, but spelled as E# in A# minor (rare)
  'Bbm': ['Bb', 'Db', 'F'],
  'Bm': ['B', 'D', 'F#']
};

// MIDI note numbers (using octave 4)
const MIDI_NOTES = {
  'C': 60, 'C#': 61, 'Db': 61,
  'D': 62, 'D#': 63, 'Eb': 63,
  'E': 64, 'Fb': 64,
  'E#': 65, 'F': 65,
  'F#': 66, 'Gb': 66,
  'G': 67, 'G#': 68, 'Ab': 68,
  'A': 69, 'A#': 70, 'Bb': 70,
  'B': 71, 'Cb': 71,
  'B#': 72, 'C##': 62, 'F##': 67
};

// Major triad intervals: root, major third (4 semitones), perfect fifth (7 semitones)
const MAJOR_INTERVALS = [0, 4, 7];
// Minor triad intervals: root, minor third (3 semitones), perfect fifth (7 semitones)
const MINOR_INTERVALS = [0, 3, 7];

function getChordMidi(rootName, isMajor) {
  const rootMidi = MIDI_NOTES[rootName];
  if (!rootMidi) {
    throw new Error(`Unknown root: ${rootName}`);
  }
  const intervals = isMajor ? MAJOR_INTERVALS : MINOR_INTERVALS;
  return intervals.map(interval => rootMidi + interval);
}

// Note name conversion (from UI)
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
  
  let useFlats = false;
  
  // Handle each root note with proper key signature detection
  if (rootIndex === 0) { // C
    useFlats = hasMinorThird;
  } else if (rootIndex === 1) { // C# or Db
    useFlats = false; // Default to C# (sharps)
  } else if (rootIndex === 2) { // D
    useFlats = false;
  } else if (rootIndex === 3) { // D# or Eb
    useFlats = true; // Eb is standard, D# is very rare
  } else if (rootIndex === 4) { // E
    useFlats = false;
  } else if (rootIndex === 5) { // F
    useFlats = true;
  } else if (rootIndex === 6) { // F# or Gb
    useFlats = false; // Default to F# (sharps)
  } else if (rootIndex === 7) { // G
    useFlats = hasMinorThird;
  } else if (rootIndex === 8) { // G# or Ab
    useFlats = true; // Ab is standard, G# is very rare
  } else if (rootIndex === 9) { // A
    useFlats = false;
  } else if (rootIndex === 10) { // A# or Bb
    useFlats = true; // Bb is standard, A# is very rare
  } else if (rootIndex === 11) { // B
    useFlats = false;
  }
  
  const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  let result = useFlats ? flatNames[noteIndex] : sharpNames[noteIndex];
  
  // Handle enharmonic spellings in sharp keys
  if (!useFlats) {
    if (rootIndex === 1) { // C# key
      if (noteIndex === 5) result = 'E#'; // F should be E# in C# major
    }
  }
  
  return result;
}

function testTriad(rootName, isMajor) {
  const voicing = getChordMidi(rootName, isMajor);
  const projection = new FretboardProjection();
  const result = projection.project({
    voicing: voicing,
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
      const noteName = midiToNoteName(midiNote, contextMidiNotes);
      noteNames.push(noteName);
    }
  }
  
  const chordName = rootName + (isMajor ? '' : 'm');
  const expected = EXPECTED_SPELLINGS[chordName];
  
  // Sort both for comparison (order doesn't matter for triads)
  const sortedGot = [...noteNames].sort();
  const sortedExpected = [...expected].sort();
  
  return {
    chord: chordName,
    voicing: voicing,
    got: noteNames,
    expected: expected,
    match: JSON.stringify(sortedGot) === JSON.stringify(sortedExpected),
    contextMidiNotes: contextMidiNotes
  };
}

console.log('Testing all major and minor triads for correct spelling...\n');

const allChords = [
  // Major
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  // Minor
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
];

let passed = 0;
let failed = 0;
const failures = [];

for (const chordName of allChords) {
  const isMajor = !chordName.endsWith('m');
  const rootName = isMajor ? chordName : chordName.slice(0, -1);
  
  try {
    const result = testTriad(rootName, isMajor);
    
    if (result.match) {
      passed++;
      console.log(`✓ ${chordName.padEnd(4)} - [${result.got.join(', ')}]`);
    } else {
      failed++;
      failures.push(result);
      console.error(`✗ ${chordName.padEnd(4)} - Expected: [${result.expected.join(', ')}], Got: [${result.got.join(', ')}]`);
    }
  } catch (error) {
    failed++;
    console.error(`✗ ${chordName.padEnd(4)} - Error: ${error.message}`);
    failures.push({ chord: chordName, error: error.message });
  }
}

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${allChords.length}`);

if (failures.length > 0) {
  console.log(`\nFailures:`);
  failures.forEach(f => {
    if (f.error) {
      console.log(`  ${f.chord}: ${f.error}`);
    } else {
      console.log(`  ${f.chord}: Expected [${f.expected.join(', ')}], Got [${f.got.join(', ')}]`);
    }
  });
  process.exit(1);
} else {
  console.log(`\n✓ All triads spelled correctly!`);
  process.exit(0);
}

