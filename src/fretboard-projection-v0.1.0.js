/**
 * Fretboard Projection Layer v0.1.0
 * Baseline projection - maps voicings to guitar strings and frets
 * 
 * This layer NEVER decides harmony.
 * This layer NEVER alters voicings.
 * This layer ONLY decides WHERE notes appear on the fretboard.
 */

/**
 * Standard guitar tuning (EADGBE)
 * String 6 (low E) = MIDI 40 (E2)
 * String 5 (A) = MIDI 45 (A2)
 * String 4 (D) = MIDI 50 (D3)
 * String 3 (G) = MIDI 55 (G3)
 * String 2 (B) = MIDI 59 (B3)
 * String 1 (high E) = MIDI 64 (E4)
 */
const GUITAR_TUNING = [40, 45, 50, 55, 59, 64];
const MAX_FRET = 20; // Reasonable upper limit
const MAX_FRET_SPAN = 5; // Maximum span between lowest and highest fret

export class FretboardProjection {
  constructor(options = {}) {
    this.version = '0.1.0';
    this.tuning = options.tuning || GUITAR_TUNING;
    this.maxFret = options.maxFret || MAX_FRET;
    this.maxFretSpan = options.maxFretSpan || MAX_FRET_SPAN;
    
    // State tracking
    this.previousMapping = null;
    this.positionWindow = null; // [minFret, maxFret]
    this.currentStringSet = null;
    this.currentShapeId = null;
  }

  /**
   * Project a voicing onto the fretboard
   * @param {Object} input - Engine output for a single chord
   * @param {Array<number>} input.voicing - Ordered MIDI note numbers
   * @param {string} input.inversion - Inversion type (used as shapeId)
   * @param {string} input.registerPosition - 'low', 'mid', 'high' (used as registerBand)
   * @param {boolean} input.hold - Whether to hold previous voicing
   * @param {Array} input.reasonCodes - Engine reason codes
   * @returns {Object} Projection result
   */
  project(input) {
    const { voicing, inversion, registerPosition, hold, reasonCodes } = input;

    // HOLD = VISUAL STILLNESS
    if (hold && this.previousMapping) {
      return {
        ...this.previousMapping,
        movementType: 'HOLD'
      };
    }

    // Check for register reset signal
    const needsReset = reasonCodes?.some(rc => rc.code === 'REGISTER_RESET') || false;

    // Generate mapping
    const mapping = this.generateMapping(voicing, inversion, registerPosition, needsReset);

    // Update state
    this.previousMapping = mapping;
    this.updatePositionWindow(mapping.anchorFret);
    this.currentStringSet = mapping.stringSet;
    this.currentShapeId = mapping.shapeId;

    return mapping;
  }

  /**
   * Generate fretboard mapping for a voicing
   */
  generateMapping(voicing, inversion, registerPosition, needsReset) {
    if (!voicing || voicing.length === 0) {
      throw new Error('Voicing cannot be empty');
    }

    // Determine shapeId from inversion
    const shapeId = inversion || 'root';

    // Determine registerBand from registerPosition
    const registerBand = registerPosition || 'mid';

    // If reset is needed, clear position window
    if (needsReset) {
      this.positionWindow = null;
    }

    // Try preferred string sets in order
    const preferredSets = [
      [6, 5, 4, 3], // Low strings
      [5, 4, 3, 2], // Mid-low strings
      [4, 3, 2, 1], // Mid-high strings
    ];

    // Try to maintain current string set if possible
    if (this.currentStringSet && this.canUseStringSet(voicing, this.currentStringSet)) {
      const mapping = this.mapToStrings(voicing, this.currentStringSet, shapeId, registerBand, needsReset);
      if (mapping) {
        return mapping;
      }
    }

    // Try preferred sets
    for (const stringSet of preferredSets) {
      const mapping = this.mapToStrings(voicing, stringSet, shapeId, registerBand, needsReset);
      if (mapping) {
        return mapping;
      }
    }

    // Fallback: try any valid string set
    const allSets = this.generateStringSetCombinations(voicing.length);
    for (const stringSet of allSets) {
      const mapping = this.mapToStrings(voicing, stringSet, shapeId, registerBand, needsReset);
      if (mapping) {
        return mapping;
      }
    }

    throw new Error(`Cannot map voicing ${voicing} to fretboard`);
  }

