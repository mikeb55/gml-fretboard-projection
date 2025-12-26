/**
 * Chord Symbol Parser
 * Converts chord symbols (e.g., "Bb7", "Gm7", "C#maj7") to MIDI voicings
 */

import { spellChord } from './chord-spelling.js';
import { normalizeTonicChord, ReasonCodes } from './tonic-normalization.js';

/**
 * Parse a chord symbol and return MIDI voicing
 * @param {string} chordSymbol - Chord symbol (e.g., "Bb7", "Gm7", "C#maj7", "Edim7")
 * @param {number|object} octaveOrOptions - Base octave for root (default: 4) or options object
 * @param {object} options - Options for parsing (if octaveOrOptions is number)
 * @param {string} options.keyRoot - Key root for tonic normalization (e.g., "C")
 * @param {boolean} options.preferTonicMaj6 - Whether to normalize tonic maj7 to maj6 (default: false)
 * @returns {number[]|{voicing: number[], reasonCodes: string[], normalizedType: string}} - MIDI voicing (array for backward compat) or full object
 */
export function parseChordSymbol(chordSymbol, octaveOrOptions = 4, options = {}) {
  // Handle backward compatibility: if second param is a number, it's the octave
  let octave = 4;
  let keyRoot = null;
  let preferTonicMaj6 = false;
  let returnObject = false;
  
  if (typeof octaveOrOptions === 'number') {
    octave = octaveOrOptions;
    keyRoot = options.keyRoot || null;
    preferTonicMaj6 = options.preferTonicMaj6 || false;
  } else if (typeof octaveOrOptions === 'object') {
    octave = octaveOrOptions.octave || 4;
    keyRoot = octaveOrOptions.keyRoot || null;
    preferTonicMaj6 = octaveOrOptions.preferTonicMaj6 || false;
    returnObject = octaveOrOptions.returnObject !== false; // Default to true for new API
  }
  
  // Parse the chord symbol
  const parsed = parseChordName(chordSymbol);
  if (!parsed) {
    throw new Error(`Invalid chord symbol: ${chordSymbol}`);
  }
  
  // Apply tonic normalization if enabled
  const normalized = normalizeTonicChord(parsed.root, parsed.type, keyRoot, preferTonicMaj6);
  const finalType = normalized.type;
  const reasonCodes = normalized.reasonCodes;
  
  // Get the spelled chord using normalized type
  const spelledChord = spellChord(parsed.root, finalType);
  
  // Get intervals for this chord type (use normalized type)
  const intervals = getChordIntervals(finalType);
  
  // Get root MIDI value - use octave 3 for roots to keep voicings in guitar range
  const rootMidi = noteNameToMidiBase(parsed.root, 3);
  
  // Convert note names to MIDI numbers using intervals
  const midiNotes = intervals.map(interval => {
    const midi = rootMidi + interval;
    // Keep in reasonable guitar range (adjust octave if needed)
    if (midi > 84) return midi - 12; // Too high, drop an octave
    if (midi < 40) return midi + 12; // Too low, raise an octave
    return midi;
  });
  
  // Return format based on API version
  if (returnObject) {
    return {
      voicing: midiNotes,
      reasonCodes,
      normalizedType: finalType,
      originalType: parsed.type
    };
  } else {
    // Backward compatibility: return just the array
    return midiNotes;
  }
}

/**
 * Parse chord name into root and type
 * @param {string} chordSymbol - Chord symbol (e.g., "Bb7", "Gm7", "C#maj7")
 * @returns {{root: string, type: string} | null}
 */
