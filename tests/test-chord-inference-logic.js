/**
 * Test chord inference logic directly
 */

// Extract just the inference logic
function inferChordFromMidi(contextMidiNotes) {
  if (contextMidiNotes.length < 2) return null;
  
  const rootMidi = Math.min(...contextMidiNotes);
  const rootIndex = rootMidi % 12;
  const sortedNotes = [...contextMidiNotes].sort((a, b) => a - b);
  
  // Check intervals from root
  const intervals = sortedNotes.map(note => (note - rootMidi) % 12);
  const hasMinorThird = intervals.includes(3);
  const hasMajorThird = intervals.includes(4);
  const hasPerfectFifth = intervals.includes(7);
  const hasDiminishedFifth = intervals.includes(6);
  const hasAugmentedFifth = intervals.includes(8);
  const hasMinorSeventh = intervals.includes(10);
  const hasMajorSeventh = intervals.includes(11);
  const hasDiminishedSeventh = intervals.includes(9);
  
  // Determine chord type
  let chordType = null;
  if (contextMidiNotes.length === 3) {
    if (hasMinorThird && hasDiminishedFifth) chordType = 'diminished';
    else if (hasMajorThird && hasAugmentedFifth) chordType = 'augmented';
    else if (hasMinorThird) chordType = 'minor';
    else if (hasMajorThird) chordType = 'major';
  } else if (contextMidiNotes.length === 4) {
    if (hasMinorThird && hasDiminishedFifth && hasDiminishedSeventh) chordType = 'dim7';
    else if (hasMinorThird && hasPerfectFifth && hasMinorSeventh) chordType = 'm7';
    else if (hasMajorThird && hasPerfectFifth && hasMinorSeventh) chordType = '7';
    else if (hasMajorThird && hasPerfectFifth && hasMajorSeventh) chordType = 'maj7';
    else if (hasMajorThird && hasAugmentedFifth && hasMajorSeventh) chordType = 'augmaj7';
  }
  
  if (!chordType) return null;
  
  // Infer root name from root index and chord structure
  const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const flatNames = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  
  // Use heuristics to determine if root should be sharp or flat
  let useFlats = false;
  if (rootIndex === 0) useFlats = hasMinorThird;
  else if (rootIndex === 1) useFlats = false; // C# default
  else if (rootIndex === 2) useFlats = false;
  else if (rootIndex === 3) useFlats = true; // Eb default
  else if (rootIndex === 4) useFlats = false;
  else if (rootIndex === 5) useFlats = true;
  else if (rootIndex === 6) useFlats = false; // F# default
  else if (rootIndex === 7) useFlats = hasMinorThird;
  else if (rootIndex === 8) useFlats = true; // Ab default
  else if (rootIndex === 9) useFlats = false;
  else if (rootIndex === 10) useFlats = true; // Bb default
  else if (rootIndex === 11) useFlats = false;
  
  const rootName = useFlats ? flatNames[rootIndex] : noteNames[rootIndex];
  
  return { rootName, chordType };
}

// Test cases
const testChords = [
  { name: 'Cmaj7', voicing: [48, 52, 55, 59], expected: { rootName: 'C', chordType: 'maj7' } },
  { name: 'Dm7', voicing: [50, 53, 57, 60], expected: { rootName: 'D', chordType: 'm7' } },
  { name: 'G7', voicing: [55, 59, 62, 65], expected: { rootName: 'G', chordType: '7' } },
  { name: 'Am7', voicing: [57, 60, 64, 67], expected: { rootName: 'A', chordType: 'm7' } },
  { name: 'C minor', voicing: [48, 51, 55], expected: { rootName: 'C', chordType: 'minor' } },
  { name: 'C major', voicing: [48, 52, 55], expected: { rootName: 'C', chordType: 'major' } },
];

console.log('Testing chord inference logic...\n');

let passed = 0;
let failed = 0;

for (const test of testChords) {
  const inferred = inferChordFromMidi(test.voicing);
  
  if (inferred && inferred.rootName === test.expected.rootName && inferred.chordType === test.expected.chordType) {
    passed++;
    console.log(`${test.name}: ✓ Correct (${inferred.rootName} ${inferred.chordType})`);
  } else {
    failed++;
    console.log(`${test.name}: ✗ Incorrect`);
    console.log(`  Expected: ${test.expected.rootName} ${test.expected.chordType}`);
    console.log(`  Got: ${inferred ? `${inferred.rootName} ${inferred.chordType}` : 'null'}`);
    console.log(`  Voicing: [${test.voicing.join(', ')}]`);
  }
}

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

process.exit(failed > 0 ? 1 : 0);