  /**
   * Map voicing to specific string set
   */
  mapToStrings(voicing, stringSet, shapeId, registerBand, needsReset) {
    if (stringSet.length < voicing.length) {
      return null; // Not enough strings
    }

    // Sort voicing (lowest to highest)
    const sortedVoicing = [...voicing].sort((a, b) => a - b);

    // Try to map notes to strings
    const frets = new Array(6).fill(null); // 6 strings, null = not used
    const usedStrings = [];

    // Map each note to a string
    for (let i = 0; i < sortedVoicing.length; i++) {
      const midiNote = sortedVoicing[i];
      const targetString = stringSet[i];
      
      // Calculate required fret
      const openNote = this.tuning[targetString - 1];
      let fret = midiNote - openNote;

      // Handle octave wrapping (if fret is negative, try next octave)
      if (fret < 0) {
        fret += 12;
      }
      if (fret > this.maxFret) {
        fret -= 12;
      }

      // Check if fret is valid
      if (fret < 0 || fret > this.maxFret) {
        return null; // Cannot map this note
      }

      frets[targetString - 1] = fret;
      usedStrings.push(targetString);
    }

    // Check fret span
    const usedFrets = frets.filter(f => f !== null);
    const minFret = Math.min(...usedFrets);
    const maxFret = Math.max(...usedFrets);
    const span = maxFret - minFret;

    if (span > this.maxFretSpan) {
      return null; // Span too wide
    }

    // Determine movement type
    let movementType = 'STEP';
    if (needsReset) {
      movementType = 'RESET';
    } else if (this.previousMapping) {
      // Check if this is a minimal change
      const prevFrets = this.previousMapping.frets;
      const changes = this.countFretChanges(prevFrets, frets);
      if (changes === 0) {
        movementType = 'HOLD';
      } else if (changes > 2) {
        movementType = 'RESET';
      }
    } else {
      movementType = 'RESET'; // First mapping
    }

    // Calculate anchor fret (lowest used fret)
    const anchorFret = minFret;

    // Update position window
    if (!this.positionWindow || needsReset) {
      this.positionWindow = [anchorFret, anchorFret + this.maxFretSpan];
    } else {
      // Expand window slightly if needed
      if (anchorFret < this.positionWindow[0]) {
        this.positionWindow[0] = anchorFret;
      }
      if (anchorFret > this.positionWindow[1] - this.maxFretSpan) {
        this.positionWindow[1] = anchorFret + this.maxFretSpan;
      }
    }

    return {
      stringSet: usedStrings,
      frets: frets,
      positionWindow: [...this.positionWindow],
      anchorFret: anchorFret,
      movementType: movementType,
      shapeId: shapeId,
      registerBand: registerBand
    };
  }

  /**
   * Check if voicing can be mapped to string set
   */
  canUseStringSet(voicing, stringSet) {
    if (stringSet.length < voicing.length) {
      return false;
    }

    const sortedVoicing = [...voicing].sort((a, b) => a - b);
    
    for (let i = 0; i < sortedVoicing.length; i++) {
      const midiNote = sortedVoicing[i];
      const targetString = stringSet[i];
      const openNote = this.tuning[targetString - 1];
      let fret = midiNote - openNote;

      if (fret < 0) fret += 12;
      if (fret > this.maxFret) fret -= 12;

      if (fret < 0 || fret > this.maxFret) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate string set combinations for a given number of notes
   */
  generateStringSetCombinations(numNotes) {
    const combinations = [];
    
    // Generate all valid combinations
    for (let start = 1; start <= 7 - numNotes; start++) {
      const set = [];
      for (let i = 0; i < numNotes; i++) {
        set.push(start + i);
      }
      combinations.push(set);
    }

    return combinations;
  }

  /**
   * Count number of fret changes between two mappings
   */
  countFretChanges(prevFrets, currFrets) {
    let changes = 0;
    for (let i = 0; i < 6; i++) {
      if (prevFrets[i] !== null && currFrets[i] !== null) {
        if (prevFrets[i] !== currFrets[i]) {
          changes++;
        }
      } else if (prevFrets[i] !== currFrets[i]) {
        changes++;
      }
    }
    return changes;
  }

  /**
   * Update position window
   */
  updatePositionWindow(anchorFret) {
    if (!this.positionWindow) {
      this.positionWindow = [anchorFret, anchorFret + this.maxFretSpan];
    } else {
      // Keep window stable, only expand if necessary
      if (anchorFret < this.positionWindow[0]) {
        this.positionWindow[0] = anchorFret;
      }
      if (anchorFret > this.positionWindow[1] - this.maxFretSpan) {
        this.positionWindow[1] = anchorFret + this.maxFretSpan;
      }
    }
  }

  /**
   * Reset projection state
   */
  reset() {
    this.previousMapping = null;
    this.positionWindow = null;
    this.currentStringSet = null;
    this.currentShapeId = null;
  }
}
