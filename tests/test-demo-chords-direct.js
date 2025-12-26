/**
 * Test the exact chords from the demo - direct function test
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Read the UI file and extract the function
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uiFile = readFileSync(join(__dirname, '../src/fretboard-ui-v0.1.js'), 'utf-8');

// Extract just the midiToNoteNameWithContext function logic
function midiToNoteNameWithContext(midiNote, contextMidiNotes) {
  const noteIndex = midiNote % 12;
  const rootMidi = Math.min(...contextMidiNotes);
  const rootIndex = rootMidi % 12;
  
  const sortedNotes = [...contextMidiNotes].sort((a, b) => a - b);
  const hasMinorThird = sortedNotes.some(note => (note - rootMidi) % 12 === 3);
  
  // Detect rare keys (only for triads currently - this is the problem!)
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

function midiToNoteName(midiNote, contextMidiNotes = null) {
  const noteIndex = midiNote % 12;
  if (contextMidiNotes && contextMidiNotes.length > 0) {
    return midiToNoteNameWithContext(midiNote, contextMidiNotes);
  }
  const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  return noteNames[noteIndex];
}

// Demo voicings
const demoChords = [
  { name: 'Cmaj7', voicing: [48, 52, 55, 59], expected: ['C', 'E', 'G', 'B'] },
  { name: 'Dm7', voicing: [50, 53, 57, 60], expected: ['D', 'F', 'A', 'C'] },
  { name: 'G7', voicing: [55, 59, 62, 65], expected: ['G', 'B', 'D', 'F'] }, // Fixed: was [55, 59, 62, 67] (G-B-D-G)
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
      const noteName = midiToNoteName(midiNote, contextMidiNotes);
      noteNames.push(noteName);
    }
  }
  
  console.log(`${chord.name}:`);
  console.log(`  Expected: [${chord.expected.join(', ')}]`);
  console.log(`  Got:      [${noteNames.join(', ')}]`);
  console.log(`  MIDI:     [${chord.voicing.join(', ')}]`);
  console.log(`  Context:  [${contextMidiNotes.join(', ')}]`);
  
  // Check each note individually to see what's wrong
  const rootMidi = Math.min(...contextMidiNotes);
  const rootIndex = rootMidi % 12;
  const sortedNotes = [...contextMidiNotes].sort((a, b) => a - b);
  const hasMinorThird = sortedNotes.some(note => (note - rootMidi) % 12 === 3);
  console.log(`  Root: ${rootMidi} (index ${rootIndex}), Has minor third: ${hasMinorThird}, Length: ${contextMidiNotes.length}`);
  
  const sortedGot = [...noteNames].sort();
  const sortedExpected = [...chord.expected].sort();
  const matches = JSON.stringify(sortedGot) === JSON.stringify(sortedExpected);
  
  if (matches) {
    passed++;
    console.log(`  ✓ Correct\n`);
  } else {
    failed++;
    console.log(`  ✗ Incorrect\n`);
    // Show what each note should be
    console.log(`  Note-by-note:`);
    for (let i = 0; i < contextMidiNotes.length; i++) {
      const midi = contextMidiNotes[i];
      const got = noteNames[i];
      const expected = chord.expected.find(e => {
        // Find expected note that matches this MIDI
        const expectedMidi = chord.voicing[i];
        return expectedMidi === midi;
      });
      console.log(`    MIDI ${midi}: Got "${got}", Expected "${expected || '?'}"`);
    }
    console.log();
  }
}

console.log(`=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

process.exit(failed > 0 ? 1 : 0);

