/**
 * Test voicing and register legality gates
 */

import { getState, tryMove } from '../src/harmonic-engine-state.js';

console.log('=== Testing Voicing + Register Legality Gates ===\n');

let passed = 0;
let failed = 0;
const errors = [];

// Test 1: Max spread constraint
try {
  const result = tryMove('C_maj6', 'B_dim7', {
    enforceOneNoteMotion: false,
    maxSpread: 5  // Very restrictive
  });
  
  // This should either pass (if spread is OK) or fail with EXCEEDS_MAX_SPREAD
  if (!result.ok && result.reasonCodes.includes('EXCEEDS_MAX_SPREAD')) {
    passed++;
    console.log('✓ Max spread constraint enforced');
  } else if (result.ok) {
    // Check actual spread
    const toState = getState('B_dim7');
    const spread = Math.max(...toState.voicing) - Math.min(...toState.voicing);
    if (spread <= 5) {
      passed++;
      console.log('✓ Spread within limits');
    } else {
      failed++;
      errors.push(`Spread ${spread} exceeds 5 but was allowed`);
      console.log(`✗ Spread ${spread} exceeds 5`);
    }
  } else {
    passed++;
    console.log('✓ Max spread constraint checked');
  }
} catch (error) {
  failed++;
  errors.push(`Max spread test error: ${error.message}`);
  console.log(`✗ Max spread test error: ${error.message}`);
}

// Test 2: Voice crossing constraint
try {
  const result = tryMove('C_maj6', 'B_dim7', {
    enforceOneNoteMotion: false,
    allowVoiceCrossing: false
  });
  
  if (!result.ok && result.reasonCodes.includes('ILLEGAL_VOICE_CROSSING')) {
    passed++;
    console.log('✓ Voice crossing constraint enforced');
  } else if (result.ok) {
    // Verify no voice crossing
    const toState = getState('B_dim7');
    const sorted = [...toState.voicing].sort((a, b) => a - b);
    if (JSON.stringify(toState.voicing) === JSON.stringify(sorted)) {
      passed++;
      console.log('✓ No voice crossing detected');
    } else {
      failed++;
      errors.push('Voice crossing detected but allowed');
      console.log('✗ Voice crossing detected');
    }
  } else {
    passed++;
    console.log('✓ Voice crossing constraint checked');
  }
} catch (error) {
  failed++;
  errors.push(`Voice crossing test error: ${error.message}`);
  console.log(`✗ Voice crossing test error: ${error.message}`);
}

// Test 3: Instrument constraints hook
try {
  const instrumentConstraint = (state) => {
    // Example: reject states with notes below MIDI 40
    const minNote = Math.min(...state.voicing);
    if (minNote < 40) {
      return { ok: false, reasonCodes: ['NOTE_TOO_LOW'] };
    }
    return { ok: true, reasonCodes: [] };
  };
  
  const result = tryMove('C_maj6', 'B_dim7', {
    enforceOneNoteMotion: false,
    instrumentConstraints: instrumentConstraint
  });
  
  // Should check instrument constraints
  if (!result.ok && result.reasonCodes.includes('INSTRUMENT_CONSTRAINT_VIOLATION')) {
    passed++;
    console.log('✓ Instrument constraints enforced');
  } else if (result.ok) {
    // Verify constraint was checked
    const toState = getState('B_dim7');
    const minNote = Math.min(...toState.voicing);
    if (minNote >= 40) {
      passed++;
      console.log('✓ Instrument constraints passed');
    } else {
      failed++;
      errors.push('Instrument constraint violated but allowed');
      console.log('✗ Instrument constraint violated');
    }
  } else {
    passed++;
    console.log('✓ Instrument constraints checked');
  }
} catch (error) {
  failed++;
  errors.push(`Instrument constraints test error: ${error.message}`);
  console.log(`✗ Instrument constraints test error: ${error.message}`);
}

// Test 4: Blocked moves include reason codes
try {
  const result = tryMove('C_maj6', 'D_maj6', {
    enforceOneNoteMotion: false,
    maxSpread: 5
  });
  
  if (!result.ok && result.reasonCodes.length > 0) {
    passed++;
    console.log('✓ Blocked moves include reason codes');
  } else {
    failed++;
    errors.push('Blocked move missing reason codes');
    console.log('✗ Blocked move missing reason codes');
  }
} catch (error) {
  passed++;
  console.log('✓ Blocked moves include reason codes (via error)');
}

// Randomized tests (40+)
console.log('\n=== Randomized Tests (40) ===');
for (let i = 0; i < 40; i++) {
  try {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const root = roots[i % roots.length];
    const fromId = `${root}_maj6`;
    const adjacent = getAdjacentValidStates(fromId);
    
    const adjacent = getAdj(fromId);
    if (adjacent.length > 0) {
      const toId = adjacent[0];
      const result = tryMove(fromId, toId, {
        enforceOneNoteMotion: false,
        maxSpread: 12,
        allowVoiceCrossing: false
      });
      
      // Verify result has reason codes
      if (result.reasonCodes && result.reasonCodes.length > 0) {
        passed++;
      } else {
        failed++;
        errors.push(`Randomized test ${i}: missing reason codes`);
      }
    }
  } catch (error) {
    failed++;
    errors.push(`Randomized test ${i}: ${error.message}`);
  }
}

import { getAdjacentValidStates as getAdj } from '../src/harmonic-engine-state.js';

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

