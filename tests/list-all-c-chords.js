/**
 * List all C chords and their input formats
 */

import { spellChord } from '../src/chord-spelling.js';

console.log('=== All Supported Chord Types ===\n');
console.log('The app can spell the following chord types:');
console.log('- major (triad)');
console.log('- minor (triad)');
console.log('- diminished (triad)');
console.log('- augmented (triad)');
console.log('- maj7 (major 7th)');
console.log('- 7 (dominant 7th)');
console.log('- m7 (minor 7th)');
console.log('- dim7 (diminished 7th)');
console.log('- augmaj7 (augmented major 7th)\n');

console.log('=== All C Chords ===\n');

const cChords = [
  { root: 'C', type: 'major', name: 'C major' },
  { root: 'C', type: 'minor', name: 'C minor' },
  { root: 'C', type: 'diminished', name: 'C diminished' },
  { root: 'C', type: 'augmented', name: 'C augmented' },
  { root: 'C', type: 'maj7', name: 'C major 7th' },
  { root: 'C', type: '7', name: 'C dominant 7th' },
  { root: 'C', type: 'm7', name: 'C minor 7th' },
  { root: 'C', type: 'dim7', name: 'C diminished 7th' },
  { root: 'C', type: 'augmaj7', name: 'C augmented major 7th' },
];

console.log('Input format: spellChord(rootName, chordType)');
console.log('Example: spellChord("C", "minor")\n');

for (const chord of cChords) {
  try {
    const result = spellChord(chord.root, chord.type);
    console.log(`${chord.name}:`);
    console.log(`  Input: spellChord("${chord.root}", "${chord.type}")`);
    console.log(`  Output: [${result.join(', ')}]`);
    console.log();
  } catch (error) {
    console.log(`${chord.name}: ERROR - ${error.message}\n`);
  }
}

console.log('=== Input Format Reference ===\n');
console.log('Root names can be:');
console.log('  - Natural: "C", "D", "E", "F", "G", "A", "B"');
console.log('  - Sharp: "C♯", "D♯", "F♯", "G♯", "A♯"');
console.log('  - Flat: "D♭", "E♭", "G♭", "A♭", "B♭"');
console.log('  - Double sharp: "C𝄪", "D𝄪", "F𝄪", "G𝄪", "A𝄪"');
console.log('  - Double flat: "C𝄫", "D𝄫", "E𝄫", "F𝄫", "G𝄫", "A𝄫", "B𝄫"');
console.log('\nChord types:');
console.log('  - "major" - Major triad');
console.log('  - "minor" - Minor triad');
console.log('  - "diminished" - Diminished triad');
console.log('  - "augmented" - Augmented triad');
console.log('  - "maj7" - Major 7th chord');
console.log('  - "7" - Dominant 7th chord');
console.log('  - "m7" - Minor 7th chord');
console.log('  - "dim7" - Diminished 7th chord');
console.log('  - "augmaj7" - Augmented major 7th chord');

