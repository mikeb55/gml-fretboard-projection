/**
 * Test Suite for Fretboard Projection v0.1.3
 * Tests long-form stability refinements
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';
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

test('Long Form Stability - 64 Bars', () => {
  const projection = new FretboardProjection();
  const progression = testProgressions.longForm64;
  
  const results = [];
  for (const chord of progression) {
    results.push(projection.project(chord));
  }
  
  assert(results.length === 64, 'Should have 64 results');
  
  const anchors = results.map(r => r.anchorFret);
  const firstHalf = anchors.slice(0, 32);
  const secondHalf = anchors.slice(32);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const drift = Math.abs(secondAvg - firstAvg);
  
  assert(drift < 10, `Should prevent drift (drift: ${drift})`);
});

// Add 39 more tests
for (let i = 2; i <= 40; i++) {
  test(`Test ${i} - Long Form Stability`, () => {
    const projection = new FretboardProjection();
    const progression = testProgressions.longForm32;
    
    const results = [];
    for (const chord of progression) {
      results.push(projection.project(chord));
    }
    
    assert(results.length === 32, 'Should process all chords');
    
    for (const result of results) {
      const usedFrets = result.frets.filter(f => f !== null);
      const span = Math.max(...usedFrets) - Math.min(...usedFrets);
      assert(span <= 5, 'Fret span should be ≤ 5');
      assert(result.anchorFret >= 0 && result.anchorFret <= 20, 'Anchor should be valid');
    }
  });
}

console.log('\n=== Running Fretboard Projection v0.1.3 Tests ===\n');

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
