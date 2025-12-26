/**
 * Debug seventh chord spelling issues
 */

// Test what the system actually outputs for common seventh chords
const chords = [
  { name: 'Cmaj7', voicing: [48, 52, 55, 59], expected: ['C', 'E', 'G', 'B'] },
  { name: 'Dm7', voicing: [50, 53, 57, 60], expected: ['D', 'F', 'A', 'C'] },
  { name: 'G7', voicing: [55, 59, 62, 65], expected: ['G', 'B', 'D', 'F'] },
  { name: 'Am7', voicing: [57, 60, 64, 67], expected: ['A', 'C', 'E', 'G'] }
];

// Simplified version of the note name function
function getNoteName(midiNote, contextMidiNotes) {
  const noteIndex = midiNote % 12;
  const rootMidi = Math.min(...contextMidiNotes);
  const rootIndex = rootMidi % 12;
  
  const sortedNotes = [...contextMidiNotes].sort((a, b) => a - b);
  const hasMinorThird = sortedNotes.some(note => (note - rootMidi) % 12 === 3);
  
  let useFlats = false;
  
  if (rootIndex === 0) {
    useFlats = hasMinorThird;
  } else if (rootIndex === 1) {
    useFlats = false;
  } else if (rootIndex === 2) {
    useFlats = false;
  } else if (rootIndex === 3) {
    useFlats = hasMinorThird ? true : true; // Eb
  } else if (rootIndex === 4) {
    useFlats = false;
  } else if (rootIndex === 5) {
    useFlats = true;
  } else if (rootIndex === 6) {
    useFlats = false; // F#
  } else if (rootIndex === 7) {
    useFlats = hasMinorThird;
  } else if (rootIndex === 8) {
    useFlats = true; // Ab
  } else if (rootIndex === 9) {
    useFlats = false;
  } else if (rootIndex === 10) {
    useFlats = true; // Bb
  } else if (rootIndex === 11) {
    useFlats = false;
  }
  
  const sharpNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const flatNames = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  
  return useFlats ? flatNames[noteIndex] : sharpNames[noteIndex];
}

console.log('Testing seventh chord spelling:\n');

for (const chord of chords) {
  console.log(`${chord.name}:`);
  console.log(`  Voicing: [${chord.voicing.join(', ')}]`);
  console.log(`  Expected: [${chord.expected.join(', ')}]`);
  
  const noteNames = chord.voicing.map(midi => getNoteName(midi, chord.voicing));
  console.log(`  Got:      [${noteNames.join(', ')}]`);
  
  const matches = JSON.stringify(noteNames) === JSON.stringify(chord.expected);
  console.log(`  ${matches ? '✓' : '✗'} ${matches ? 'Correct' : 'Incorrect'}\n`);
  
  if (!matches) {
    // Show what each note is
    console.log('  Note-by-note:');
    chord.voicing.forEach((midi, i) => {
      const got = noteNames[i];
      const expected = chord.expected[i];
      console.log(`    MIDI ${midi} (${['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][midi % 12]}): Got "${got}", Expected "${expected}"`);
    });
    console.log();
  }
}

