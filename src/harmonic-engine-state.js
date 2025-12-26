/**
 * Harmonic Engine State System
 * Implements state graph for Barry Harris Foundations 0 compliance
 */

import { spellChord } from './chord-spelling.js';
import { parseChordSymbol } from './chord-symbol-parser.js';
import { ReasonCodes } from './tonic-normalization.js';

// State structure: { id, chordType, root, voicing, stable }
const states = new Map();

// Reason codes for state transitions
export const StateReasonCodes = {
  PAIRED_MOTION_I6_VIIO7: 'PAIRED_MOTION_I6_VIIO7',
  ONE_NOTE_MOTION: 'ONE_NOTE_MOTION',
  ILLEGAL_MULTI_VOICE_MOTION: 'ILLEGAL_MULTI_VOICE_MOTION',
  ILLEGAL_VOICE_CROSSING: 'ILLEGAL_VOICE_CROSSING',
  EXCEEDS_MAX_SPREAD: 'EXCEEDS_MAX_SPREAD',
  INSTRUMENT_CONSTRAINT_VIOLATION: 'INSTRUMENT_CONSTRAINT_VIOLATION',
  VALID_TRANSITION: 'VALID_TRANSITION'
};

/**
 * Create a state ID from chord information
 */
function createStateId(root, chordType) {
  return `${root}_${chordType}`;
}

/**
 * Get or create a state
 * @param {string} root - Root note (e.g., "C")
 * @param {string} chordType - Chord type (e.g., "maj6", "dim7")
 * @returns {object} State object
 */
export function getState(id) {
  if (states.has(id)) {
    return states.get(id);
  }
  
  // Parse state ID (format: "C_maj6")
  const [root, chordType] = id.split('_');
  if (!root || !chordType) {
    throw new Error(`Invalid state ID: ${id}`);
  }
  
  // Get voicing
  const voicing = parseChordSymbol(`${root}${chordType === 'maj6' ? '6' : chordType === 'dim7' ? 'dim7' : chordType}`);
  
  const state = {
    id,
    root,
    chordType,
    voicing: Array.isArray(voicing) ? voicing : voicing.voicing,
    stable: chordType === 'maj6' || chordType === 'dim7'
  };
  
  states.set(id, state);
  return state;
}

/**
 * Get adjacent valid states for a given state
 * For v0.2: I6 <-> vii°7 pairing
 * @param {string} stateId - Current state ID
 * @returns {string[]} Array of valid adjacent state IDs
 */
export function getAdjacentValidStates(stateId) {
  const state = getState(stateId);
  const adjacent = [];
  
  // For v0.2: I6 <-> vii°7 pairing
  if (state.chordType === 'maj6') {
    // I6 can go to vii°7 (diminished 7th on leading tone)
    const rootNote = state.root;
    const leadingTone = getLeadingTone(rootNote);
    const viio7Id = createStateId(leadingTone, 'dim7');
    adjacent.push(viio7Id);
  } else if (state.chordType === 'dim7') {
    // vii°7 can go back to I6
    const rootNote = state.root;
    const tonic = getTonicFromLeadingTone(rootNote);
    const i6Id = createStateId(tonic, 'maj6');
    adjacent.push(i6Id);
  }
  
  return adjacent;
}

/**
 * Get leading tone from root (for I6 -> vii°7)
 */
function getLeadingTone(root) {
  const noteMap = {
    'C': 'B', 'D': 'C♯', 'E': 'D♯', 'F': 'E', 'G': 'F♯', 'A': 'G♯', 'B': 'A♯',
    'C♯': 'B♯', 'D♯': 'C𝄪', 'F♯': 'E♯', 'G♯': 'F𝄪', 'A♯': 'G𝄪',
    'D♭': 'C', 'E♭': 'D', 'G♭': 'F', 'A♭': 'G', 'B♭': 'A'
  };
  return noteMap[root] || 'B';
}

/**
 * Get tonic from leading tone (for vii°7 -> I6)
 */
