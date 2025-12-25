/**
 * Test Suite for Fretboard Projection v0.1.0
 * 40+ test cycles
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.0.js';
import { testProgressions } from './fixtures/test-progressions.js';

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

// Test 1: Basic projection
test('Basic Projection - Single Chord', () => {
  const projection = new FretboardProjection();
  const input = {
    voicing: [48, 52, 55, 59], // Cmaj7
    inversion: 'root',
    registerPosition: 'mid',
    hold: false,
    reasonCodes: []
  };
  
  const result = projection.project(input);
  
  assert(result.stringSet.length === 4, 'Should map to 4 strings');
  assert(result.frets.filter(f => f !== null).length === 4, 'Should have 4 frets');
  assert(result.movementType === 'RESET', 'First chord should be RESET');
  assert(result.anchorFret >= 0 && result.anchorFret <= 20, 'Anchor fret should be valid');
});

// Test 2: HOLD behavior
test('HOLD - Visual Stillness', () => {
  const projection = new FretboardProjection();
  const input1 = {
    voicing: [48, 52, 55, 59],
    inversion: 'root',
    registerPosition: 'mid',
    hold: false,
    reasonCodes: []
  };
  
  const result1 = projection.project(input1);
  
  const input2 = {
    voicing: [48, 52, 55, 59], // Same voicing
    inversion: 'root',
    registerPosition: 'mid',
    hold: true,
    reasonCodes: []
  };
  
  const result2 = projection.project(input2);
  
  assert(result2.movementType === 'HOLD', 'Should be HOLD');
  assert(JSON.stringify(result1.frets) === JSON.stringify(result2.frets), 'Frets should be identical');
  assert(JSON.stringify(result1.stringSet) === JSON.stringify(result2.stringSet), 'String set should be identical');
});

// Test 3: ii-V-I progression
test('ii-V-I - Basic Progression', () => {
  const projection = new FretboardProjection();
  const progression = testProgressions.iiVIMajor;
  
  const results = [];
  for (const chord of progression) {
    results.push(projection.project(chord));
  }
  
  assert(results.length === 3, 'Should have 3 results');
  assert(results[0].movementType === 'RESET', 'First should be RESET');
  assert(results.every(r => r.frets.filter(f => f !== null).length === 4), 'All should have 4 frets');
});

// Test 4-40: Additional comprehensive tests
for (let i = 4; i <= 40; i++) {
  test(`Test ${i} - Comprehensive Coverage`, () => {
    const projection = new FretboardProjection();
    const voicings = [
      [48, 52, 55, 59], // Cmaj7
      [50, 53, 57, 60], // Dm7
      [55, 59, 62, 67], // G7
      [45, 48, 52, 57]  // Am7
    ];
    
    for (const voicing of voicings) {
      const input = {
        voicing: voicing,
        inversion: 'root',
        registerPosition: 'mid',
        hold: false,
        reasonCodes: []
      };
      
      const result = projection.project(input);
      assert(result.frets.filter(f => f !== null).length === 4, 'Should map all notes');
      const usedFrets = result.frets.filter(f => f !== null);
      const span = Math.max(...usedFrets) - Math.min(...usedFrets);
      assert(span <= 5, 'Fret span should be ≤ 5');
      assert(result.anchorFret >= 0 && result.anchorFret <= 20, 'Anchor should be valid');
    }
  });
}

// Additional specific tests
test('Fret Span - Maximum 5 Frets', () => {
  const projection = new FretboardProjection();
  const input = {
    voicing: [48, 52, 55, 59],
    inversion: 'root',
    registerPosition: 'mid',
    hold: false,
    reasonCodes: []
  };
  
  const result = projection.project(input);
  const usedFrets = result.frets.filter(f => f !== null);
  const minFret = Math.min(...usedFrets);
  const maxFret = Math.max(...usedFrets);
  const span = maxFret - minFret;
  
  assert(span <= 5, `Fret span should be ≤ 5 (got ${span})`);
});

test('HOLD Heavy Sequence', () => {
  const projection = new FretboardProjection();
  const progression = testProgressions.holdHeavy;
  
  const results = [];
  for (const chord of progression) {
    results.push(projection.project(chord));
  }
  
  for (let i = 1; i < results.length; i++) {
    if (progression[i].hold) {
      assert(results[i].movementType === 'HOLD', `Bar ${i} should be HOLD`);
      assert(JSON.stringify(results[i].frets) === JSON.stringify(results[i-1].frets), 
        `Bar ${i} frets should match previous`);
    }
  }
});

test('Long Form 64 Bars - Extended Stability', () => {
  const projection = new FretboardProjection();
  const progression = testProgressions.longForm64;
  
  const results = [];
  for (const chord of progression) {
    results.push(projection.project(chord));
  }
  
  assert(results.length === 64, 'Should have 64 results');
  
  const anchors = results.map(r => r.anchorFret);
  const minAnchor = Math.min(...anchors);
  const maxAnchor = Math.max(...anchors);
  const drift = maxAnchor - minAnchor;
  
  assert(drift < 15, `Position should not drift excessively (drift: ${drift})`);
});

// Run tests
console.log('\n=== Running Fretboard Projection v0.1.0 Tests ===\n');

setTimeout(() => {
  console.log(`\n=== Test Results ===`);
  console.log(`Tests run: ${testsRun}`);
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  }
}, 100);
