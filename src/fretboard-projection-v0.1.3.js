/**
 * Fretboard Projection Layer v0.1.3
 * Long-form stability refinements - improved stability over extended progressions
 * 
 * Changes from v0.1.2:
 * - Better position window drift prevention
 * - Enhanced long-form stability
 * - Improved minimal movement detection
 * - More conservative STEP vs RESET decisions
 */

const GUITAR_TUNING = [40, 45, 50, 55, 59, 64];
const MAX_FRET = 20;
const MAX_FRET_SPAN = 5;

export class FretboardProjection {
  constructor(options = {}) {
    this.version = '0.1.3';
    this.tuning = options.tuning || GUITAR_TUNING;
    this.maxFret = options.maxFret || MAX_FRET;
    this.maxFretSpan = options.maxFretSpan || MAX_FRET_SPAN;
    
    this.previousMapping = null;
    this.positionWindow = null;
    this.currentStringSet = null;
    this.currentShapeId = null;
    this.mappingHistory = [];
    this.maxHistorySize = 8;
  }

  project(input) {
    const { voicing, inversion, registerPosition, hold, reasonCodes } = input;

    if (hold && this.previousMapping) {
      const holdMapping = {
        ...this.previousMapping,
        movementType: 'HOLD'
      };
      this.addToHistory(holdMapping);
      return holdMapping;
    }

    const needsReset = this.detectRegisterReset(reasonCodes, registerPosition);
    const mapping = this.generateMapping(voicing, inversion, registerPosition, needsReset);

    this.checkAndCorrectDrift(mapping);

    this.previousMapping = mapping;
    this.updatePositionWindow(mapping.anchorFret, needsReset);
    this.currentStringSet = mapping.stringSet;
    this.currentShapeId = mapping.shapeId;
    this.addToHistory(mapping);

    return mapping;
  }

  detectRegisterReset(reasonCodes, registerPosition) {
    if (reasonCodes?.some(rc => rc.code === 'REGISTER_RESET')) {
      return true;
    }

    if (this.previousMapping && registerPosition) {
      const prevRegister = this.previousMapping.registerBand;
      if (prevRegister && registerPosition !== prevRegister) {
        if ((prevRegister === 'low' && registerPosition === 'high') ||
            (prevRegister === 'high' && registerPosition === 'low')) {
          return true;
        }
      }
    }

    if (this.previousMapping && this.positionWindow) {
      const prevAnchor = this.previousMapping.anchorFret;
      const windowCenter = (this.positionWindow[0] + this.positionWindow[1]) / 2;
      const distance = Math.abs(prevAnchor - windowCenter);
      
      if (distance > this.maxFretSpan * 2) {
        return true;
      }
    }

    return false;
  }

  checkAndCorrectDrift(mapping) {
    if (this.mappingHistory.length < 4) return;

    const recentAnchors = this.mappingHistory.slice(-4).map(m => m.anchorFret);
    const avgAnchor = recentAnchors.reduce((a, b) => a + b, 0) / recentAnchors.length;
    const currentAnchor = mapping.anchorFret;

    const drift = Math.abs(currentAnchor - avgAnchor);
    if (drift > this.maxFretSpan) {
      const targetAnchor = Math.round(avgAnchor);
      this.positionWindow = [
        Math.max(0, targetAnchor - 2),
        Math.min(this.maxFret, targetAnchor + this.maxFretSpan + 2)
      ];
    }
  }

  addToHistory(mapping) {
    this.mappingHistory.push(mapping);
    if (this.mappingHistory.length > this.maxHistorySize) {
      this.mappingHistory.shift();
    }
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

    if (needsReset) {
      const registerSets = this.getRegisterAppropriateSets(registerBand, voicing.length);
      for (const stringSet of registerSets) {
        const mapping = this.mapToStrings(voicing, stringSet, shapeId, registerBand, needsReset);
        if (mapping) return mapping;
      }
    }

    if (!needsReset && this.currentShapeId === shapeId && this.currentStringSet) {
      const mapping = this.mapToStrings(voicing, this.currentStringSet, shapeId, registerBand, needsReset);
      if (mapping) return mapping;
    }

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

  getRegisterAppropriateSets(registerBand, numNotes) {
    if (registerBand === 'low') {
      return [[6, 5, 4, 3].slice(0, numNotes), [5, 4, 3, 2].slice(0, numNotes)];
    } else if (registerBand === 'high') {
      return [[4, 3, 2, 1].slice(0, numNotes), [5, 4, 3, 2].slice(0, numNotes)];
    } else {
      return [[5, 4, 3, 2].slice(0, numNotes), [4, 3, 2, 1].slice(0, numNotes), [6, 5, 4, 3].slice(0, numNotes)];
    }
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

    let movementType = 'STEP';
    if (needsReset) {
      movementType = 'RESET';
    } else if (this.previousMapping) {
      const prevFrets = this.previousMapping.frets;
      const changes = this.countFretChanges(prevFrets, frets);
      const stringSetChanged = !this.arraysEqual(this.previousMapping.stringSet, usedStrings);
      const anchorMovement = Math.abs(minFret - this.previousMapping.anchorFret);
      
      if (changes === 0 && !stringSetChanged) {
        movementType = 'HOLD';
      } else if (changes <= 1 && !stringSetChanged && anchorMovement <= 2) {
        movementType = 'STEP';
      } else if (changes <= 2 && !stringSetChanged && anchorMovement <= 3) {
        movementType = 'STEP';
      } else if (anchorMovement > 5 || changes > 3) {
        movementType = 'RESET';
      } else {
        movementType = 'STEP';
      }
    } else {
      movementType = 'RESET';
    }

    const anchorFret = minFret;

    if (!this.positionWindow || needsReset) {
      this.positionWindow = [
        Math.max(0, anchorFret - 2),
        Math.min(this.maxFret, anchorFret + this.maxFretSpan + 2)
      ];
    } else {
      const windowCenter = (this.positionWindow[0] + this.positionWindow[1]) / 2;
      const distanceFromCenter = anchorFret - windowCenter;
      
      if (anchorFret < this.positionWindow[0] + 1) {
        this.positionWindow[0] = Math.max(0, anchorFret - 1);
      } else if (anchorFret > this.positionWindow[1] - this.maxFretSpan - 1) {
        this.positionWindow[1] = Math.min(this.maxFret, anchorFret + this.maxFretSpan + 1);
      }
      
      if (Math.abs(distanceFromCenter) > this.maxFretSpan) {
        const newCenter = anchorFret;
        this.positionWindow = [
          Math.max(0, newCenter - this.maxFretSpan),
          Math.min(this.maxFret, newCenter + this.maxFretSpan)
        ];
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

  updatePositionWindow(anchorFret, needsReset) {
    if (needsReset || !this.positionWindow) {
      this.positionWindow = [
        Math.max(0, anchorFret - 2),
        Math.min(this.maxFret, anchorFret + this.maxFretSpan + 2)
      ];
    } else {
      if (anchorFret < this.positionWindow[0]) {
        this.positionWindow[0] = Math.max(0, anchorFret - 1);
      }
      if (anchorFret > this.positionWindow[1] - this.maxFretSpan) {
        this.positionWindow[1] = Math.min(this.maxFret, anchorFret + this.maxFretSpan + 1);
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
    this.mappingHistory = [];
  }
}
