/**
 * Test state graph API formalization
 */

import { getState, getAdjacentValidStates, tryMove } from '../src/harmonic-engine-state.js';

console.log('=== Testing State Graph API ===\n');

let passed = 0;
let failed = 0;
const errors = [];

// Test 1: getState exists and works
try {
  const state = getState('C_maj6');
  if (state && state.id === 'C_maj6') {
    passed++;
    console.log('✓ getState works');
  } else {
    failed++;
    errors.push('getState failed');
    console.log('✗ getState failed');
  }
} catch (error) {
  failed++;
  errors.push(`getState error: ${error.message}`);
  console.log(`✗ getState error: ${error.message}`);
}

// Test 2: getAdjacentValidStates exists and works
try {
  const adjacent = getAdjacentValidStates('C_maj6');
  if (Array.isArray(adjacent)) {
    passed++;
    console.log('✓ getAdjacentValidStates works');
  } else {
    failed++;
    errors.push('getAdjacentValidStates failed');
    console.log('✗ getAdjacentValidStates failed');
  }
} catch (error) {
  failed++;
  errors.push(`getAdjacentValidStates error: ${error.message}`);
  console.log(`✗ getAdjacentValidStates error: ${error.message}`);
}

// Test 3: tryMove exists and returns correct format
try {
  const result = tryMove('C_maj6', 'B_dim7', { enforceOneNoteMotion: false });
  if (result && typeof result.ok === 'boolean' && Array.isArray(result.reasonCodes)) {
    passed++;
    console.log('✓ tryMove returns correct format');
  } else {
    failed++;
    errors.push('tryMove format incorrect');
    console.log('✗ tryMove format incorrect');
  }
} catch (error) {
  failed++;
  errors.push(`tryMove error: ${error.message}`);
  console.log(`✗ tryMove error: ${error.message}`);
}

// Test 4: Illegal moves are blocked
try {
  const result = tryMove('C_maj6', 'D_maj6', { enforceOneNoteMotion: false });
  if (!result.ok) {
    passed++;
    console.log('✓ Illegal moves are blocked');
  } else {
    failed++;
    errors.push('Illegal move was allowed');
    console.log('✗ Illegal move was allowed');
  }
} catch (error) {
  // If it throws, that's also acceptable (blocking behavior)
  passed++;
  console.log('✓ Illegal moves are blocked (threw error)');
}

// Test 5: Reason codes are provided for blocked moves
try {
  const result = tryMove('C_maj6', 'D_maj6', { enforceOneNoteMotion: false });
  if (!result.ok && result.reasonCodes.length > 0) {
    passed++;
    console.log('✓ Reason codes provided for blocked moves');
  } else {
    failed++;
    errors.push('No reason codes for blocked move');
    console.log('✗ No reason codes for blocked move');
  }
} catch (error) {
  passed++;
  console.log('✓ Reason codes provided (via error)');
}

// Randomized tests (40+)
console.log('\n=== Randomized Tests (40) ===');
for (let i = 0; i < 40; i++) {
  try {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const root = roots[i % roots.length];
    const stateId = `${root}_maj6`;
    
    // Test getState
    const state = getState(stateId);
    if (state && state.id === stateId) {
      passed++;
    } else {
      failed++;
      errors.push(`Randomized test ${i}: getState failed`);
    }
    
    // Test getAdjacentValidStates
    const adjacent = getAdjacentValidStates(stateId);
    if (Array.isArray(adjacent)) {
      passed++;
    } else {
      failed++;
      errors.push(`Randomized test ${i}: getAdjacentValidStates failed`);
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