function parseChordName(chordSymbol) {
  // Remove whitespace
  chordSymbol = chordSymbol.trim();
  
  // Match root note (with optional accidental)
  const rootMatch = chordSymbol.match(/^([A-G][#♯b♭𝄪𝄫]*)/);
  if (!rootMatch) return null;
  
  let root = rootMatch[1];
  // Normalize accidentals
  root = root.replace(/#/g, '♯').replace(/b/g, '♭');
  
  // Get the rest (chord type)
  const rest = chordSymbol.slice(rootMatch[0].length);
  
  // Determine chord type
  let type = 'major'; // default
  
  // Check for 6th chords BEFORE checking 7th chords to avoid misparsing
  // Must check for "maj6" or standalone "6" but NOT "13" (which contains "6")
  if (rest.includes('maj6') || rest.includes('M6') || rest.includes('Δ6')) {
    type = 'maj6';
  } else if (rest.includes('6') && !rest.includes('13')) {
    // Standalone "6" (not part of "13") means major 6th
    type = 'maj6';
  } else if (rest.includes('dim7') || rest.includes('o7')) {
    type = 'dim7';
  } else if (rest.includes('dim') || rest.includes('o')) {
    type = 'diminished';
  } else if (rest.includes('augmaj7') || rest.includes('+maj7')) {
    type = 'augmaj7';
  } else if (rest.includes('aug') || rest.includes('+')) {
    type = 'augmented';
  } else if (rest.includes('maj7') || rest.includes('M7') || rest.includes('Δ7')) {
    type = 'maj7';
  } else if (rest.includes('m7') || rest.includes('min7') || rest.includes('-7')) {
    type = 'm7';
  } else if (rest.includes('7')) {
    type = '7';
  } else if (rest.includes('m') || rest.includes('min') || rest.includes('-')) {
    type = 'minor';
  }
  
  return { root, type };
}

/**
 * Get intervals for a chord type
 * @param {string} chordType - Chord type
 * @returns {number[]} - Array of semitone intervals from root
 */
function getChordIntervals(chordType) {
  const intervals = {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'diminished': [0, 3, 6],
    'augmented': [0, 4, 8],
    'maj7': [0, 4, 7, 11],
    '7': [0, 4, 7, 10],
    'm7': [0, 3, 7, 10],
    'dim7': [0, 3, 6, 9],
    'augmaj7': [0, 4, 8, 11],
    'maj6': [0, 4, 7, 9]
  };
  
  return intervals[chordType] || [0, 4, 7];
}

/**
 * Convert note name to MIDI number (base function)
 * @param {string} noteName - Note name (e.g., "C", "C♯", "E♭", "B𝄫")
 * @param {number} octave - Octave number (default: 4)
 * @returns {number} - MIDI note number
 */
function noteNameToMidiBase(noteName, octave = 4) {
  // Parse note
  const letterMatch = noteName.match(/^([A-G])/);
  if (!letterMatch) throw new Error(`Invalid note name: ${noteName}`);
  
  const letter = letterMatch[1];
  const accidentalPart = noteName.slice(1);
  
  // Calculate accidental offset
  let offset = 0;
  if (accidentalPart.includes('𝄫') || accidentalPart.includes('bb')) {
    offset = -2;
  } else if (accidentalPart.includes('𝄪') || accidentalPart.includes('##')) {
    offset = +2;
  } else if (accidentalPart.includes('♭') || accidentalPart.includes('b')) {
    offset = -1;
  } else if (accidentalPart.includes('♯') || accidentalPart.includes('#')) {
    offset = +1;
  }
  
  // Base MIDI values for C4 octave
  const baseMidi = {
    'C': 60, 'D': 62, 'E': 64, 'F': 65, 'G': 67, 'A': 69, 'B': 71
  };
  
  const baseNote = baseMidi[letter];
  const octaveOffset = (octave - 4) * 12;
  
  return baseNote + offset + octaveOffset;
}

/**
 * Parse a chord progression from text
 * @param {string} text - Text with chord symbols (e.g., "Bb7 | Eb7 | F7 | Bb7")
 * @param {number} octave - Base octave for root (default: 4)
 * @param {object} options - Options for parsing
 * @param {string} options.keyRoot - Key root for tonic normalization (e.g., "C")
 * @param {boolean} options.preferTonicMaj6 - Whether to normalize tonic maj7 to maj6 (default: false)
 * @returns {Array<{symbol: string, voicing: number[], reasonCodes: string[], normalizedType: string}>} - Array of parsed chords
 */
export function parseChordProgression(text, octave = 4, options = {}) {
  const { keyRoot = null, preferTonicMaj6 = false } = options;
  // Split by common delimiters
  const chords = text.split(/[|\s,]+/).filter(c => c.trim().length > 0);
  
  return chords.map(symbol => {
    try {
      // Handle iReal Pro notation: "Bb7/G7" means two chords in one measure
      // Extract only the second chord (after the slash) as requested
      let chordToParse = symbol.trim();
      if (chordToParse.includes('/')) {
        const parts = chordToParse.split('/');
        if (parts.length === 2) {
          // iReal Pro uses "/" to show two chords in one measure
          // Extract the second chord only (e.g., "Bb7/G7" → "G7")
          chordToParse = parts[1].trim();
        }
      }
      
      // Skip if it's just a repeat symbol
      if (chordToParse === '%' || chordToParse === '') {
        return null;
      }
      
      const result = parseChordSymbol(chordToParse, octave, { keyRoot, preferTonicMaj6, returnObject: true });
      return {
        symbol: chordToParse,
        voicing: result.voicing || result, // Handle both old (array) and new (object) formats
        reasonCodes: result.reasonCodes || [],
        normalizedType: result.normalizedType || result.type,
        originalType: result.originalType,
        originalSymbol: symbol.trim()
      };
    } catch (error) {
      console.warn(`Failed to parse chord "${symbol}": ${error.message}`);
      return null;
    }
  }).filter(c => c !== null);
}

