/**
 * Tonic Normalization for Barry Harris Foundations 0 Compliance
 * 
 * When preferTonicMaj6 is enabled, in-key Imaj7 chords are normalized to MAJ6
 * for stable tonic-compatible structures.
 */

/**
 * Reason codes for tonic normalization
 */
export const ReasonCodes = {
  TONIC_MAJ6_HOME: 'TONIC_MAJ6_HOME',
  NORMALIZED_TONIC_MAJ7_TO_MAJ6: 'NORMALIZED_TONIC_MAJ7_TO_MAJ6'
};

/**
 * Normalize a chord if it's a tonic maj7 that should become maj6
 * @param {string} root - Root note name
 * @param {string} chordType - Current chord type
 * @param {string} keyRoot - Key root (e.g., "C" for C major)
 * @param {boolean} preferTonicMaj6 - Whether to prefer maj6 for tonic
 * @returns {{type: string, reasonCodes: string[]}} - Normalized type and reason codes
 */
export function normalizeTonicChord(root, chordType, keyRoot = null, preferTonicMaj6 = false) {
  const reasonCodes = [];
  
  if (!preferTonicMaj6) {
    return { type: chordType, reasonCodes };
  }
  
  // Check if this is a tonic maj7 that should be normalized to maj6
  // For now, we check if root matches keyRoot and chordType is maj7
  // In a full implementation, this would use roman numeral analysis
  if (chordType === 'maj7' && keyRoot && root === keyRoot) {
    reasonCodes.push(ReasonCodes.NORMALIZED_TONIC_MAJ7_TO_MAJ6);
    reasonCodes.push(ReasonCodes.TONIC_MAJ6_HOME);
    return { type: 'maj6', reasonCodes };
  }
  
  // If already maj6 and is tonic, add home reason code
  if (chordType === 'maj6' && keyRoot && root === keyRoot) {
    reasonCodes.push(ReasonCodes.TONIC_MAJ6_HOME);
    return { type: chordType, reasonCodes };
  }
  
  return { type: chordType, reasonCodes };
}

/**
 * Parse chord with tonic normalization
 * @param {string} chordSymbol - Chord symbol (e.g., "Cmaj7")
 * @param {string} keyRoot - Key root for tonic detection
 * @param {boolean} preferTonicMaj6 - Whether to normalize tonic maj7 to maj6
 * @returns {{root: string, type: string, originalType: string, reasonCodes: string[]}}
 */
export function parseChordWithNormalization(chordSymbol, keyRoot = null, preferTonicMaj6 = false) {
  // This would call the actual parser, but for now we return a structure
  // The actual integration will be in chord-symbol-parser.js
  return {
    root: null,
    type: null,
    originalType: null,
    reasonCodes: []
  };
}

