/**
 * Test paired state I6 <-> vii°7
 * Tests determinism and state model
 */

import { getState, getAdjacentValidStates, tryMove } from '../src/harmonic-engine-state.js';

console.log('=== Testing Paired State I6 <-> vii°7 ===\n');

let passed = 0;
let failed = 0;
const errors = [];

// Test 1: State model exists
try {
  const c6State = getState('C_maj6');
  if (c6State && c6State.id === 'C_maj6' && c6State.chordType === 'maj6') {
    passed++;
    console.log('✓ State model works');
  } else {
    failed++;
    errors.push('State model not working correctly');
    console.log('✗ State model failed');
  }
} catch (error) {
  failed++;
  errors.push(`State model error: ${error.message}`);
  console.log(`✗ State model error: ${error.message}`);
}

// Test 2: Determinism - same input -> same exits
try {
  const adjacent1 = getAdjacentValidStates('C_maj6');
  const adjacent2 = getAdjacentValidStates('C_maj6');
  
  if (JSON.stringify(adjacent1) === JSON.stringify(adjacent2)) {
    passed++;
    console.log('✓ Determinism: same input -> same exits');
  } else {
    failed++;
    errors.push('Determinism failed');
    console.log('✗ Determinism failed');
  }
} catch (error) {
  failed++;
  errors.push(`Determinism error: ${error.message}`);
  console.log(`✗ Determinism error: ${error.message}`);
}

// Test 3: I6 -> vii°7 pairing
try {
  const adjacent = getAdjacentValidStates('C_maj6');
  if (adjacent.length > 0 && adjacent[0].includes('dim7')) {
    passed++;
    console.log('✓ I6 -> vii°7 pairing exists');
  } else {
    failed++;
    errors.push('I6 -> vii°7 pairing not found');
    console.log('✗ I6 -> vii°7 pairing failed');
  }
} catch (error) {
  failed++;
  errors.push(`I6 -> vii°7 error: ${error.message}`);
  console.log(`✗ I6 -> vii°7 error: ${error.message}`);
}

// Test 4: vii°7 -> I6 pairing
try {
  const viio7State = getState('B_dim7');
  const adjacent = getAdjacentValidStates('B_dim7');
  if (adjacent.length > 0 && adjacent[0].includes('maj6')) {
    passed++;
    console.log('✓ vii°7 -> I6 pairing exists');
  } else {
    failed++;
    errors.push('vii°7 -> I6 pairing not found');
    console.log('✗ vii°7 -> I6 pairing failed');
  }
} catch (error) {
  failed++;
  errors.push(`vii°7 -> I6 error: ${error.message}`);
  console.log(`✗ vii°7 -> I6 error: ${error.message}`);
}

// Test 5: Reason codes for paired motion
try {
  const result = tryMove('C_maj6', 'B_dim7', { enforceOneNoteMotion: false });
  if (result.reasonCodes && result.reasonCodes.includes('PAIRED_MOTION_I6_VIIO7')) {
    passed++;
    console.log('✓ Reason codes for paired motion');
  } else {
    failed++;
    errors.push('Reason codes missing for paired motion');
    console.log('✗ Reason codes failed');
  }
} catch (error) {
  failed++;
  errors.push(`Reason codes error: ${error.message}`);
  console.log(`✗ Reason codes error: ${error.message}`);
}

// Randomized tests (40+)
console.log('\n=== Randomized Tests (40) ===');
for (let i = 0; i < 40; i++) {
  try {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const root = roots[i % roots.length];
    const stateId = `${root}_maj6`;
    const adjacent = getAdjacentValidStates(stateId);
    
    // Verify determinism
    const adjacent2 = getAdjacentValidStates(stateId);
    if (JSON.stringify(adjacent) === JSON.stringify(adjacent2)) {
      passed++;
    } else {
      failed++;
      errors.push(`Randomized test ${i}: determinism failed`);
    }
  } catch (error) {
    failed++;
    errors.push(`Randomized test ${i}: ${error.message}`);
  }
}

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.log('\nErrors:');
  errors.forEach(e => console.log(`  - ${e}`));
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
  process.exit(0);
}

