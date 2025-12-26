/**
 * Test seventh chords: Cmaj7, Dm7, G7, Am7
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';

// Note name conversion (from UI)
function midiToNoteName(midiNote, contextMidiNotes = null) {
  const noteIndex = midiNote % 12;
  
  if (contextMidiNotes && contextMidiNotes.length > 0) {
    return midiToNoteNameWithContext(midiNote, contextMidiNotes);
  }
  
  const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  return noteNames[noteIndex];
}

// Copy the function from UI to test
function midiToNoteNameWithContext(midiNote, contextMidiNotes) {
  const noteIndex = midiNote % 12;
  const rootMidi = Math.min(...contextMidiNotes);
  const rootIndex = rootMidi % 12;
  
  const sortedNotes = [...contextMidiNotes].sort((a, b) => a - b);
  const hasMinorThird = sortedNotes.some(note => (note - rootMidi) % 12 === 3);
  
  // Detect rare keys (simplified for testing)
  const isCbMajor = rootIndex === 11 && !hasMinorThird && 
                    contextMidiNotes.some(n => (n % 12) === 3) && 
                    contextMidiNotes.some(n => (n % 12) === 6) &&
                    contextMidiNotes.length === 3;
  const isGbMajor = rootIndex === 8 && !hasMinorThird &&
                    contextMidiNotes.some(n => (n % 12) === 0) && 
                    contextMidiNotes.some(n => (n % 12) === 3) &&
                    contextMidiNotes.length === 3;
  const isFbMinor = rootIndex === 4 && hasMinorThird &&
                    contextMidiNotes.some(n => (n % 12) === 7) && 
                    contextMidiNotes.some(n => (n % 12) === 11) &&
                    contextMidiNotes.length === 3;
  const isDSharpMinor = rootIndex === 3 && hasMinorThird &&
                        contextMidiNotes.some(n => (n % 12) === 6) && 
                        contextMidiNotes.some(n => (n % 12) === 10) &&
                        contextMidiNotes.length === 3;
  const isASharpMajor = rootIndex === 10 && !hasMinorThird &&
                        contextMidiNotes.some(n => (n % 12) === 2) && 
                        contextMidiNotes.some(n => (n % 12) === 5) &&
                        contextMidiNotes.length === 3;
  const isGbMinor = rootIndex === 6 && hasMinorThird &&
                    contextMidiNotes.some(n => (n % 12) === 9) && 
                    contextMidiNotes.some(n => (n % 12) === 1) &&
                    contextMidiNotes.length === 3;
  const isBDoubleFlatMajor = rootIndex === 10 && !hasMinorThird &&
                                contextMidiNotes.some(n => (n % 12) === 0) && 
                                contextMidiNotes.some(n => (n % 12) === 4) &&
                                contextMidiNotes.length === 3;
  
  let useFlats = false;
  
  if (rootIndex === 0) {
    useFlats = hasMinorThird;
  } else if (rootIndex === 1) {
    useFlats = false;
  } else if (rootIndex === 2) {
    useFlats = false;
  } else if (rootIndex === 3) {
    if (isDSharpMinor) {
      useFlats = false;
    } else if (hasMinorThird) {
      useFlats = true;
    } else {
      useFlats = true;
    }
  } else if (rootIndex === 4) {
    if (isFbMinor) {
      useFlats = true;
    } else if (hasMinorThird) {
      useFlats = false;
    } else {
      useFlats = false;
    }
  } else if (rootIndex === 5) {
    useFlats = true;
  } else if (rootIndex === 6) {
    if (isGbMinor) {
      useFlats = true;
    } else if (!hasMinorThird) {
      useFlats = false;
    } else {
      useFlats = false;
    }
  } else if (rootIndex === 7) {
    useFlats = hasMinorThird;
  } else if (rootIndex === 8) {
    if (isGbMajor) {
      useFlats = false;
    } else if (!hasMinorThird) {
      useFlats = true;
    } else {
      useFlats = true;
    }
  } else if (rootIndex === 9) {
    useFlats = false;
  } else if (rootIndex === 10) {
    if (isASharpMajor) {
      useFlats = false;
    } else if (isBDoubleFlatMajor) {
      useFlats = true;
    } else {
      useFlats = true;
    }
  } else if (rootIndex === 11) {
    if (isCbMajor) {
      useFlats = true;
    } else if (!hasMinorThird) {
      useFlats = false;
    } else {
      useFlats = false;
    }
  }
  
  const sharpNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const flatNames = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  
  let result = useFlats ? flatNames[noteIndex] : sharpNames[noteIndex];
  
  // Handle enharmonic spellings
  if (!useFlats) {
    if (rootIndex === 1) {
      if (noteIndex === 5) result = 'E♯';
      if (noteIndex === 0) result = 'B♯';
      if (noteIndex === 8) result = 'G♯';
    } else if (isGbMajor) {
      if (noteIndex === 0) result = 'B♯';
      if (noteIndex === 3) result = 'D♯';
      if (noteIndex === 8) result = 'G♯';
    } else if (isDSharpMinor) {
      if (noteIndex === 3) result = 'D♯';
      if (noteIndex === 6) result = 'F♯';
      if (noteIndex === 10) result = 'A♯';
    } else if (isASharpMajor) {
      if (noteIndex === 2) result = 'C𝄪';
      if (noteIndex === 5) result = 'E♯';
      if (noteIndex === 10) result = 'A♯';
    }
  } else {
    if (isCbMajor) {
      if (noteIndex === 11) result = 'C♭';
      if (noteIndex === 3) result = 'E♭';
      if (noteIndex === 6) result = 'G♭';
    } else if (isFbMinor) {
      if (noteIndex === 4) result = 'F♭';
      if (noteIndex === 7) result = 'A♭♭';
      if (noteIndex === 11) result = 'C♭';
    } else if (isGbMinor) {
      if (noteIndex === 6) result = 'G♭';
      if (noteIndex === 9) result = 'B𝄫';
      if (noteIndex === 1) result = 'D♭';
    } else if (isBDoubleFlatMajor) {
      if (noteIndex === 10) result = 'B𝄫';
      if (noteIndex === 0) result = 'D𝄫';
      if (noteIndex === 4) result = 'F♭';
    }
  }
  
  return result;
}

// Expected spellings for seventh chords
const EXPECTED = {
  'Cmaj7': ['C', 'E', 'G', 'B'],      // C major 7th: C-E-G-B
  'Dm7': ['D', 'F', 'A', 'C'],        // D minor 7th: D-F-A-C
  'G7': ['G', 'B', 'D', 'F'],         // G dominant 7th: G-B-D-F
  'Am7': ['A', 'C', 'E', 'G']         // A minor 7th: A-C-E-G
};

// MIDI notes for these chords (using octave 4)
const CHORD_MIDI = {
  'Cmaj7': [60, 64, 67, 71],  // C, E, G, B
  'Dm7': [62, 65, 69, 72],    // D, F, A, C
  'G7': [67, 71, 74, 77],     // G, B, D, F
  'Am7': [69, 72, 76, 79]     // A, C, E, G
};

console.log('Testing seventh chords from demo...\n');

const projection = new FretboardProjection();
let passed = 0;
let failed = 0;

for (const [chordName, voicing] of Object.entries(CHORD_MIDI)) {
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
  
  const expected = EXPECTED[chordName];
  const sortedGot = [...noteNames].sort();
  const sortedExpected = [...expected].sort();
  const matches = JSON.stringify(sortedGot) === JSON.stringify(sortedExpected);
  
  console.log(`${chordName}:`);
  console.log(`  Expected: [${expected.join(', ')}]`);
  console.log(`  Got:      [${noteNames.join(', ')}]`);
  console.log(`  MIDI:     [${voicing.join(', ')}]`);
  console.log(`  Context:  [${contextMidiNotes.join(', ')}]`);
  
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
console.log(`Total: ${Object.keys(CHORD_MIDI).length}`);

process.exit(failed > 0 ? 1 : 0);


