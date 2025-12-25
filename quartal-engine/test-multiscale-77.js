/**
 * Comprehensive test suite: 77 challenging multi-scale commands
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');
const fs = require('fs');
const path = require('path');

// 77 challenging test cases covering various combinations
const testCases = [
  // Pattern 1: "X scale bars N-M" format (25 tests)
  { cmd: 'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12', desc: '3 scales, 4 bars each' },
  { cmd: 'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6', desc: '3 modes, 2 bars each' },
  { cmd: 'Generate C# locrian bars 1-3, F# lydian bars 4-6, Bb major bars 7-9', desc: '3 different keys, 3 bars each' },
  { cmd: 'Generate E minor bars 1-4, B locrian bars 5-8, F lydian bars 9-12, C major bars 13-16', desc: '4 scales, 4 bars each' },
  { cmd: 'Generate G mixolydian bars 1-2, D dorian bars 3-4, A minor bars 5-6, E phrygian bars 7-8, B locrian bars 9-10', desc: '5 scales, 2 bars each' },
  { cmd: 'Generate C major bars 1-8, F lydian bars 9-16', desc: '2 scales, 8 bars each' },
  { cmd: 'Generate D dorian bars 1-1, A minor bars 2-2, E phrygian bars 3-3', desc: '3 scales, 1 bar each' },
  { cmd: 'Generate C major bars 1-7, F lydian bars 8-14', desc: '2 scales, 7 bars each (full scales)' },
  { cmd: 'Generate Eb phrygian bars 1-4, Bb major bars 5-8, F lydian bars 9-12, quarter notes', desc: '3 scales with duration' },
  { cmd: 'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12, half notes', desc: '3 scales, half notes' },
  { cmd: 'Generate D dorian bars 1-4, G mixolydian bars 5-8, C major bars 9-12, eighth notes', desc: '3 scales, eighth notes' },
  { cmd: 'Generate A minor bars 1-4, D dorian bars 5-8, G mixolydian bars 9-12, sixteenth notes', desc: '3 scales, sixteenth notes' },
  { cmd: 'Generate C major 4-note bars 1-4, F lydian 4-note bars 5-8', desc: '2 scales, 4-note stacks' },
  { cmd: 'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6, 4-note quartals', desc: '3 scales, 4-note, 2 bars each' },
  { cmd: 'Generate C major bars 1-3, F lydian bars 4-6, G mixolydian bars 7-9, Bb major bars 10-12, Eb phrygian bars 13-15', desc: '5 scales, 3 bars each' },
  { cmd: 'Generate E minor bars 1-6, B locrian bars 7-12', desc: '2 scales, 6 bars each' },
  { cmd: 'Generate C major bars 1-5, F lydian bars 6-10, G mixolydian bars 11-15', desc: '3 scales, 5 bars each' },
  { cmd: 'Generate D dorian bars 1-4, A minor bars 5-8, E phrygian bars 9-12, B locrian bars 13-16, F# lydian bars 17-20', desc: '5 scales, 4 bars each' },
  { cmd: 'Generate C major bars 1-2, F lydian bars 3-4, G mixolydian bars 5-6, Bb major bars 7-8, Eb phrygian bars 9-10, quarter notes', desc: '5 scales, 2 bars each, quarter notes' },
  { cmd: 'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12, 4-note quartals, half notes', desc: '3 scales, 4-note, half notes' },
  { cmd: 'Generate D dorian bars 1-8, A minor bars 9-16, E phrygian bars 17-24', desc: '3 scales, 8 bars each' },
  { cmd: 'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, Bb major bars 13-16, Eb phrygian bars 17-20, eighth notes', desc: '5 scales, 4 bars each, eighth notes' },
  { cmd: 'Generate E minor bars 1-3, B locrian bars 4-6, F lydian bars 7-9, C major bars 10-12', desc: '4 scales, 3 bars each' },
  { cmd: 'Generate G mixolydian bars 1-7, D dorian bars 8-14', desc: '2 scales, 7 bars each (full scales)' },
  { cmd: 'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, 4-note quartals, sixteenth notes', desc: '3 scales, 4-note, sixteenth notes' },
  
  // Pattern 2: "X scale (N bars)" format (25 tests)
  { cmd: 'Generate C major (4 bars), F lydian (4 bars), G mixolydian (4 bars)', desc: '3 scales, parentheses format' },
  { cmd: 'Generate D dorian (2 bars), A minor (2 bars), E phrygian (2 bars)', desc: '3 modes, 2 bars each' },
  { cmd: 'Generate C# locrian (3 bars), F# lydian (3 bars), Bb major (3 bars)', desc: '3 keys, 3 bars each' },
  { cmd: 'Generate E minor (4 bars), B locrian (4 bars), F lydian (4 bars), C major (4 bars)', desc: '4 scales, 4 bars each' },
  { cmd: 'Generate G mixolydian (2 bars), D dorian (2 bars), A minor (2 bars), E phrygian (2 bars), B locrian (2 bars)', desc: '5 scales, 2 bars each' },
  { cmd: 'Generate C major (8 bars), F lydian (8 bars)', desc: '2 scales, 8 bars each' },
  { cmd: 'Generate D dorian (1 bar), A minor (1 bar), E phrygian (1 bar)', desc: '3 scales, 1 bar each' },
  { cmd: 'Generate C major (7 bars), F lydian (7 bars)', desc: '2 scales, 7 bars each (full scales)' },
  { cmd: 'Generate Eb phrygian (4 bars), Bb major (4 bars), F lydian (4 bars), quarter notes', desc: '3 scales with duration' },
  { cmd: 'Generate C# locrian (4 bars), F# lydian (4 bars), B major (4 bars), half notes', desc: '3 scales, half notes' },
  { cmd: 'Generate D dorian (4 bars), G mixolydian (4 bars), C major (4 bars), eighth notes', desc: '3 scales, eighth notes' },
  { cmd: 'Generate A minor (4 bars), D dorian (4 bars), G mixolydian (4 bars), sixteenth notes', desc: '3 scales, sixteenth notes' },
  { cmd: 'Generate C major 4-note (4 bars), F lydian 4-note (4 bars)', desc: '2 scales, 4-note stacks' },
  { cmd: 'Generate D dorian (2 bars), A minor (2 bars), E phrygian (2 bars), 4-note quartals', desc: '3 scales, 4-note, 2 bars each' },
  { cmd: 'Generate C major (3 bars), F lydian (3 bars), G mixolydian (3 bars), Bb major (3 bars), Eb phrygian (3 bars)', desc: '5 scales, 3 bars each' },
  { cmd: 'Generate E minor (6 bars), B locrian (6 bars)', desc: '2 scales, 6 bars each' },
  { cmd: 'Generate C major (5 bars), F lydian (5 bars), G mixolydian (5 bars)', desc: '3 scales, 5 bars each' },
  { cmd: 'Generate D dorian (4 bars), A minor (4 bars), E phrygian (4 bars), B locrian (4 bars), F# lydian (4 bars)', desc: '5 scales, 4 bars each' },
  { cmd: 'Generate C major (2 bars), F lydian (2 bars), G mixolydian (2 bars), Bb major (2 bars), Eb phrygian (2 bars), quarter notes', desc: '5 scales, 2 bars each, quarter notes' },
  { cmd: 'Generate C# locrian (4 bars), F# lydian (4 bars), B major (4 bars), 4-note quartals, half notes', desc: '3 scales, 4-note, half notes' },
  { cmd: 'Generate D dorian (8 bars), A minor (8 bars), E phrygian (8 bars)', desc: '3 scales, 8 bars each' },
  { cmd: 'Generate C major (4 bars), F lydian (4 bars), G mixolydian (4 bars), Bb major (4 bars), Eb phrygian (4 bars), eighth notes', desc: '5 scales, 4 bars each, eighth notes' },
  { cmd: 'Generate E minor (3 bars), B locrian (3 bars), F lydian (3 bars), C major (3 bars)', desc: '4 scales, 3 bars each' },
  { cmd: 'Generate G mixolydian (7 bars), D dorian (7 bars)', desc: '2 scales, 7 bars each (full scales)' },
  { cmd: 'Generate C major (4 bars), F lydian (4 bars), G mixolydian (4 bars), 4-note quartals, sixteenth notes', desc: '3 scales, 4-note, sixteenth notes' },
  
  // Pattern 3: "X scale, Y scale, Z scale - N bars each" format (27 tests)
  { cmd: 'Generate C major, F lydian, G mixolydian - 4 bars each', desc: '3 scales, dash format' },
  { cmd: 'Generate D dorian, A minor, E phrygian - 2 bars each', desc: '3 modes, 2 bars each' },
  { cmd: 'Generate C# locrian, F# lydian, Bb major - 3 bars each', desc: '3 keys, 3 bars each' },
  { cmd: 'Generate E minor, B locrian, F lydian, C major - 4 bars each', desc: '4 scales, 4 bars each' },
  { cmd: 'Generate G mixolydian, D dorian, A minor, E phrygian, B locrian - 2 bars each', desc: '5 scales, 2 bars each' },
  { cmd: 'Generate C major, F lydian - 8 bars each', desc: '2 scales, 8 bars each' },
  { cmd: 'Generate D dorian, A minor, E phrygian - 1 bar each', desc: '3 scales, 1 bar each' },
  { cmd: 'Generate C major, F lydian - 7 bars each', desc: '2 scales, 7 bars each (full scales)' },
  { cmd: 'Generate Eb phrygian, Bb major, F lydian - 4 bars each, quarter notes', desc: '3 scales with duration' },
  { cmd: 'Generate C# locrian, F# lydian, B major - 4 bars each, half notes', desc: '3 scales, half notes' },
  { cmd: 'Generate D dorian, G mixolydian, C major - 4 bars each, eighth notes', desc: '3 scales, eighth notes' },
  { cmd: 'Generate A minor, D dorian, G mixolydian - 4 bars each, sixteenth notes', desc: '3 scales, sixteenth notes' },
  { cmd: 'Generate C major 4-note, F lydian 4-note - 4 bars each', desc: '2 scales, 4-note stacks' },
  { cmd: 'Generate D dorian, A minor, E phrygian - 2 bars each, 4-note quartals', desc: '3 scales, 4-note, 2 bars each' },
  { cmd: 'Generate C major, F lydian, G mixolydian, Bb major, Eb phrygian - 3 bars each', desc: '5 scales, 3 bars each' },
  { cmd: 'Generate E minor, B locrian - 6 bars each', desc: '2 scales, 6 bars each' },
  { cmd: 'Generate C major, F lydian, G mixolydian - 5 bars each', desc: '3 scales, 5 bars each' },
  { cmd: 'Generate D dorian, A minor, E phrygian, B locrian, F# lydian - 4 bars each', desc: '5 scales, 4 bars each' },
  { cmd: 'Generate C major, F lydian, G mixolydian, Bb major, Eb phrygian - 2 bars each, quarter notes', desc: '5 scales, 2 bars each, quarter notes' },
  { cmd: 'Generate C# locrian, F# lydian, B major - 4 bars each, 4-note quartals, half notes', desc: '3 scales, 4-note, half notes' },
  { cmd: 'Generate D dorian, A minor, E phrygian - 8 bars each', desc: '3 scales, 8 bars each' },
  { cmd: 'Generate C major, F lydian, G mixolydian, Bb major, Eb phrygian - 4 bars each, eighth notes', desc: '5 scales, 4 bars each, eighth notes' },
  { cmd: 'Generate E minor, B locrian, F lydian, C major - 3 bars each', desc: '4 scales, 3 bars each' },
  { cmd: 'Generate G mixolydian, D dorian - 7 bars each', desc: '2 scales, 7 bars each (full scales)' },
  { cmd: 'Generate C major, F lydian, G mixolydian - 4 bars each, 4-note quartals, sixteenth notes', desc: '3 scales, 4-note, sixteenth notes' },
  { cmd: 'Generate C major, F lydian, G mixolydian, Bb major, Eb phrygian, A minor - 2 bars each', desc: '6 scales (edge case - should handle gracefully)' },
  { cmd: 'Generate D dorian, A minor - 12 bars each', desc: '2 scales, 12 bars each (long progression)' },
];

console.log('Testing 77 challenging multi-scale commands...\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;
const failedTests = [];
const challengingExamples = []; // For the guide

testCases.forEach((testCase, i) => {
  try {
    const params = parseCommand(testCase.cmd);
    
    if (!params.multiScale) {
      console.log(`✗ Test ${i + 1}: Multi-scale not detected`);
      console.log(`  Command: ${testCase.cmd.substring(0, 70)}...`);
      failed++;
      failedTests.push({ testCase, error: 'Multi-scale not detected' });
      return;
    }
    
    if (!params.segments || params.segments.length < 2) {
      console.log(`✗ Test ${i + 1}: Insufficient segments`);
      console.log(`  Command: ${testCase.cmd.substring(0, 70)}...`);
      failed++;
      failedTests.push({ testCase, error: 'Insufficient segments' });
      return;
    }
    
    const xml = generateMusicXML(params);
    
    // Validate XML
    const measures = (xml.match(/<measure number=/g) || []).length;
    const notes = (xml.match(/<note>/g) || []).length;
    const expectedBars = params.bars;
    const expectedNotes = expectedBars * (params.stackType === '3-note' ? 3 : 4);
    
    if (measures === expectedBars && notes === expectedNotes) {
      passed++;
      // Collect challenging examples (about 1/3 = 26 examples)
      if (challengingExamples.length < 26 && (
        params.segments.length >= 3 ||
        params.bars >= 12 ||
        params.noteValue !== 'quarter' ||
        params.stackType === '4-note'
      )) {
        challengingExamples.push({
          cmd: testCase.cmd,
          desc: testCase.desc,
          segments: params.segments.length,
          bars: params.bars,
          stackType: params.stackType,
          noteValue: params.noteValue
        });
      }
      
      if (i < 5 || i % 10 === 0) {
        console.log(`✓ Test ${i + 1}: ${testCase.desc}`);
        console.log(`  Segments: ${params.segments.length}, Bars: ${measures}, Notes: ${notes}`);
      }
    } else {
      console.log(`✗ Test ${i + 1}: Validation failed`);
      console.log(`  Expected: ${expectedBars} bars, ${expectedNotes} notes`);
      console.log(`  Got: ${measures} bars, ${notes} notes`);
      failed++;
      failedTests.push({ testCase, error: `Expected ${expectedBars} bars, got ${measures}` });
    }
  } catch (error) {
    console.log(`✗ Test ${i + 1}: Error - ${error.message}`);
    console.log(`  Command: ${testCase.cmd.substring(0, 70)}...`);
    failed++;
    failedTests.push({ testCase, error: error.message });
  }
});

console.log('\n' + '='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log('='.repeat(80));

if (failed > 0) {
  console.log('\nFailed tests:');
  failedTests.slice(0, 10).forEach((ft, i) => {
    console.log(`${i + 1}. ${ft.testCase.cmd.substring(0, 60)}...`);
    console.log(`   Error: ${ft.error}`);
  });
}

console.log(`\nChallenging examples collected: ${challengingExamples.length}`);

// Save challenging examples for guide
if (challengingExamples.length > 0) {
  const examplesFile = path.join(__dirname, 'challenging-multiscale-examples.json');
  fs.writeFileSync(examplesFile, JSON.stringify(challengingExamples, null, 2), 'utf8');
  console.log(`\nSaved ${challengingExamples.length} challenging examples to: ${examplesFile}`);
}

if (failed === 0) {
  console.log('\n✅ All 77 tests passed!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed`);
  process.exit(1);
}

