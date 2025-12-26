/**
 * Integration Example: Connecting Projection Layer to UI
 * 
 * This shows how to use gml-fretboard-projection with fretboard-ui
 */

import { FretboardProjection } from '../src/fretboard-projection-v0.1.3.js';
import { FretboardUI } from '../src/fretboard-ui-v0.1.js';

// Simulate engine output (in real usage, this comes from gml-harmonic-engine)
const engineOutputs = [
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
      voicing: [55, 59, 62, 65], // G7: G-B-D-F (corrected)
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

// Step 1: Create projection layer
const projection = new FretboardProjection();

// Step 2: Project all voicings
const projectionOutputs = engineOutputs.map(output => {
  return projection.project(output);
});

// Step 3: Create UI and load projection outputs
const container = document.getElementById('fretboard-container');
const ui = new FretboardUI(container, {
  showBarNumber: true,
  showMovementType: true,
  showReasonCodes: true
});

ui.loadBars(projectionOutputs);

console.log('Integration complete. Projection outputs:', projectionOutputs);




