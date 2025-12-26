/**
 * Debug C# major spelling
 */

const contextMidiNotes = [61, 65, 68]; // C#, E# (F), G#
const rootMidi = Math.min(...contextMidiNotes);
const rootIndex = rootMidi % 12;

console.log('Root MIDI:', rootMidi);
console.log('Root Index:', rootIndex);
console.log('Context Notes:', contextMidiNotes);

let useFlats = false;

if (rootIndex === 1) { // C# or Db
  useFlats = false; // Default to C# (sharps)
  console.log('Set useFlats to false for C#');
} else if (rootIndex === 3) {
  useFlats = true;
} else if (rootIndex === 6) {
  useFlats = false;
} else if (rootIndex === 8) {
  useFlats = true;
} else if (rootIndex === 10) {
  useFlats = true;
}

console.log('Final useFlats:', useFlats);

const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const noteNames = contextMidiNotes.map(midi => {
  const idx = midi % 12;
  return useFlats ? flatNames[idx] : sharpNames[idx];
});

console.log('Note names:', noteNames);
console.log('Expected: [C#, E#, G#] or [C#, F, G#]');


