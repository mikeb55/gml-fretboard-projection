/**
 * Deterministic Chord Spelling Function
 * 
 * This module provides algorithmic chord spelling that enforces:
 * 1. Letter-name integrity (different letter names for each chord tone)
 * 2. Correct interval qualities (major 3rd = 4 semitones, minor 3rd = 3 semitones, etc.)
 * 3. Proper enharmonic spelling based on root
 * 
 * Based on the enharmonic rules system prompt principles.
 */

/**
 * Parse a note name into letter and accidental
 * @param {string} noteName - Note name (e.g., "C", "C♯", "E♭", "B𝄫")
 * @returns {{letter: string, accidental: string, semitones: number}} - Parsed note
 */
function parseNote(noteName) {
  const letterMatch = noteName.match(/^([A-G])/);
  if (!letterMatch) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  
  const letter = letterMatch[1];
  const accidentalPart = noteName.slice(1);
  
  // Map accidentals to semitone offset
  let accidental = '';
  let semitoneOffset = 0;
  
  if (accidentalPart.includes('𝄫')) {
    accidental = '𝄫';
    semitoneOffset = -2;
  } else if (accidentalPart.includes('♭♭') || accidentalPart.includes('bb')) {
    accidental = '♭♭';
    semitoneOffset = -2;
  } else if (accidentalPart.includes('𝄪')) {
    accidental = '𝄪';
    semitoneOffset = +2;
  } else if (accidentalPart.includes('##') || accidentalPart.includes('♯♯')) {
    accidental = '♯♯';
    semitoneOffset = +2;
  } else if (accidentalPart.includes('♭') || accidentalPart.includes('b')) {
    accidental = '♭';
    semitoneOffset = -1;
  } else if (accidentalPart.includes('♯') || accidentalPart.includes('#')) {
    accidental = '♯';
    semitoneOffset = +1;
  }
  
  // Map letter to base semitone (C=0, D=2, E=4, F=5, G=7, A=9, B=11)
  const letterToSemitone = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };
  
  const baseSemitone = letterToSemitone[letter];
  const semitones = (baseSemitone + semitoneOffset + 12) % 12;
  
  return { letter, accidental, semitones };
}

/**
 * Get letter name that is N steps above a given letter
 * @param {string} letter - Starting letter (A-G)
 * @param {number} steps - Number of letter steps up (1 = next letter, 2 = third, etc.)
 * @returns {string} - Letter name N steps above
 */
function getLetterAbove(letter, steps) {
  const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const index = letters.indexOf(letter);
  if (index === -1) throw new Error(`Invalid letter: ${letter}`);
  
  return letters[(index + steps) % 7];
}

/**
 * Calculate the semitone distance between two letters (natural notes)
 * @param {string} letter1 - First letter
 * @param {string} letter2 - Second letter
 * @returns {number} - Semitone distance (can be negative)
 */
function getNaturalSemitoneDistance(letter1, letter2) {
  const letterToSemitone = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };
  
  const semitone1 = letterToSemitone[letter1];
  const semitone2 = letterToSemitone[letter2];
  
  let distance = semitone2 - semitone1;
  // Handle wraparound
  if (distance > 6) distance -= 12;
  if (distance < -6) distance += 12;
  
  return distance;
}

/**
 * Calculate accidental needed to achieve target semitone distance
 * @param {string} rootLetter - Root letter
 * @param {string} targetLetter - Target letter (3rd, 5th, or 7th)
 * @param {number} targetSemitones - Required semitone value (0-11) for the target note
 * @param {number} rootSemitones - Root's semitone value (0-11)
 * @returns {string} - Accidental needed ('', '♯', '♭', '𝄪', '𝄫')
 */
function calculateAccidental(rootLetter, targetLetter, targetSemitones, rootSemitones) {
  // Get the natural semitone value of the target letter (without accidentals)
  const letterToSemitone = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };
  
  const naturalTargetSemitones = letterToSemitone[targetLetter];
  
  // Calculate how many semitones we need to adjust
  let difference = targetSemitones - naturalTargetSemitones;
  
  // Normalize to -6 to +6 range
  if (difference > 6) difference -= 12;
  if (difference < -6) difference += 12;
  
  // Map difference to accidental
  if (difference === 0) return '';
  if (difference === 1) return '♯';
  if (difference === 2) return '𝄪';
  if (difference === -1) return '♭';
  if (difference === -2) return '𝄫';
  
  // Shouldn't happen in normal chords, but handle it
  return ''; // Default to natural
}

