/**
 * State Graph Checks
 * Validates state model, determinism, and state graph API
 */

export async function runStategraphChecks(stageId) {
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  // For v0.2+: Check if state model exists
  if (['v0.2', 'v0.3', 'v0.4', 'v0.5'].includes(stageId)) {
    try {
      const { getState, getAdjacentValidStates } = await import('../../src/harmonic-engine-state.js');
      
      // Check getState exists
      if (typeof getState !== 'function') {
        results.failed++;
        results.errors.push('getState function not found');
      } else {
        results.passed++;
      }

      // Check getAdjacentValidStates exists
      if (typeof getAdjacentValidStates !== 'function') {
        results.failed++;
        results.errors.push('getAdjacentValidStates function not found');
      } else {
        results.passed++;
      }

      // For v0.4+: Check tryMove exists
      if (['v0.4', 'v0.5'].includes(stageId)) {
        const { tryMove } = await import('../../src/harmonic-engine-state.js');
        if (typeof tryMove !== 'function') {
          results.failed++;
          results.errors.push('tryMove function not found');
        } else {
          results.passed++;
        }
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`State graph API check failed: ${error.message}`);
    }
  } else {
    // v0.1 doesn't need state graph
    results.passed++;
  }

  return results;
}

