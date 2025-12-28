/**
 * Integration Example: Connecting Barry Engine → Projection Layer → UI
 * 
 * This demonstrates the complete flow:
 * 1. Call Barry engine to get evaluated voicings
 * 2. Project those voicings onto the fretboard
 * 3. Render the result in the UI
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';
import { FretboardUI } from '../src/fretboard-ui-v0.1.js';
import { createBarryClient } from '../src/barryClient.js';

/**
 * Main integration function
 */
async function runIntegration() {
  // Step 1: Create Barry client
  // For development/testing, use 'mock' transport
  // For production, use 'import' or 'http' with proper configuration
  const barryClient = createBarryClient({
    transport: 'mock', // Change to 'import' or 'http' for real Barry engine
    // enginePath: '../grand-criteria-of-excellence-jazz/src/index.js', // Example path
    // apiUrl: 'https://api.barry-engine.example.com', // Example API URL
  });

  // Step 2: Prepare context for Barry engine
  const barryContext = {
    keyRoot: 'C',
    mode: 'major',
    chordSymbols: ['Cmaj7', 'Dm7', 'G7', 'Cmaj7'],
    options: {
      registerPreference: 'mid',
      style: 'barry-harris',
    },
  };

  // Step 3: Get evaluated voicings from Barry engine
  let engineOutputs;
  try {
    engineOutputs = await barryClient.getEvaluatedVoicings(barryContext);
    console.log('Barry engine returned', engineOutputs.length, 'voicings');
  } catch (error) {
    console.error('Failed to get voicings from Barry engine:', error);
    // Fallback to mock data for demonstration
    engineOutputs = [
      {
        voicing: [48, 52, 55, 59], // Cmaj7
        inversion: 'root',
        registerPosition: 'mid',
        hold: false,
        reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION', message: 'Barry Harris inversion' }]
      },
      {
        voicing: [50, 53, 57, 60], // Dm7
        inversion: 'root',
        registerPosition: 'mid',
        hold: false,
        reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION', message: 'Barry Harris inversion' }]
      },
      {
        voicing: [55, 59, 62, 65], // G7
        inversion: 'root',
        registerPosition: 'mid',
        hold: false,
        reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION', message: 'Barry Harris inversion' }]
      },
      {
        voicing: [48, 52, 55, 59], // Cmaj7 (same as first)
        inversion: 'root',
        registerPosition: 'mid',
        hold: true,
        reasonCodes: [{ code: 'HOLD_VALID', message: 'Hold valid' }]
      }
    ];
    console.warn('Using fallback mock data');
  }

  // Step 4: Create projection layer
  const projection = new FretboardProjection();

  // Step 5: Project all voicings onto fretboard
  const projectionOutputs = engineOutputs.map(output => {
    return projection.project(output);
  });

  // Step 6: Create UI and load projection outputs
  const container = document.getElementById('fretboard-container');
  if (!container) {
    console.error('Container element not found');
    return;
  }

  const ui = new FretboardUI(container, {
    showBarNumber: true,
    showMovementType: true,
    showReasonCodes: true
  });

  ui.loadBars(projectionOutputs);

  console.log('Integration complete. Projection outputs:', projectionOutputs);
  return { engineOutputs, projectionOutputs, ui };
}

// Run integration when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runIntegration);
  } else {
    runIntegration();
  }
} else {
  // Node.js environment
  runIntegration().catch(console.error);
}

// Export for use as module
export { runIntegration };




