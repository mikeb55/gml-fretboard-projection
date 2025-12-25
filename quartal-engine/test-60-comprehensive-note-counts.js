/**
 * Comprehensive test: 60 different 4-measure note combinations
 * Tests whole notes, quarter notes, eighth notes, and 16th notes
 * Validates that each bar has the correct number of notes based on duration
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');
const { DOMParser } = require('@xmldom/xmldom');

// Expected notes per bar based on duration (in 4/4 time):
// - Whole notes: 1 note per bar (fills entire bar)
// - Half notes: 2 notes per bar
// - Quarter notes: 4 notes per bar
// - Eighth notes: 8 notes per bar
// - 16th notes: 16 notes per bar

const scales = ['major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'locrian'];
const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#'];
const stackTypes = ['3-note', '4-note'];
const durations = [
  { name: 'whole', expectedPerBar: 1 },
  { name: 'half', expectedPerBar: 2 },
  { name: 'quarter', expectedPerBar: 4 },
  { name: 'eighth', expectedPerBar: 8 },
  { name: 'sixteenth', expectedPerBar: 16 }
];

// Generate 60 test cases
const testCases = [];
let testNum = 0;

// Test 1-15: 3-note quartals, different durations
for (let i = 0; i < 15 && testNum < 60; i++) {
  const root = roots[i % roots.length];
  const scale = scales[i % scales.length];
  const duration = durations[i % durations.length];
  const stackType = '3-note';
  const expectedNotesPerBar = duration.expectedPerBar * 3; // 3 notes per chord
  
  testCases.push({
    cmd: `Generate ${root} ${scale} quartals, 4 bars, ${duration.name} notes`,
    expectedBars: 4,
    expectedNotesPerBar,
    expectedTotalNotes: 4 * expectedNotesPerBar,
    stackType,
    duration: duration.name
  });
  testNum++;
}

// Test 16-30: 4-note quartals, different durations
for (let i = 0; i < 15 && testNum < 60; i++) {
  const root = roots[i % roots.length];
  const scale = scales[i % scales.length];
  const duration = durations[i % durations.length];
  const stackType = '4-note';
  const expectedNotesPerBar = duration.expectedPerBar * 4; // 4 notes per chord
  
  testCases.push({
    cmd: `Generate ${root} ${scale} 4-note quartals, 4 bars, ${duration.name} notes`,
    expectedBars: 4,
    expectedNotesPerBar,
    expectedTotalNotes: 4 * expectedNotesPerBar,
    stackType,
    duration: duration.name
  });
  testNum++;
}

// Test 31-45: Mixed scales with different durations (3-note)
for (let i = 0; i < 15 && testNum < 60; i++) {
  const root1 = roots[i % roots.length];
  const root2 = roots[(i + 1) % roots.length];
  const scale1 = scales[i % scales.length];
  const scale2 = scales[(i + 1) % scales.length];
  const duration = durations[i % durations.length];
  const stackType = '3-note';
  const expectedNotesPerBar = duration.expectedPerBar * 3;
  
  testCases.push({
    cmd: `Generate ${root1} ${scale1} bars 1-2, ${root2} ${scale2} bars 3-4, ${duration.name} notes`,
    expectedBars: 4,
    expectedNotesPerBar,
    expectedTotalNotes: 4 * expectedNotesPerBar,
    stackType,
    duration: duration.name
  });
  testNum++;
}

// Test 46-60: Mixed scales with different durations (4-note)
for (let i = 0; i < 15 && testNum < 60; i++) {
  const root1 = roots[i % roots.length];
  const root2 = roots[(i + 1) % roots.length];
  const scale1 = scales[i % scales.length];
  const scale2 = scales[(i + 1) % scales.length];
  const duration = durations[i % durations.length];
  const stackType = '4-note';
  const expectedNotesPerBar = duration.expectedPerBar * 4;
  
  testCases.push({
    cmd: `Generate ${root1} ${scale1} bars 1-2, ${root2} ${scale2} bars 3-4, 4-note quartals, ${duration.name} notes`,
    expectedBars: 4,
    expectedNotesPerBar,
    expectedTotalNotes: 4 * expectedNotesPerBar,
    stackType,
    duration: duration.name
  });
  testNum++;
}

console.log('Comprehensive Test: 60 different 4-measure note combinations\n');
console.log('Testing note counts per bar for: whole, half, quarter, eighth, 16th notes\n');
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
    
    // Check for parsing errors
    const parserError = doc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      throw new Error(`XML parsing error: ${parserError[0].textContent}`);
    }
    
    // Get all measures
    const measures = doc.getElementsByTagName('measure');
    const actualBars = measures.length;
    
    // Count notes per bar
    const notesPerBar = [];
    let totalNotes = 0;
    
    for (let barIdx = 0; barIdx < measures.length; barIdx++) {
      const measure = measures[barIdx];
      const notes = measure.getElementsByTagName('note');
      
      // Count all note elements (excluding forward elements)
      let noteCount = 0;
      for (let n = 0; n < notes.length; n++) {
        const note = notes[n];
        // Check if this note has a forward element (shouldn't happen, but check)
        const forward = note.getElementsByTagName('forward');
        if (forward.length === 0) {
          noteCount++;
        }
      }
      notesPerBar.push(noteCount);
      totalNotes += noteCount;
    }
    
    // Validate
    let allBarsCorrect = true;
    const incorrectBars = [];
    
    for (let barIdx = 0; barIdx < notesPerBar.length; barIdx++) {
      if (notesPerBar[barIdx] !== testCase.expectedNotesPerBar) {
        allBarsCorrect = false;
        incorrectBars.push({ 
          bar: barIdx + 1, 
          expected: testCase.expectedNotesPerBar, 
          actual: notesPerBar[barIdx] 
        });
      }
    }
    
    if (actualBars === testCase.expectedBars && 
        totalNotes === testCase.expectedTotalNotes && 
        allBarsCorrect) {
      passed++;
      if (i < 5 || i % 10 === 0) {
        console.log(`✓ Test ${i + 1}/${testCases.length}: ${testCase.duration} notes, ${testCase.stackType}`);
        console.log(`  Expected: ${testCase.expectedBars} bars, ${testCase.expectedNotesPerBar} notes/bar, ${testCase.expectedTotalNotes} total`);
        console.log(`  Got: ${actualBars} bars, ${notesPerBar[0]} notes/bar, ${totalNotes} total`);
      }
    } else {
      failed++;
      const errors = [];
      if (actualBars !== testCase.expectedBars) {
        errors.push(`Bars: expected ${testCase.expectedBars}, got ${actualBars}`);
      }
      if (totalNotes !== testCase.expectedTotalNotes) {
        errors.push(`Total notes: expected ${testCase.expectedTotalNotes}, got ${totalNotes}`);
      }
      if (!allBarsCorrect) {
        errors.push(`Incorrect bars: ${incorrectBars.map(b => `Bar ${b.bar} has ${b.actual} notes (expected ${b.expected})`).join(', ')}`);
      }
      failedTests.push({ 
        testCase, 
        errors, 
        actualBars, 
        totalNotes, 
        notesPerBar,
        cmd: testCase.cmd
      });
      console.log(`✗ Test ${i + 1}/${testCases.length}: ${testCase.duration} notes, ${testCase.stackType}`);
      console.log(`  Command: ${testCase.cmd.substring(0, 70)}...`);
      console.log(`  Errors: ${errors.join('; ')}`);
      console.log(`  Notes per bar: [${notesPerBar.join(', ')}]`);
    }
  } catch (error) {
    failed++;
    failedTests.push({ testCase, error: error.message, cmd: testCase.cmd });
    console.log(`✗ Test ${i + 1}/${testCases.length}: Error - ${error.message}`);
    console.log(`  Command: ${testCase.cmd.substring(0, 70)}...`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log('='.repeat(80));

if (failed > 0) {
  console.log('\nFailed tests (first 10):');
  failedTests.slice(0, 10).forEach((ft, i) => {
    console.log(`\n${i + 1}. ${ft.cmd.substring(0, 70)}...`);
    if (ft.error) {
      console.log(`   Error: ${ft.error}`);
    } else {
      console.log(`   Expected: ${ft.testCase.expectedBars} bars, ${ft.testCase.expectedNotesPerBar} notes per bar, ${ft.testCase.expectedTotalNotes} total`);
      console.log(`   Got: ${ft.actualBars} bars, notes per bar: [${ft.notesPerBar.join(', ')}], total: ${ft.totalNotes}`);
      if (ft.errors) {
        console.log(`   Errors: ${ft.errors.join('; ')}`);
      }
    }
  });
}

if (failed === 0) {
  console.log('\n✅ All 60 tests passed! Note counts per bar are correct for all durations.');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed`);
  process.exit(1);
}

