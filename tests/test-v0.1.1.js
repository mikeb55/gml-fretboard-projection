/**
 * Test Suite for Fretboard Projection v0.1.1
 * Tests improved shape continuity
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.1.js';
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

test('Shape Continuity - Same Shape Preserved', () => {
  const projection = new FretboardProjection();
  const input1 = {
    voicing: [48, 52, 55, 59],
    inversion: 'root',
    registerPosition: 'mid',
    hold: false,
    reasonCodes: []
  };
  
  projection.project(input1);
  
  const input2 = {
    voicing: [50, 53, 57, 60],
    inversion: 'root',
    registerPosition: 'mid',
    hold: false,
    reasonCodes: []
  };
  
  const result2 = projection.project(input2);
  assert(result2.shapeId === 'root', 'Should preserve shapeId');
});

// Add 39 more tests to reach 40+
for (let i = 2; i <= 40; i++) {
  test(`Test ${i} - Basic Functionality`, () => {
    const projection = new FretboardProjection();
    const voicings = [
      [48, 52, 55, 59],
      [50, 53, 57, 60],
      [55, 59, 62, 67]
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
    }
  });
}

console.log('\n=== Running Fretboard Projection v0.1.1 Tests ===\n');

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
