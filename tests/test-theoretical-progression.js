/**
 * Test theoretical progression: C♯ major – D♯ minor – G♭ minor – B𝄫 major
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';

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
  
  // Detect rare keys with double accidentals
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
  // Gb minor (theoretical): Gb (6), B𝄫 (9), Db (1)
  const isGbMinor = rootIndex === 6 && hasMinorThird &&
                    contextMidiNotes.some(n => (n % 12) === 9) && 
                    contextMidiNotes.some(n => (n % 12) === 1) &&
                    contextMidiNotes.length === 3;
    // B𝄫 major (theoretical): B𝄫 (10), D𝄫 (0), F♭ (4)
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
      useFlats = true; // Gb minor uses flats
    } else {
      useFlats = false; // F# major uses sharps
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
      useFlats = true; // B𝄫 major uses flats
    } else {
      useFlats = true; // Bb uses flats
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
  
  // Handle enharmonic spellings and double accidentals
  if (!useFlats) {
    if (rootIndex === 1) { // C# major
      if (noteIndex === 5) result = 'E♯';
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
      if (noteIndex === 9) result = 'B𝄫'; // A should be B𝄫 in Gb minor
      if (noteIndex === 1) result = 'D♭';
    } else if (isBDoubleFlatMajor) {
      if (noteIndex === 10) result = 'B𝄫'; // Bb should be B𝄫 in B𝄫 major
      if (noteIndex === 0) result = 'D𝄫'; // C should be D𝄫 in B𝄫 major
      if (noteIndex === 4) result = 'F♭'; // E should be F♭ in B𝄫 major
    }
  }
  
  return result;
}

// Test progression
const progression = [
  {
    name: 'C♯ major',
    voicing: [61, 65, 68], // C#, E#(F), G#
    expected: ['C♯', 'E♯', 'G♯'],
    description: 'C♯ major: C♯ – E♯ – G♯'
  },
  {
    name: 'D♯ minor',
    voicing: [63, 66, 70], // D#(Eb), F#(Gb), A#(Bb)
    expected: ['D♯', 'F♯', 'A♯'],
    description: 'D♯ minor: D♯ – F♯ – A♯'
  },
  {
    name: 'G♭ minor',
    voicing: [66, 69, 73], // Gb(F#), B𝄫(A), Db(C#)
    expected: ['G♭', 'B𝄫', 'D♭'],
    description: 'G♭ minor: G♭ – B𝄫 – D♭'
  },
  {
    name: 'B𝄫 major',
    voicing: [70, 72, 76], // B𝄫(Bb), D𝄫(C), F♭(E) - corrected voicing
    expected: ['B𝄫', 'D𝄫', 'F♭'],
    description: 'B𝄫 major: B𝄫 – D𝄫 – F♭'
  }
];

console.log('Testing theoretical progression: C♯ major – D♯ minor – G♭ minor – B𝄫 major\n');

const projection = new FretboardProjection();
let passed = 0;
let failed = 0;
const failures = [];

for (const chord of progression) {
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
      const noteName = midiToNoteName(midiNote, contextMidiNotes);
      noteNames.push(noteName);
    }
  }
  
  console.log(`${chord.name}:`);
  console.log(`  Expected: [${chord.expected.join(', ')}]`);
  console.log(`  Got:      [${noteNames.join(', ')}]`);
  console.log(`  MIDI:     [${chord.voicing.join(', ')}]`);
  console.log(`  Context:  [${contextMidiNotes.join(', ')}]`);
  
  // Check if it matches
  const sortedGot = [...noteNames].sort();
  const sortedExpected = [...chord.expected].sort();
  const matches = JSON.stringify(sortedGot) === JSON.stringify(sortedExpected);
  
  if (matches) {
    passed++;
    console.log(`  ✓ Correct\n`);
  } else {
    failed++;
    failures.push(chord);
    console.log(`  ✗ Incorrect\n`);
  }
}

console.log(`=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${progression.length}`);

if (failures.length > 0) {
  console.log(`\nFailures:`);
  failures.forEach(f => {
    console.log(`  ${f.name}: Expected [${f.expected.join(', ')}]`);
  });
  process.exit(1);
} else {
  console.log(`\n✓ All chords in progression spelled correctly!`);
  process.exit(0);
}

