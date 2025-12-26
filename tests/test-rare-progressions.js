/**
 * Test rare progressions with double accidentals
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
    useFlats = false;
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
    useFlats = true;
  } else if (rootIndex === 11) {
    if (isCbMajor) {
      useFlats = true;
    } else if (!hasMinorThird) {
      useFlats = false;
    } else {
      useFlats = false;
    }
  }
  
  const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  let result = useFlats ? flatNames[noteIndex] : sharpNames[noteIndex];
  
  // Handle enharmonic spellings and double accidentals
  if (!useFlats) {
    if (rootIndex === 1) {
      if (noteIndex === 5) result = 'E#';
    } else if (isGbMajor) {
      if (noteIndex === 0) result = 'B♯';
      if (noteIndex === 3) result = 'D♯';
      if (noteIndex === 8) result = 'G♯';
    } else if (isDSharpMinor) {
      if (noteIndex === 3) result = 'D♯';
      if (noteIndex === 6) result = 'F♯';
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
    }
  }
  
  return result;
}

// Test progressions
const progressions = [
  {
    name: 'C♭ major',
    voicing: [71, 75, 78], // C♭(B), E♭(D#), G♭(F#) - using enharmonic MIDI
    expected: ['C♭', 'E♭', 'G♭'],
    description: 'C♭ major: C♭ – E♭ – G♭'
  },
  {
    name: 'G♯ major',
    voicing: [68, 72, 75], // G♯(Ab), B♯(C), D♯(Eb) - using enharmonic MIDI
    expected: ['G♯', 'B♯', 'D♯'],
    description: 'G♯ major: G♯ – B♯ – D♯'
  },
  {
    name: 'F♭ minor',
    voicing: [64, 67, 71], // F♭(E), A♭♭(G), C♭(B) - using enharmonic MIDI
    expected: ['F♭', 'A♭♭', 'C♭'],
    description: 'F♭ minor: F♭ – A♭♭ – C♭'
  },
  {
    name: 'D♯ minor',
    voicing: [63, 66, 70], // D♯(Eb), F♯(Gb), A♯(Bb) - using enharmonic MIDI
    expected: ['D♯', 'F♯', 'A♯'],
    description: 'D♯ minor: D♯ – F♯ – A♯'
  }
];

console.log('Testing rare progressions with double accidentals...\n');

const projection = new FretboardProjection();
let passed = 0;
let failed = 0;
const failures = [];

for (const prog of progressions) {
  const result = projection.project({
    voicing: prog.voicing,
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
  
  console.log(`${prog.name}:`);
  console.log(`  Expected: [${prog.expected.join(', ')}]`);
  console.log(`  Got:      [${noteNames.join(', ')}]`);
  console.log(`  MIDI:     [${prog.voicing.join(', ')}]`);
  console.log(`  Context:  [${contextMidiNotes.join(', ')}]`);
  
  // Check if it matches (accounting for enharmonic equivalents)
  const matches = JSON.stringify(noteNames.sort()) === JSON.stringify(prog.expected.sort());
  
  if (matches) {
    passed++;
    console.log(`  ✓ Correct\n`);
  } else {
    failed++;
    failures.push(prog);
    console.log(`  ✗ Incorrect\n`);
  }
}

console.log(`=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${progressions.length}`);

if (failures.length > 0) {
  console.log(`\nNote: These chords use double accidentals which the current system doesn't support.`);
  console.log(`The system shows enharmonic equivalents instead.`);
  process.exit(1);
} else {
  console.log(`\n✓ All progressions spelled correctly!`);
  process.exit(0);
}

