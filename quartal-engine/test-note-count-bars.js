/**
 * Test note count per bar - 30 different commands
 * Validates that each bar has the correct number of notes
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');
const { DOMParser } = require('@xmldom/xmldom');

// 30 test cases covering various scenarios
const testCases = [
  // Single scale, 3-note quartals
  { cmd: 'Generate C major quartals, 4 bars, quarter notes', expectedBars: 4, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate D dorian quartals, 8 bars, quarter notes', expectedBars: 8, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate E minor quartals, 7 bars, quarter notes', expectedBars: 7, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate F lydian quartals, 4 bars, half notes', expectedBars: 4, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate G mixolydian quartals, 6 bars, eighth notes', expectedBars: 6, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate A minor quartals, 4 bars, sixteenth notes', expectedBars: 4, expectedNotesPerBar: 3, stackType: '3-note' },
  
  // Single scale, 4-note quartals
  { cmd: 'Generate C major 4-note quartals, 4 bars, quarter notes', expectedBars: 4, expectedNotesPerBar: 4, stackType: '4-note' },
  { cmd: 'Generate D dorian 4-note quartals, 8 bars, quarter notes', expectedBars: 8, expectedNotesPerBar: 4, stackType: '4-note' },
  { cmd: 'Generate E minor 4-note quartals, 7 bars, half notes', expectedBars: 7, expectedNotesPerBar: 4, stackType: '4-note' },
  { cmd: 'Generate F lydian 4-note quartals, 4 bars, eighth notes', expectedBars: 4, expectedNotesPerBar: 4, stackType: '4-note' },
  
  // Multi-scale, 3-note quartals
  { cmd: 'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12', expectedBars: 12, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6', expectedBars: 6, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate C major bars 1-4, F lydian bars 5-8, quarter notes', expectedBars: 8, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate E minor bars 1-3, B locrian bars 4-6, F lydian bars 7-9, C major bars 10-12', expectedBars: 12, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate G mixolydian bars 1-2, D dorian bars 3-4, A minor bars 5-6, E phrygian bars 7-8, B locrian bars 9-10', expectedBars: 10, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate C major bars 1-8, F lydian bars 9-16', expectedBars: 16, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate D dorian bars 1-7, A minor bars 8-14', expectedBars: 14, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, eighth notes', expectedBars: 12, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12, half notes', expectedBars: 12, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate A minor bars 1-4, D dorian bars 5-8, G mixolydian bars 9-12, sixteenth notes', expectedBars: 12, expectedNotesPerBar: 3, stackType: '3-note' },
  
  // Multi-scale, 4-note quartals
  { cmd: 'Generate C major 4-note bars 1-4, F lydian 4-note bars 5-8', expectedBars: 8, expectedNotesPerBar: 4, stackType: '4-note' },
  { cmd: 'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6, 4-note quartals', expectedBars: 6, expectedNotesPerBar: 4, stackType: '4-note' },
  { cmd: 'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, 4-note quartals, sixteenth notes', expectedBars: 12, expectedNotesPerBar: 4, stackType: '4-note' },
  { cmd: 'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12, 4-note quartals, half notes', expectedBars: 12, expectedNotesPerBar: 4, stackType: '4-note' },
  
  // Parentheses format
  { cmd: 'Generate C major (4 bars), F lydian (4 bars), G mixolydian (4 bars)', expectedBars: 12, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate D dorian (2 bars), A minor (2 bars), E phrygian (2 bars)', expectedBars: 6, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate E minor (3 bars), B locrian (3 bars), F lydian (3 bars), C major (3 bars)', expectedBars: 12, expectedNotesPerBar: 3, stackType: '3-note' },
  
  // Dash format
  { cmd: 'Generate C major, F lydian, G mixolydian - 4 bars each', expectedBars: 12, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate D dorian, A minor, E phrygian - 2 bars each', expectedBars: 6, expectedNotesPerBar: 3, stackType: '3-note' },
  { cmd: 'Generate C major, F lydian, G mixolydian, Bb major, Eb phrygian - 4 bars each', expectedBars: 20, expectedNotesPerBar: 3, stackType: '3-note' },
];

console.log('Testing note count per bar - 30 different commands...\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;
const failedTests = [];

testCases.forEach((testCase, i) => {
  try {
    const params = parseCommand(testCase.cmd);
    const xml = generateMusicXML(params);
    
    // Parse XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    // Get all measures
    const measures = doc.getElementsByTagName('measure');
    const actualBars = measures.length;
    
    // Count notes per bar
    const notesPerBar = [];
    let totalNotes = 0;
    
    for (let barIdx = 0; barIdx < measures.length; barIdx++) {
      const measure = measures[barIdx];
      const notes = measure.getElementsByTagName('note');
      // Count only non-chord notes (first note of each chord) + chord notes
      // Actually, we should count all <note> elements, but exclude <forward> elements
      let noteCount = 0;
      for (let n = 0; n < notes.length; n++) {
        const note = notes[n];
        // Check if this is a forward/rest (shouldn't happen, but check)
        const forward = note.getElementsByTagName('forward');
        if (forward.length === 0) {
          noteCount++;
        }
      }
      notesPerBar.push(noteCount);
      totalNotes += noteCount;
    }
    
    // Validate
    const expectedTotalNotes = testCase.expectedBars * testCase.expectedNotesPerBar;
    let allBarsCorrect = true;
    const incorrectBars = [];
    
    for (let barIdx = 0; barIdx < notesPerBar.length; barIdx++) {
      if (notesPerBar[barIdx] !== testCase.expectedNotesPerBar) {
        allBarsCorrect = false;
        incorrectBars.push({ bar: barIdx + 1, expected: testCase.expectedNotesPerBar, actual: notesPerBar[barIdx] });
      }
    }
    
    if (actualBars === testCase.expectedBars && 
        totalNotes === expectedTotalNotes && 
        allBarsCorrect) {
      passed++;
      if (i < 5 || i % 5 === 0) {
        console.log(`✓ Test ${i + 1}: ${testCase.cmd.substring(0, 60)}...`);
        console.log(`  Bars: ${actualBars}, Notes per bar: ${testCase.expectedNotesPerBar}, Total: ${totalNotes}`);
      }
    } else {
      failed++;
      const errors = [];
      if (actualBars !== testCase.expectedBars) {
        errors.push(`Bars: expected ${testCase.expectedBars}, got ${actualBars}`);
      }
      if (totalNotes !== expectedTotalNotes) {
        errors.push(`Total notes: expected ${expectedTotalNotes}, got ${totalNotes}`);
      }
      if (!allBarsCorrect) {
        errors.push(`Incorrect bars: ${incorrectBars.map(b => `Bar ${b.bar} has ${b.actual} notes (expected ${b.expected})`).join(', ')}`);
      }
      failedTests.push({ testCase, errors, actualBars, totalNotes, notesPerBar });
      console.log(`✗ Test ${i + 1}: ${testCase.cmd.substring(0, 60)}...`);
      console.log(`  Errors: ${errors.join('; ')}`);
    }
  } catch (error) {
    failed++;
    failedTests.push({ testCase, error: error.message });
    console.log(`✗ Test ${i + 1}: Error - ${error.message}`);
    console.log(`  Command: ${testCase.cmd.substring(0, 60)}...`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log('='.repeat(80));

if (failed > 0) {
  console.log('\nFailed tests (first 10):');
  failedTests.slice(0, 10).forEach((ft, i) => {
    console.log(`\n${i + 1}. ${ft.testCase.cmd.substring(0, 70)}...`);
    if (ft.error) {
      console.log(`   Error: ${ft.error}`);
    } else {
      console.log(`   Expected: ${ft.testCase.expectedBars} bars, ${ft.testCase.expectedNotesPerBar} notes per bar`);
      console.log(`   Got: ${ft.actualBars} bars, notes per bar: [${ft.notesPerBar.join(', ')}]`);
      if (ft.errors) {
        console.log(`   Errors: ${ft.errors.join('; ')}`);
      }
    }
  });
}

if (failed === 0) {
  console.log('\n✅ All 30 tests passed! Note counts per bar are correct.');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed`);
  process.exit(1);
}

