/**
 * Bar Count Engine Test Suite v0.2.0
 * Tests that bar count matches chart length, no 4-bar default
 */

import { detectBarCountFromChart } from '../src/chart-bar-detector.js';
import { parseChordProgression } from '../src/chord-symbol-parser.js';
import { chartFixtures } from './fixtures/chart-fixtures.js';
import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';

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
// BAR COUNT DETECTION TESTS
// ============================================================

test('12-bar blues: Bar count matches expected', async () => {
  const fixture = chartFixtures.blues12;
  const parsed = parseChordProgression(fixture.text);
  
  assert(parsed.length === fixture.expectedBars, 
    `Expected ${fixture.expectedBars} bars, got ${parsed.length}`);
  assert(parsed.length !== 4, 'CRITICAL: Should NOT be exactly 4 bars');
  
  // Test projection
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
  
  assert(bars.length === fixture.expectedBars, 
    `Projected bars (${bars.length}) should match expected (${fixture.expectedBars})`);
  assert(bars.length !== 4, 'CRITICAL: Projected bars should NOT be exactly 4');
});

test('32-bar AABA: Bar count matches expected', async () => {
  const fixture = chartFixtures.aaba32;
  const parsed = parseChordProgression(fixture.text);
  
  assert(parsed.length >= 30, 
    `Expected at least 30 bars, got ${parsed.length}`);
  assert(parsed.length !== 4, 'CRITICAL: Should NOT be exactly 4 bars');
  
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
  
  assert(bars.length === parsed.length, 
    `Projected bars (${bars.length}) should match parsed (${parsed.length})`);
  assert(bars.length !== 4, 'CRITICAL: Projected bars should NOT be exactly 4');
});

test('8-bar short form: Bar count matches expected', async () => {
  const fixture = chartFixtures.short8;
  const parsed = parseChordProgression(fixture.text);
  
  assert(parsed.length === fixture.expectedBars, 
    `Expected ${fixture.expectedBars} bars, got ${parsed.length}`);
  
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
  
  assert(bars.length === fixture.expectedBars, 
    `Projected bars (${bars.length}) should match expected (${fixture.expectedBars})`);
});

test('16-bar form: Bar count matches expected', async () => {
  const fixture = chartFixtures.form16;
  const parsed = parseChordProgression(fixture.text);
  
  assert(parsed.length === fixture.expectedBars, 
    `Expected ${fixture.expectedBars} bars, got ${parsed.length}`);
  assert(parsed.length !== 4, 'CRITICAL: Should NOT be exactly 4 bars');
  
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
  
  assert(bars.length === fixture.expectedBars, 
    `Projected bars (${bars.length}) should match expected (${fixture.expectedBars})`);
});

test('24-bar form: Bar count matches expected', async () => {
  const fixture = chartFixtures.form24;
  const parsed = parseChordProgression(fixture.text);
  
  assert(parsed.length === fixture.expectedBars, 
    `Expected ${fixture.expectedBars} bars, got ${parsed.length}`);
  assert(parsed.length !== 4, 'CRITICAL: Should NOT be exactly 4 bars');
  
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
  
  assert(bars.length === fixture.expectedBars, 
    `Projected bars (${bars.length}) should match expected (${fixture.expectedBars})`);
});

// ============================================================
// NAVIGATION TESTS
// ============================================================

test('Navigation: Can reach final bar in 12-bar blues', () => {
  const fixture = chartFixtures.blues12;
  const parsed = parseChordProgression(fixture.text);
  
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
  
  const totalBars = bars.length;
  const finalBarIndex = totalBars - 1;
  
  assert(finalBarIndex >= 0, 'Final bar index should be >= 0');
  assert(finalBarIndex === 11, `Final bar index should be 11 for 12-bar blues, got ${finalBarIndex}`);
  assert(bars[finalBarIndex] !== undefined, 'Final bar should exist');
  assert(totalBars === 12, `Total bars should be 12, got ${totalBars}`);
});

test('Navigation: Can reach final bar in 32-bar AABA', () => {
  const fixture = chartFixtures.aaba32;
  const parsed = parseChordProgression(fixture.text);
  
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
  
  const totalBars = bars.length;
  const finalBarIndex = totalBars - 1;
  
  assert(finalBarIndex >= 30, `Final bar index should be >= 30 for 32-bar form, got ${finalBarIndex}`);
  assert(bars[finalBarIndex] !== undefined, 'Final bar should exist');
  assert(totalBars >= 30, `Total bars should be >= 30, got ${totalBars}`);
});

test('Navigation: No reset to bar 4', () => {
  const fixture = chartFixtures.blues12;
  const parsed = parseChordProgression(fixture.text);
  
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
  
  // Check that bar 4 is not special
  assert(bars.length > 4, `Should have more than 4 bars, got ${bars.length}`);
  
  // Check that we can navigate past bar 4
  for (let i = 0; i < bars.length; i++) {
    assert(bars[i] !== undefined, `Bar ${i} should exist`);
    if (i > 4) {
      assert(bars[i] !== null, `Bar ${i} (past bar 4) should not be null`);
    }
  }
});

// ============================================================
// NO 4-BAR DEFAULT TESTS
// ============================================================

test('No 4-bar default: Empty input does not default to 4', () => {
  const parsed = parseChordProgression('');
  
  assert(parsed.length === 0, `Empty input should produce 0 bars, got ${parsed.length}`);
  assert(parsed.length !== 4, 'CRITICAL: Empty input should NOT default to 4 bars');
});

test('No 4-bar default: Invalid input does not default to 4', () => {
  const parsed = parseChordProgression('invalid | chord | symbols | here');
  
  // Should parse what it can, but not default to 4
  if (parsed.length > 0) {
    assert(parsed.length !== 4 || parsed.length === 0, 
      `Invalid input should not default to exactly 4 bars, got ${parsed.length}`);
  }
});

test('No 4-bar default: Single bar does not become 4', () => {
  const parsed = parseChordProgression('C');
  
  assert(parsed.length === 1, `Single chord should produce 1 bar, got ${parsed.length}`);
  assert(parsed.length !== 4, 'CRITICAL: Single bar should NOT become 4 bars');
});

// ============================================================
// REPORT
// ============================================================

console.log('\n=== Bar Count Engine Test Results ===');
console.log(`Tests run: ${testsRun}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (failures.length > 0) {
  console.log('\n=== Failures ===');
  failures.forEach(f => {
    console.log(`  ✗ ${f.name}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✓ All bar count engine tests passed');
  process.exit(0);
}