function getTonicFromLeadingTone(leadingTone) {
  const reverseMap = {
    'B': 'C', 'C♯': 'D', 'D♯': 'E', 'E': 'F', 'F♯': 'G', 'G♯': 'A', 'A♯': 'B',
    'B♯': 'C♯', 'C𝄪': 'D♯', 'E♯': 'F♯', 'F𝄪': 'G♯', 'G𝄪': 'A♯',
    'C': 'D♭', 'D': 'E♭', 'F': 'G♭', 'G': 'A♭', 'A': 'B♭'
  };
  return reverseMap[leadingTone] || 'C';
}

/**
 * Try to move from one state to another
 * @param {string} fromId - Source state ID
 * @param {string} toId - Target state ID
 * @param {object} options - Options for voiceleading constraints
 * @returns {{ok: boolean, reasonCodes: string[]}} Result of move attempt
 */
export function tryMove(fromId, toId, options = {}) {
  const {
    enforceOneNoteMotion = true,
    maxSpread = 12,
    allowVoiceCrossing = false,
    instrumentConstraints = null
  } = options;
  
  const fromState = getState(fromId);
  const toState = getState(toId);
  const reasonCodes = [];
  
  // Check if target is in adjacent valid states
  const validAdjacent = getAdjacentValidStates(fromId);
  if (!validAdjacent.includes(toId)) {
    return {
      ok: false,
      reasonCodes: [`State ${toId} is not a valid adjacent state to ${fromId}`]
    };
  }
  
  // For v0.3+: Check one-note motion
  if (enforceOneNoteMotion) {
    const voiceChanges = countVoiceChanges(fromState.voicing, toState.voicing);
    if (voiceChanges !== 1) {
      return {
        ok: false,
        reasonCodes: [
          StateReasonCodes.ILLEGAL_MULTI_VOICE_MOTION,
          `Expected exactly 1 voice to move, found ${voiceChanges}`
        ]
      };
    }
    reasonCodes.push(StateReasonCodes.ONE_NOTE_MOTION);
  }
  
  // For v0.5+: Check voicing constraints
  if (maxSpread) {
    const spread = calculateSpread(toState.voicing);
    if (spread > maxSpread) {
      return {
        ok: false,
        reasonCodes: [
          StateReasonCodes.EXCEEDS_MAX_SPREAD,
          `Spread ${spread} exceeds max ${maxSpread}`
        ]
      };
    }
  }
  
  if (!allowVoiceCrossing) {
    if (hasVoiceCrossing(toState.voicing)) {
      return {
        ok: false,
        reasonCodes: [
          StateReasonCodes.ILLEGAL_VOICE_CROSSING,
          'Voice crossing detected'
        ]
      };
    }
  }
  
  if (instrumentConstraints && typeof instrumentConstraints === 'function') {
    const constraintResult = instrumentConstraints(toState);
    if (!constraintResult.ok) {
      return {
        ok: false,
        reasonCodes: [
          StateReasonCodes.INSTRUMENT_CONSTRAINT_VIOLATION,
          ...constraintResult.reasonCodes
        ]
      };
    }
  }
  
  // Add paired motion reason code for I6 <-> vii°7
  if ((fromState.chordType === 'maj6' && toState.chordType === 'dim7') ||
      (fromState.chordType === 'dim7' && toState.chordType === 'maj6')) {
    reasonCodes.push(StateReasonCodes.PAIRED_MOTION_I6_VIIO7);
  }
  
  reasonCodes.push(StateReasonCodes.VALID_TRANSITION);
  
  return {
    ok: true,
    reasonCodes
  };
}

/**
 * Count how many voices change between two voicings
 */
function countVoiceChanges(voicing1, voicing2) {
  const set1 = new Set(voicing1);
  const set2 = new Set(voicing2);
  
  // Count notes that are in one but not the other
  let changes = 0;
  for (const note of set1) {
    if (!set2.has(note)) changes++;
  }
  for (const note of set2) {
    if (!set1.has(note)) changes++;
  }
  
  return changes;
}

/**
 * Calculate spread (max - min) of a voicing
 */
function calculateSpread(voicing) {
  if (voicing.length === 0) return 0;
  return Math.max(...voicing) - Math.min(...voicing);
}

/**
 * Check if voicing has voice crossing (simplified check)
 */
function hasVoiceCrossing(voicing) {
  // Simplified: check if notes are not in ascending order
  const sorted = [...voicing].sort((a, b) => a - b);
  return JSON.stringify(voicing) !== JSON.stringify(sorted);
}

