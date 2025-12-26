/**
 * Test parsing the full "Parallax" song from the image
 */

import { parseChordProgression } from '../src/chord-symbol-parser.js';
import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';

// Full "Parallax" chord progression from the image
// Section A: Bb7 | % | Eb7 | F7 | Bb7 | % | Eb7 | Bb7
// Section B: Gm7 | Cm7 | F7 | Bb7 | Eb7 | Edim7 | Bb7/G7 | Cm7/F7
// Note: iReal Pro uses "/" to show two chords in one measure
// We extract only the second chord (Bb7/G7 → G7, Cm7/F7 → F7)
const parallaxProgression = `
Bb7 | % | Eb7 | F7 | Bb7 | % | Eb7 | Bb7 |
Gm7 | Cm7 | F7 | Bb7 | Eb7 | Edim7 | Bb7/G7 | Cm7/F7
`.trim();

console.log('Testing full "Parallax" song...\n');
console.log('Chord progression:');
console.log(parallaxProgression);
console.log();

// Parse the progression
const parsedChords = parseChordProgression(parallaxProgression);

console.log(`Parsed ${parsedChords.length} chords:\n`);

parsedChords.forEach((chord, i) => {
  console.log(`${i + 1}. ${chord.symbol.padEnd(8)} → [${chord.voicing.join(', ')}]`);
});

console.log(`\n=== Testing Projection Layer ===\n`);

// Test projecting all chords
const projection = new FretboardProjection();
let successCount = 0;
let failCount = 0;

for (let i = 0; i < parsedChords.length; i++) {
  const chord = parsedChords[i];
  try {
    const result = projection.project({
      voicing: chord.voicing,
      inversion: 'root',
      registerPosition: 'mid',
      hold: i > 0, // Hold after first chord
      reasonCodes: []
    });
    
    if (result && result.frets) {
      successCount++;
      const usedStrings = result.stringSet.length;
      const frets = result.frets.filter(f => f !== null).length;
      console.log(`✓ ${chord.symbol}: ${usedStrings} strings, ${frets} notes, movement: ${result.movementType}`);
    } else {
      failCount++;
      console.log(`✗ ${chord.symbol}: Failed to project`);
    }
  } catch (error) {
    failCount++;
    console.log(`✗ ${chord.symbol}: Error - ${error.message}`);
  }
}

console.log(`\n=== Results ===`);
console.log(`Total chords: ${parsedChords.length}`);
console.log(`Successfully projected: ${successCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log(`\n✓ All chords can be projected to the fretboard!`);
  process.exit(0);
} else {
  console.log(`\n✗ Some chords failed to project`);
  process.exit(1);
}

