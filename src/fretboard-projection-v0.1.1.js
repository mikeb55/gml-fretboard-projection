/**
 * Fretboard Projection Layer v0.1.1
 * Improved shape continuity - better preservation of string sets and shapes
 * 
 * Changes from v0.1.0:
 * - Enhanced shape continuity detection
 * - Better string set preservation
 * - Improved position window management
 */

const GUITAR_TUNING = [40, 45, 50, 55, 59, 64];
const MAX_FRET = 20;
const MAX_FRET_SPAN = 5;

export class FretboardProjection {
  constructor(options = {}) {
    this.version = '0.1.1';
    this.tuning = options.tuning || GUITAR_TUNING;
    this.maxFret = options.maxFret || MAX_FRET;
    this.maxFretSpan = options.maxFretSpan || MAX_FRET_SPAN;
    
    this.previousMapping = null;
    this.positionWindow = null;
    this.currentStringSet = null;
    this.currentShapeId = null;
  }

  project(input) {
    const { voicing, inversion, registerPosition, hold, reasonCodes } = input;

    if (hold && this.previousMapping) {
      return {
        ...this.previousMapping,
        movementType: 'HOLD'
      };
    }

    const needsReset = reasonCodes?.some(rc => rc.code === 'REGISTER_RESET') || false;
    const mapping = this.generateMapping(voicing, inversion, registerPosition, needsReset);

    this.previousMapping = mapping;
    this.updatePositionWindow(mapping.anchorFret);
    this.currentStringSet = mapping.stringSet;
    this.currentShapeId = mapping.shapeId;

    return mapping;
  }

  generateMapping(voicing, inversion, registerPosition, needsReset) {
    if (!voicing || voicing.length === 0) {
      throw new Error('Voicing cannot be empty');
    }

    const shapeId = inversion || 'root';
    const registerBand = registerPosition || 'mid';

    if (needsReset) {
      this.positionWindow = null;
    }

    // Enhanced: prefer same shapeId
    if (!needsReset && this.currentShapeId === shapeId && this.currentStringSet) {
      const mapping = this.mapToStrings(voicing, this.currentStringSet, shapeId, registerBand, needsReset);
      if (mapping) return mapping;
    }

    // Enhanced: try to maintain string set even if shape changes
    if (!needsReset && this.currentStringSet && this.canUseStringSet(voicing, this.currentStringSet)) {
      const mapping = this.mapToStrings(voicing, this.currentStringSet, shapeId, registerBand, needsReset);
      if (mapping) return mapping;
    }

    const preferredSets = [[6, 5, 4, 3], [5, 4, 3, 2], [4, 3, 2, 1]];

    for (const stringSet of preferredSets) {
      const mapping = this.mapToStrings(voicing, stringSet, shapeId, registerBand, needsReset);
      if (mapping) return mapping;
    }

    const allSets = this.generateStringSetCombinations(voicing.length);
    for (const stringSet of allSets) {
      const mapping = this.mapToStrings(voicing, stringSet, shapeId, registerBand, needsReset);
      if (mapping) return mapping;
    }

    throw new Error(`Cannot map voicing ${voicing} to fretboard`);
  }

  mapToStrings(voicing, stringSet, shapeId, registerBand, needsReset) {
    if (stringSet.length < voicing.length) return null;

    const sortedVoicing = [...voicing].sort((a, b) => a - b);
    const frets = new Array(6).fill(null);
    const usedStrings = [];

    for (let i = 0; i < sortedVoicing.length; i++) {
      const midiNote = sortedVoicing[i];
      const targetString = stringSet[i];
      const openNote = this.tuning[targetString - 1];
      let fret = midiNote - openNote;

      if (fret < 0) fret += 12;
      if (fret > this.maxFret) fret -= 12;

      if (fret < 0 || fret > this.maxFret) return null;

      frets[targetString - 1] = fret;
      usedStrings.push(targetString);
    }

    const usedFrets = frets.filter(f => f !== null);
    const minFret = Math.min(...usedFrets);
    const maxFret = Math.max(...usedFrets);
    const span = maxFret - minFret;

    if (span > this.maxFretSpan) return null;

    // Enhanced movement type detection
    let movementType = 'STEP';
    if (needsReset) {
      movementType = 'RESET';
    } else if (this.previousMapping) {
      const prevFrets = this.previousMapping.frets;
      const changes = this.countFretChanges(prevFrets, frets);
      const stringSetChanged = !this.arraysEqual(this.previousMapping.stringSet, usedStrings);
      
      if (changes === 0 && !stringSetChanged) {
        movementType = 'HOLD';
      } else if (changes <= 1 && !stringSetChanged) {
        movementType = 'STEP';
      } else if (changes <= 2 && !stringSetChanged) {
        movementType = 'STEP';
      } else {
        movementType = 'RESET';
      }
    } else {
      movementType = 'RESET';
    }

    const anchorFret = minFret;

    // Improved position window management
    if (!this.positionWindow || needsReset) {
      this.positionWindow = [anchorFret, anchorFret + this.maxFretSpan];
    } else {
      if (anchorFret < this.positionWindow[0]) {
        this.positionWindow[0] = Math.max(0, anchorFret - 1);
      }
      if (anchorFret > this.positionWindow[1] - this.maxFretSpan) {
        this.positionWindow[1] = Math.min(this.maxFret, anchorFret + this.maxFretSpan + 1);
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

  canUseStringSet(voicing, stringSet) {
    if (stringSet.length < voicing.length) return false;

    const sortedVoicing = [...voicing].sort((a, b) => a - b);
    
    for (let i = 0; i < sortedVoicing.length; i++) {
      const midiNote = sortedVoicing[i];
      const targetString = stringSet[i];
      const openNote = this.tuning[targetString - 1];
      let fret = midiNote - openNote;

      if (fret < 0) fret += 12;
      if (fret > this.maxFret) fret -= 12;

      if (fret < 0 || fret > this.maxFret) return false;
    }

    return true;
  }

  generateStringSetCombinations(numNotes) {
    const combinations = [];
    for (let start = 1; start <= 7 - numNotes; start++) {
      const set = [];
      for (let i = 0; i < numNotes; i++) {
        set.push(start + i);
      }
      combinations.push(set);
    }
    return combinations;
  }

  countFretChanges(prevFrets, currFrets) {
    let changes = 0;
    for (let i = 0; i < 6; i++) {
      if (prevFrets[i] !== null && currFrets[i] !== null) {
        if (prevFrets[i] !== currFrets[i]) changes++;
      } else if (prevFrets[i] !== currFrets[i]) {
        changes++;
      }
    }
    return changes;
  }

  updatePositionWindow(anchorFret) {
    if (!this.positionWindow) {
      this.positionWindow = [anchorFret, anchorFret + this.maxFretSpan];
    } else {
      if (anchorFret < this.positionWindow[0]) {
        this.positionWindow[0] = anchorFret;
      }
      if (anchorFret > this.positionWindow[1] - this.maxFretSpan) {
        this.positionWindow[1] = anchorFret + this.maxFretSpan;
      }
    }
  }

  arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  reset() {
    this.previousMapping = null;
    this.positionWindow = null;
    this.currentStringSet = null;
    this.currentShapeId = null;
  }
}