/**
 * Spell a chord algorithmically from root and chord type
 * @param {string} rootName - Root note name (e.g., "C", "C♯", "E♭", "G♯")
 * @param {string} chordType - Chord type: "major", "minor", "diminished", "augmented", "maj7", "7", "m7", "dim7", "augmaj7", "maj6"
 * @returns {string[]} - Array of note names in order (root, 3rd, 5th, 7th if applicable)
 */
export function spellChord(rootName, chordType) {
  const root = parseNote(rootName);
  
  // Define intervals for each chord type
  const intervals = {
    'major': [0, 4, 7],           // root, major 3rd, perfect 5th
    'minor': [0, 3, 7],           // root, minor 3rd, perfect 5th
    'diminished': [0, 3, 6],      // root, minor 3rd, diminished 5th
    'augmented': [0, 4, 8],       // root, major 3rd, augmented 5th
    'maj7': [0, 4, 7, 11],        // root, major 3rd, perfect 5th, major 7th
    '7': [0, 4, 7, 10],           // root, major 3rd, perfect 5th, minor 7th (dominant)
    'm7': [0, 3, 7, 10],          // root, minor 3rd, perfect 5th, minor 7th
    'dim7': [0, 3, 6, 9],         // root, minor 3rd, diminished 5th, diminished 7th
    'augmaj7': [0, 4, 8, 11],     // root, major 3rd, augmented 5th, major 7th
    'maj6': [0, 4, 7, 9]          // root, major 3rd, perfect 5th, major 6th (Barry Harris Foundations 0)
  };
  
  const chordIntervals = intervals[chordType];
  if (!chordIntervals) {
    throw new Error(`Unknown chord type: ${chordType}`);
  }
  
  const noteNames = [];
  
  // Root is always first
  noteNames.push(rootName);
  
  // For each interval after the root
  for (let i = 1; i < chordIntervals.length; i++) {
    const intervalSemitones = chordIntervals[i];
    // 3rd = 2 steps, 5th = 4 steps, 6th = 5 steps, 7th = 6 steps
    const letterSteps = i === 1 ? 2 : (i === 2 ? 4 : (i === 3 && intervalSemitones === 9 ? 5 : 6));
    
    const targetLetter = getLetterAbove(root.letter, letterSteps);
    const targetSemitones = (root.semitones + intervalSemitones) % 12;
    
    const accidental = calculateAccidental(root.letter, targetLetter, targetSemitones, root.semitones);
    
    // Use consistent symbols: prefer 𝄫 over ♭♭, 𝄪 over ♯♯
    let finalAccidental = accidental;
    if (accidental === '♭♭') finalAccidental = '𝄫';
    if (accidental === '♯♯' || accidental === '##') finalAccidental = '𝄪';
    
    const noteName = targetLetter + finalAccidental;
    noteNames.push(noteName);
  }
  
  return noteNames;
}

/**
 * Convert MIDI note to note name using chord context
 * This is a helper that uses the chord spelling function
 * @param {number} midiNote - MIDI note number (0-127)
 * @param {number[]} contextMidiNotes - All MIDI notes in the chord
 * @param {string} rootName - Optional: root note name (e.g., "C", "C♯")
 * @param {string} chordType - Optional: chord type (e.g., "major", "minor", "m7")
 * @returns {string} - Note name with proper spelling
 */
export function midiToNoteNameWithChordContext(midiNote, contextMidiNotes, rootName = null, chordType = null) {
  const noteIndex = midiNote % 12;
  
  // If we have root and chord type, use the spelling function
  if (rootName && chordType) {
    const spelledChord = spellChord(rootName, chordType);
    const rootMidi = Math.min(...contextMidiNotes);
    
    // Find which note in the chord this MIDI note corresponds to
    const sortedContext = [...contextMidiNotes].sort((a, b) => a - b);
    const notePosition = sortedContext.indexOf(midiNote);
    
    if (notePosition >= 0 && notePosition < spelledChord.length) {
      return spelledChord[notePosition];
    }
  }
  
  // Fallback: use simple note name (no context)
  const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  return noteNames[noteIndex];
}

