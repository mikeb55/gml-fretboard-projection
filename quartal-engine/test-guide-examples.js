/**
 * Test examples from the Dummies Guide
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');

const guideExamples = [
  // 3-note quartals - quarter notes
  { cmd: 'Generate C major quartals, 4 bars, quarter notes', expected: { bars: 4, notes: 12, duration: 'quarter' } },
  { cmd: 'Generate D dorian quartals, 8 bars, quarter notes', expected: { bars: 8, notes: 24, duration: 'quarter' } },
  
  // 3-note quartals - half notes
  { cmd: 'Generate A minor quartals, 4 bars, half notes', expected: { bars: 4, notes: 12, duration: 'half' } },
  
  // 3-note quartals - eighth notes
  { cmd: 'Generate D dorian quartals, 8 bars, eighth notes', expected: { bars: 8, notes: 24, duration: 'eighth' } },
  { cmd: 'Generate E phrygian quartals, 4 bars, eighth notes', expected: { bars: 4, notes: 12, duration: 'eighth' } },
  
  // 3-note quartals - sixteenth notes
  { cmd: 'Generate G mixolydian quartals, 4 bars, sixteenth notes', expected: { bars: 4, notes: 12, duration: 'sixteenth' } },
  { cmd: 'Generate A minor quartals, 8 bars, 16th notes', expected: { bars: 8, notes: 24, duration: 'sixteenth' } },
  
  // 4-note quartals - quarter notes
  { cmd: 'Generate C major 4-note quartals, 4 bars, quarter notes', expected: { bars: 4, notes: 16, duration: 'quarter' } },
  { cmd: 'Generate E minor 4-note quartals, 8 bars, quarter notes', expected: { bars: 8, notes: 32, duration: 'quarter' } },
  
  // 4-note quartals - half notes
  { cmd: 'Generate F lydian 4-note quartals, 4 bars, half notes', expected: { bars: 4, notes: 16, duration: 'half' } },
  
  // 4-note quartals - eighth notes
  { cmd: 'Generate A minor 4-note quartals, 4 bars, eighth notes', expected: { bars: 4, notes: 16, duration: 'eighth' } },
  { cmd: 'Generate Bb major 4-note quartals, 8 bars, eighth notes', expected: { bars: 8, notes: 32, duration: 'eighth' } },
  
  // 4-note quartals - sixteenth notes
  { cmd: 'Generate C# locrian 4-note quartals, 4 bars, 16th notes', expected: { bars: 4, notes: 16, duration: 'sixteenth' } },
  
  // Full scale harmonization
  { cmd: 'Generate a musicxml of the E minor scale harmonised as quartals', expected: { bars: 7, notes: 21, duration: 'quarter' } },
  { cmd: 'Generate a musicxml of the D dorian scale harmonised as 4-note quartals', expected: { bars: 7, notes: 28, duration: 'quarter' } },
];

console.log('Testing examples from the Dummies Guide:\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

guideExamples.forEach((example, i) => {
  try {
    const params = parseCommand(example.cmd);
    const xml = generateMusicXML(params);
    
    const notes = (xml.match(/<note>/g) || []).length;
    const measures = (xml.match(/<measure number=/g) || []).length;
    const chords = (xml.match(/<chord\/>/g) || []).length;
    
    const stackType = params.stackType === '3-note' ? 3 : 4;
    const expectedNotes = example.expected.bars * stackType;
    const expectedChords = example.expected.bars * (stackType - 1); // Each chord has stackType-1 chord tags
    
    const durationMatch = params.noteValue === example.expected.duration;
    const barsMatch = measures === example.expected.bars;
    const notesMatch = notes === expectedNotes;
    const chordsMatch = chords === expectedChords;
    
    const allMatch = durationMatch && barsMatch && notesMatch && chordsMatch;
    
    if (allMatch) {
      console.log(`✓ Example ${i + 1}: ${example.cmd.substring(0, 60)}...`);
      passed++;
    } else {
      console.log(`✗ Example ${i + 1}: ${example.cmd.substring(0, 60)}...`);
      console.log(`  Expected: ${example.expected.bars} bars, ${expectedNotes} notes, ${expectedChords} chords, ${example.expected.duration}`);
      console.log(`  Got: ${measures} bars, ${notes} notes, ${chords} chords, ${params.noteValue}`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Example ${i + 1}: ERROR - ${e.message}`);
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(80));

if (failed === 0) {
  console.log('\n✅ All guide examples work correctly!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} example(s) failed`);
  process.exit(1);
}


