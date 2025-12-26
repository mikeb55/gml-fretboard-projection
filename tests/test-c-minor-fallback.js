/**
 * Test C minor with fallback (no midiNotes in mapping)
 */

// Simulate old projection output without midiNotes
const cMinorMapping = {
  stringSet: [1, 2, 3],
  frets: [8, 8, 5, null, null, null], // C on string 1, E on string 2, G on string 3
  positionWindow: [5, 10],
  anchorFret: 5,
  movementType: 'RESET',
  shapeId: 'root',
  registerBand: 'mid'
  // Note: no midiNotes!
};

// UI logic (simulated)
const GUITAR_TUNING = [40, 45, 50, 55, 59, 64]; // EADGBE

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
  
  const flatRoots = [1, 3, 5, 6, 8, 10];
  const minorFlatRoots = [0, 5, 7, 10];
  
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

// Simulate UI drawing logic with fallback
const noteNames = [];
const calculatedMidiNotes = [];

for (let i = 0; i < cMinorMapping.frets.length; i++) {
  if (cMinorMapping.frets[i] !== null && cMinorMapping.stringSet.includes(i + 1)) {
    const stringNum = i + 1;
    const fretNum = cMinorMapping.frets[i];
    
    // Calculate MIDI note from string and fret (fallback)
    const openNoteMidi = GUITAR_TUNING[stringNum - 1];
    const noteMidi = openNoteMidi + fretNum;
    calculatedMidiNotes.push(noteMidi);
  }
}

console.log('Calculated MIDI notes from frets:', calculatedMidiNotes);
console.log('Note classes (mod 12):', calculatedMidiNotes.map(n => n % 12));

// Now convert with context
for (let i = 0; i < cMinorMapping.frets.length; i++) {
  if (cMinorMapping.frets[i] !== null && cMinorMapping.stringSet.includes(i + 1)) {
    const stringNum = i + 1;
    const fretNum = cMinorMapping.frets[i];
    const openNoteMidi = GUITAR_TUNING[stringNum - 1];
    const noteMidi = openNoteMidi + fretNum;
    
    const noteName = midiToNoteName(noteMidi, calculatedMidiNotes);
    noteNames.push(noteName);
    console.log(`String ${stringNum}, Fret ${fretNum}: MIDI ${noteMidi} -> ${noteName}`);
  }
}

console.log('\nFinal Note Names:', noteNames);
console.log('Expected: [C, Eb, G] or [C, E, G] (depending on octave)');

// Check if we got Eb (correct) or E (wrong)
if (noteNames.includes('Eb')) {
  console.log('✓ SUCCESS: Eb is correctly displayed!');
  process.exit(0);
} else if (noteNames.includes('E')) {
  console.log('❌ FAILURE: E is displayed instead of Eb');
  console.log('This happens when the calculated MIDI notes are in wrong octave');
  process.exit(1);
} else {
  console.log('⚠ Unexpected result');
  process.exit(1);
}

