/**
 * Baseline Audit Test Suite v0.1.0
 * Tests that demonstrate known bugs:
 * A) 4-bar ceiling issue
 * B) Always 6-4 voicing bias (string set [6,5,4,3] always preferred)
 * 
 * These tests are EXPECTED TO FAIL initially - they document the bugs we need to fix.
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';
import { parseChordProgression } from '../src/chord-symbol-parser.js';

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function test(name, fn) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    testsFailed++;
    failures.push({ name, error: error.message });
    console.error(`✗ ${name}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================================
// BUG A: 4-BAR CEILING TEST
// ============================================================

test('BUG A: Bar count must NOT be capped at 4 - 12-bar blues', () => {
  // Load a 12-bar blues progression
  const blues12 = 'C7 | C7 | C7 | C7 | F7 | F7 | C7 | C7 | G7 | F7 | C7 | C7';
  const parsed = parseChordProgression(blues12);
  
  assert(parsed.length === 12, `Expected 12 bars, got ${parsed.length}`);
  
  // Project all bars
  const projection = new FretboardProjection();
  const results = [];
  for (const chord of parsed) {
    results.push(projection.project({
      voicing: chord.voicing,
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: []
    }));
  }
  
  assert(results.length === 12, `Expected 12 projection results, got ${results.length}`);
  assert(results.length !== 4, 'CRITICAL: Results should NOT be exactly 4 bars');
});

test('BUG A: Bar count must NOT be capped at 4 - 32-bar AABA', () => {
  const aaba32 = 'C | Am | Dm | G7 | C | Am | Dm | G7 | F | F | C | C | Am | Am | Dm | G7 | C | Am | Dm | G7 | F | F | C | C | Am | Am | Dm | G7 | C | Am | Dm | G7';
  const parsed = parseChordProgression(aaba32);
  
  assert(parsed.length >= 30, `Expected at least 30 bars, got ${parsed.length}`);
  assert(parsed.length !== 4, 'CRITICAL: Should NOT be exactly 4 bars');
  
  const projection = new FretboardProjection();
  const results = [];
  for (const chord of parsed) {
    results.push(projection.project({
      voicing: chord.voicing,
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: []
    }));
  }
  
  assert(results.length === parsed.length, `Expected ${parsed.length} results, got ${results.length}`);
  assert(results.length !== 4, 'CRITICAL: Results should NOT be exactly 4 bars');
});

test('BUG A: Bar count must NOT default to 4 on empty or invalid input', () => {
  // Test that empty/invalid input doesn't silently default to 4
  const projection = new FretboardProjection();
  
  // Empty array should not produce 4 bars
  const emptyResults = [];
  assert(emptyResults.length !== 4 || emptyResults.length === 0, 
    'Empty results should be 0, not 4');
  
  // Single bar should not become 4
  const singleResult = projection.project({
    voicing: [48, 52, 55],
    inversion: 'root',
    registerPosition: 'mid',
    hold: false,
    reasonCodes: []
  });
  assert(singleResult !== null, 'Single bar should project successfully');
});

// ============================================================
// BUG B: ALWAYS 6-4 VOICING BIAS TEST
// ============================================================

test('BUG B: Voicing diversity - NOT always string set [6,5,4,3]', () => {
  const projection = new FretboardProjection();
  
  // Test with 100 random chord progressions
  const chordTypes = [
    [48, 52, 55],      // C major
    [50, 53, 57],      // D minor
    [52, 55, 59],      // E minor
    [53, 57, 60],      // F major
    [55, 59, 62],      // G major
    [57, 60, 64],      // A minor
    [59, 62, 65],      // B diminished
    [48, 52, 55, 59],  // Cmaj7
    [50, 53, 57, 60],  // Dm7
    [55, 59, 62, 65],  // G7
  ];
  
  const stringSets = [];
  for (let i = 0; i < 100; i++) {
    const chord = chordTypes[i % chordTypes.length];
    const result = projection.project({
      voicing: chord,
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: []
    });
    
    const stringSetKey = result.stringSet.join('-');
    if (!stringSets.includes(stringSetKey)) {
      stringSets.push(stringSetKey);
    }
  }
  
  // Should have at least 3 different string sets
  assert(stringSets.length >= 3, 
    `Expected at least 3 different string sets, got ${stringSets.length}: ${stringSets.join(', ')}`);
  
  // Should NOT always be [6,5,4,3]
  const always6543 = stringSets.every(ss => ss === '6-5-4-3' || ss.startsWith('6-5-4'));
  assert(!always6543, 
    `CRITICAL: All voicings use [6,5,4,3] or similar - no diversity! String sets: ${stringSets.join(', ')}`);
});

test('BUG B: Inversion distribution should not be degenerate', () => {
  const projection = new FretboardProjection();
  
  const inversions = [];
  for (let i = 0; i < 50; i++) {
    const result = projection.project({
      voicing: [48, 52, 55, 59], // Cmaj7
      inversion: i % 4 === 0 ? 'root' : i % 4 === 1 ? 'first' : i % 4 === 2 ? 'second' : 'third',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: []
    });
    
    inversions.push(result.shapeId);
  }
  
  // Count distribution
  const counts = {};
  inversions.forEach(inv => {
    counts[inv] = (counts[inv] || 0) + 1;
  });
  
  // Should not have 90%+ of one inversion
  const maxCount = Math.max(...Object.values(counts));
  const maxPercent = (maxCount / inversions.length) * 100;
  
  assert(maxPercent < 90, 
    `Inversion distribution is degenerate: ${maxPercent.toFixed(1)}% are ${Object.keys(counts).find(k => counts[k] === maxCount)}. Distribution: ${JSON.stringify(counts)}`);
});

test('BUG B: String set variety across different register positions', () => {
  const projection = new FretboardProjection();
  
  const lowResults = [];
  const midResults = [];
  const highResults = [];
  
  const testChord = [48, 52, 55, 59]; // Cmaj7
  
  for (let i = 0; i < 10; i++) {
    lowResults.push(projection.project({
      voicing: testChord,
      inversion: 'root',
      registerPosition: 'low',
      hold: false,
      reasonCodes: []
    }));
    
    midResults.push(projection.project({
      voicing: testChord,
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: []
    }));
    
    highResults.push(projection.project({
      voicing: testChord,
      inversion: 'root',
      registerPosition: 'high',
      hold: false,
      reasonCodes: []
    }));
  }
  
  const lowSets = new Set(lowResults.map(r => r.stringSet.join('-')));
  const midSets = new Set(midResults.map(r => r.stringSet.join('-')));
  const highSets = new Set(highResults.map(r => r.stringSet.join('-')));
  
  // Different registers should use different string sets
  assert(lowSets.size >= 1, `Low register should use at least 1 string set, got ${lowSets.size}`);
  assert(midSets.size >= 1, `Mid register should use at least 1 string set, got ${midSets.size}`);
  assert(highSets.size >= 1, `High register should use at least 1 string set, got ${highSets.size}`);
  
  // Low should prefer lower strings, high should prefer higher strings
  const lowAvg = Array.from(lowSets).map(ss => {
    const nums = ss.split('-').map(Number);
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  })[0];
  
  const highAvg = Array.from(highSets).map(ss => {
    const nums = ss.split('-').map(Number);
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  })[0];
  
  assert(lowAvg > highAvg, 
    `Low register (avg string ${lowAvg.toFixed(1)}) should use lower strings than high register (avg string ${highAvg.toFixed(1)})`);
});

// ============================================================
// SMOKE TEST: Integration test for bar loading
// ============================================================

test('Smoke: Load sample chord chart and confirm barCount is NOT capped at 4', () => {
  const sampleChart = 'Bb7 | Eb7 | F7 | Bb7 | Gm7 | Cm7 | F7 | Bb7 | Eb7 | Edim7 | G7 | F7 | Cm7 | F7 | Bb7 | Eb7';
  const parsed = parseChordProgression(sampleChart);
  
  // Build internal bars array
  const projection = new FretboardProjection();
  const bars = [];
  for (const chord of parsed) {
    bars.push(projection.project({
      voicing: chord.voicing,
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: []
    }));
  }
  
  const barCount = bars.length;
  
  assert(barCount > 4, `Bar count (${barCount}) should be > 4, not capped`);
  assert(barCount === parsed.length, `Bar count (${barCount}) should match parsed chords (${parsed.length})`);
  assert(barCount !== 4, 'CRITICAL: Bar count should NOT be exactly 4');
});

// ============================================================
// VOICING DIAGNOSTICS
// ============================================================

test('Voicing Diagnostics: Detect if voicing output is always same inversion/string set', () => {
  const projection = new FretboardProjection();
  
  const diverseChords = [
    [48, 52, 55],      // C major
    [50, 53, 57],      // D minor  
    [55, 59, 62],      // G major
    [57, 60, 64],      // A minor
    [48, 52, 55, 59],  // Cmaj7
    [50, 53, 57, 60],  // Dm7
    [55, 59, 62, 65],  // G7
  ];
  
  const stringSetCounts = {};
  const inversionCounts = {};
  
  for (const chord of diverseChords) {
    const result = projection.project({
      voicing: chord,
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: []
    });
    
    const ssKey = result.stringSet.join('-');
    stringSetCounts[ssKey] = (stringSetCounts[ssKey] || 0) + 1;
    inversionCounts[result.shapeId] = (inversionCounts[result.shapeId] || 0) + 1;
  }
  
  const stringSetVariety = Object.keys(stringSetCounts).length;
  const inversionVariety = Object.keys(inversionCounts).length;
  
  console.log(`  String set variety: ${stringSetVariety} unique sets`);
  console.log(`  Inversion variety: ${inversionVariety} unique inversions`);
  console.log(`  String set distribution:`, stringSetCounts);
  console.log(`  Inversion distribution:`, inversionCounts);
  
  // Fail if diversity is absent
  assert(stringSetVariety >= 2, 
    `Voicing diversity FAILED: Only ${stringSetVariety} unique string set(s). Expected at least 2.`);
  assert(inversionVariety >= 1, 
    `Inversion diversity FAILED: Only ${inversionVariety} unique inversion(s).`);
});

// ============================================================
// REPORT
// ============================================================

console.log('\n=== Baseline Audit Test Results ===');
console.log(`Tests run: ${testsRun}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (failures.length > 0) {
  console.log('\n=== Failures (Expected - These Document Known Bugs) ===');
  failures.forEach(f => {
    console.log(`  ✗ ${f.name}: ${f.error}`);
  });
}

if (testsFailed > 0) {
  console.log('\n⚠️  These failures document known bugs that need to be fixed in subsequent versions.');
  process.exit(1);
} else {
  console.log('\n✓ All baseline audit tests passed (bugs may already be fixed)');
  process.exit(0);
}


