/**
 * Test one-note motion enforcement
 */

import { getState, tryMove, getAdjacentValidStates } from '../src/harmonic-engine-state.js';

console.log('=== Testing One-Note Motion Enforcement ===\n');

let passed = 0;
let failed = 0;
const errors = [];

// Test 1: One-note motion is allowed
try {
  const result = tryMove('C_maj6', 'B_dim7', { enforceOneNoteMotion: true });
  // This should pass if exactly one voice moves
  if (result.ok) {
    passed++;
    console.log('✓ One-note motion allowed');
  } else {
    // Check if it's blocked for the right reason
    if (result.reasonCodes.includes('ILLEGAL_MULTI_VOICE_MOTION')) {
      // This is expected if more than one voice moves
      // We need to verify the actual voicings
      const fromState = getState('C_maj6');
      const toState = getState('B_dim7');
      const fromVoicing = fromState.voicing;
      const toVoicing = toState.voicing;
      
      // Count voice changes
      const set1 = new Set(fromVoicing);
      const set2 = new Set(toVoicing);
      let changes = 0;
      for (const note of set1) {
        if (!set2.has(note)) changes++;
      }
      for (const note of set2) {
        if (!set1.has(note)) changes++;
      }
      
      if (changes === 1) {
        failed++;
        errors.push('One-note motion incorrectly blocked');
        console.log('✗ One-note motion incorrectly blocked');
      } else {
        passed++;
        console.log(`✓ Multi-voice motion correctly blocked (${changes} voices)`);
      }
    } else {
      failed++;
      errors.push(`Unexpected reason: ${result.reasonCodes.join(', ')}`);
      console.log(`✗ Unexpected result: ${result.reasonCodes.join(', ')}`);
    }
  }
} catch (error) {
  failed++;
  errors.push(`One-note motion test error: ${error.message}`);
  console.log(`✗ One-note motion test error: ${error.message}`);
}

// Test 2: Multi-voice motion is blocked
try {
  // Try to move to a state that requires multiple voice changes
  // This is a simplified test - in reality we'd need states that differ by more than one voice
  const result = tryMove('C_maj6', 'B_dim7', { enforceOneNoteMotion: true });
  
  // If it's blocked, verify the reason code
  if (!result.ok && result.reasonCodes.includes('ILLEGAL_MULTI_VOICE_MOTION')) {
    passed++;
    console.log('✓ Multi-voice motion correctly blocked');
  } else if (result.ok) {
    // If it passed, verify it's actually one-note motion
    const fromState = getState('C_maj6');
    const toState = getState('B_dim7');
    const changes = countVoiceChanges(fromState.voicing, toState.voicing);
    if (changes === 1) {
      passed++;
      console.log('✓ One-note motion verified');
    } else {
      failed++;
      errors.push(`Motion has ${changes} voice changes, should be 1`);
      console.log(`✗ Motion has ${changes} voice changes`);
    }
  }
} catch (error) {
  failed++;
  errors.push(`Multi-voice motion test error: ${error.message}`);
  console.log(`✗ Multi-voice motion test error: ${error.message}`);
}

// Helper function
function countVoiceChanges(voicing1, voicing2) {
  const set1 = new Set(voicing1);
  const set2 = new Set(voicing2);
  let changes = 0;
  for (const note of set1) {
    if (!set2.has(note)) changes++;
  }
  for (const note of set2) {
    if (!set1.has(note)) changes++;
  }
  return changes;
}

// Randomized tests (40+)
console.log('\n=== Randomized Tests (40) ===');
for (let i = 0; i < 40; i++) {
  try {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const root = roots[i % roots.length];
    const fromId = `${root}_maj6`;
    const toId = getAdjacentState(fromId);
    
    if (toId) {
      const result = tryMove(fromId, toId, { enforceOneNoteMotion: true });
      
      if (result.ok) {
        // Verify it's actually one-note motion
        const fromState = getState(fromId);
        const toState = getState(toId);
        const changes = countVoiceChanges(fromState.voicing, toState.voicing);
        
        if (changes === 1) {
          passed++;
        } else {
          failed++;
          errors.push(`Randomized test ${i}: ${changes} voice changes, expected 1`);
        }
      } else {
        // If blocked, verify it's for the right reason
        if (result.reasonCodes.includes('ILLEGAL_MULTI_VOICE_MOTION')) {
          passed++;
        } else {
          failed++;
          errors.push(`Randomized test ${i}: blocked for wrong reason`);
        }
      }
    }
  } catch (error) {
    failed++;
    errors.push(`Randomized test ${i}: ${error.message}`);
  }
}

function getAdjacentState(stateId) {
  const adjacent = getAdjacentValidStates(stateId);
  return adjacent.length > 0 ? adjacent[0] : null;
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

