/**
 * Rigorous test suite: 30 different enharmonic 16-chord progressions
 * Tests chord spelling with various enharmonic roots and chord types
 */

import { spellChord } from '../src/chord-spelling.js';

// Helper to verify chord spelling correctness
function verifyChord(root, type, expected) {
  try {
    const result = spellChord(root, type);
    const matches = JSON.stringify(result) === JSON.stringify(expected);
    return { matches, result, error: null };
  } catch (error) {
    return { matches: false, result: null, error: error.message };
  }
}

// 30 different 16-chord progressions focusing on enharmonic spellings
const progressions = [
  // Progression 1: Sharp keys with major/minor alternation
  [
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
    { root: 'F♯', type: 'major', expected: ['F♯', 'A♯', 'C♯'] },
    { root: 'G♯', type: 'minor', expected: ['G♯', 'B', 'D♯'] },
    { root: 'A♯', type: 'major', expected: ['A♯', 'C𝄪', 'E♯'] },
    { root: 'C♯', type: 'minor', expected: ['C♯', 'E', 'G♯'] },
    { root: 'D♯', type: 'major', expected: ['D♯', 'F𝄪', 'A♯'] },
    { root: 'F♯', type: 'minor', expected: ['F♯', 'A', 'C♯'] },
    { root: 'G♯', type: 'major', expected: ['G♯', 'B♯', 'D♯'] },
    { root: 'A♯', type: 'minor', expected: ['A♯', 'C♯', 'E♯'] },
    { root: 'C♯', type: 'maj7', expected: ['C♯', 'E♯', 'G♯', 'B♯'] },
    { root: 'D♯', type: 'm7', expected: ['D♯', 'F♯', 'A♯', 'C♯'] },
    { root: 'F♯', type: '7', expected: ['F♯', 'A♯', 'C♯', 'E'] },
    { root: 'G♯', type: 'dim7', expected: ['G♯', 'B', 'D', 'F'] },
    { root: 'A♯', type: 'augmaj7', expected: ['A♯', 'C𝄪', 'E𝄪', 'G𝄪'] },
    { root: 'C♯', type: 'augmented', expected: ['C♯', 'E♯', 'G𝄪'] },
  ],

  // Progression 2: Flat keys with seventh chords
  [
    { root: 'D♭', type: 'major', expected: ['D♭', 'F', 'A♭'] },
    { root: 'E♭', type: 'minor', expected: ['E♭', 'G♭', 'B♭'] },
    { root: 'G♭', type: 'major', expected: ['G♭', 'B♭', 'D♭'] },
    { root: 'A♭', type: 'minor', expected: ['A♭', 'C♭', 'E♭'] },
    { root: 'B♭', type: 'major', expected: ['B♭', 'D', 'F'] },
    { root: 'D♭', type: 'm7', expected: ['D♭', 'F♭', 'A♭', 'C♭'] },
    { root: 'E♭', type: 'maj7', expected: ['E♭', 'G', 'B♭', 'D'] },
    { root: 'G♭', type: '7', expected: ['G♭', 'B♭', 'D♭', 'F♭'] },
    { root: 'A♭', type: 'dim7', expected: ['A♭', 'C♭', 'E𝄫', 'G𝄫'] },
    { root: 'B♭', type: 'm7', expected: ['B♭', 'D♭', 'F', 'A♭'] },
    { root: 'D♭', type: 'augmaj7', expected: ['D♭', 'F', 'A', 'C'] },
    { root: 'E♭', type: 'diminished', expected: ['E♭', 'G♭', 'B𝄫'] },
    { root: 'G♭', type: 'augmented', expected: ['G♭', 'B♭', 'D'] },
    { root: 'A♭', type: 'major', expected: ['A♭', 'C', 'E♭'] },
    { root: 'B♭', type: 'minor', expected: ['B♭', 'D♭', 'F'] },
    { root: 'D♭', type: 'dim7', expected: ['D♭', 'F♭', 'A𝄫', 'C𝄫'] },
  ],

  // Progression 3: Theoretical keys with double accidentals
  [
    { root: 'C♭', type: 'major', expected: ['C♭', 'E♭', 'G♭'] },
    { root: 'F♭', type: 'minor', expected: ['F♭', 'A𝄫', 'C♭'] },
    { root: 'B𝄫', type: 'major', expected: ['B𝄫', 'D♭', 'F♭'] },
    { root: 'G♭', type: 'minor', expected: ['G♭', 'B𝄫', 'D♭'] },
    { root: 'C♭', type: 'm7', expected: ['C♭', 'E𝄫', 'G♭', 'B𝄫'] },
    { root: 'F♭', type: 'maj7', expected: ['F♭', 'A♭', 'C♭', 'E♭'] },
    { root: 'B𝄫', type: '7', expected: ['B𝄫', 'D♭', 'F♭', 'A𝄫'] },
    { root: 'G♭', type: 'dim7', expected: ['G♭', 'B𝄫', 'D𝄫', 'F𝄫'] },
    { root: 'C♭', type: 'diminished', expected: ['C♭', 'E𝄫', 'G𝄫'] },
    { root: 'F♭', type: 'augmented', expected: ['F♭', 'A♭', 'C'] },
    { root: 'B𝄫', type: 'augmaj7', expected: ['B𝄫', 'D♭', 'F', 'A♭'] },
    { root: 'G♭', type: 'augmented', expected: ['G♭', 'B♭', 'D'] },
    { root: 'C♭', type: 'minor', expected: ['C♭', 'E𝄫', 'G♭'] },
    { root: 'F♭', type: 'major', expected: ['F♭', 'A♭', 'C♭'] },
    { root: 'B𝄫', type: 'minor', expected: ['B𝄫', 'D𝄫', 'F♭'] },
    { root: 'G♭', type: 'maj7', expected: ['G♭', 'B♭', 'D♭', 'F'] },
  ],

  // Progression 4: Mixed enharmonic equivalents (C♯/D♭, F♯/G♭, etc.)
  [
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'D♭', type: 'major', expected: ['D♭', 'F', 'A♭'] },
    { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
    { root: 'E♭', type: 'minor', expected: ['E♭', 'G♭', 'B♭'] },
    { root: 'F♯', type: 'major', expected: ['F♯', 'A♯', 'C♯'] },
    { root: 'G♭', type: 'major', expected: ['G♭', 'B♭', 'D♭'] },
    { root: 'G♯', type: 'minor', expected: ['G♯', 'B', 'D♯'] },
    { root: 'A♭', type: 'minor', expected: ['A♭', 'C♭', 'E♭'] },
    { root: 'A♯', type: 'major', expected: ['A♯', 'C𝄪', 'E♯'] },
    { root: 'B♭', type: 'major', expected: ['B♭', 'D', 'F'] },
    { root: 'C♯', type: '7', expected: ['C♯', 'E♯', 'G♯', 'B'] },
    { root: 'D♭', type: '7', expected: ['D♭', 'F', 'A♭', 'C♭'] },
    { root: 'F♯', type: 'm7', expected: ['F♯', 'A', 'C♯', 'E'] },
    { root: 'G♭', type: 'm7', expected: ['G♭', 'B𝄫', 'D♭', 'F♭'] },
    { root: 'A♯', type: 'dim7', expected: ['A♯', 'C♯', 'E', 'G'] },
    { root: 'B♭', type: 'dim7', expected: ['B♭', 'D♭', 'F♭', 'A𝄫'] },
  ],

  // Progression 5: All chord types on C♯
  [
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'C♯', type: 'minor', expected: ['C♯', 'E', 'G♯'] },
    { root: 'C♯', type: 'diminished', expected: ['C♯', 'E', 'G'] },
    { root: 'C♯', type: 'augmented', expected: ['C♯', 'E♯', 'G𝄪'] },
    { root: 'C♯', type: 'maj7', expected: ['C♯', 'E♯', 'G♯', 'B♯'] },
    { root: 'C♯', type: '7', expected: ['C♯', 'E♯', 'G♯', 'B'] },
    { root: 'C♯', type: 'm7', expected: ['C♯', 'E', 'G♯', 'B'] },
    { root: 'C♯', type: 'dim7', expected: ['C♯', 'E', 'G', 'B♭'] },
    { root: 'C♯', type: 'augmaj7', expected: ['C♯', 'E♯', 'G𝄪', 'B♯'] },
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'C♯', type: 'minor', expected: ['C♯', 'E', 'G♯'] },
    { root: 'C♯', type: 'diminished', expected: ['C♯', 'E', 'G'] },
    { root: 'C♯', type: 'augmented', expected: ['C♯', 'E♯', 'G𝄪'] },
    { root: 'C♯', type: 'maj7', expected: ['C♯', 'E♯', 'G♯', 'B♯'] },
    { root: 'C♯', type: '7', expected: ['C♯', 'E♯', 'G♯', 'B'] },
    { root: 'C♯', type: 'm7', expected: ['C♯', 'E', 'G♯', 'B'] },
  ],

  // Progression 6: All chord types on G♭
  [
    { root: 'G♭', type: 'major', expected: ['G♭', 'B♭', 'D♭'] },
    { root: 'G♭', type: 'minor', expected: ['G♭', 'B𝄫', 'D♭'] },
    { root: 'G♭', type: 'diminished', expected: ['G♭', 'B𝄫', 'D𝄫'] },
    { root: 'G♭', type: 'augmented', expected: ['G♭', 'B♭', 'D'] },
    { root: 'G♭', type: 'maj7', expected: ['G♭', 'B♭', 'D♭', 'F'] },
    { root: 'G♭', type: '7', expected: ['G♭', 'B♭', 'D♭', 'F♭'] },
    { root: 'G♭', type: 'm7', expected: ['G♭', 'B𝄫', 'D♭', 'F♭'] },
    { root: 'G♭', type: 'dim7', expected: ['G♭', 'B𝄫', 'D𝄫', 'F𝄫'] },
    { root: 'G♭', type: 'augmaj7', expected: ['G♭', 'B♭', 'D', 'F'] },
    { root: 'G♭', type: 'major', expected: ['G♭', 'B♭', 'D♭'] },
    { root: 'G♭', type: 'minor', expected: ['G♭', 'B𝄫', 'D♭'] },
    { root: 'G♭', type: 'diminished', expected: ['G♭', 'B𝄫', 'D𝄫'] },
    { root: 'G♭', type: 'augmented', expected: ['G♭', 'B♭', 'D'] },
    { root: 'G♭', type: 'maj7', expected: ['G♭', 'B♭', 'D♭', 'F'] },
    { root: 'G♭', type: '7', expected: ['G♭', 'B♭', 'D♭', 'F♭'] },
    { root: 'G♭', type: 'm7', expected: ['G♭', 'B𝄫', 'D♭', 'F♭'] },
  ],

  // Progression 7: Circle of fifths with enharmonic keys
  [
    { root: 'C', type: 'major', expected: ['C', 'E', 'G'] },
    { root: 'G', type: 'major', expected: ['G', 'B', 'D'] },
    { root: 'D', type: 'major', expected: ['D', 'F♯', 'A'] },
    { root: 'A', type: 'major', expected: ['A', 'C♯', 'E'] },
    { root: 'E', type: 'major', expected: ['E', 'G♯', 'B'] },
    { root: 'B', type: 'major', expected: ['B', 'D♯', 'F♯'] },
    { root: 'F♯', type: 'major', expected: ['F♯', 'A♯', 'C♯'] },
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'G♯', type: 'major', expected: ['G♯', 'B♯', 'D♯'] },
    { root: 'D♯', type: 'major', expected: ['D♯', 'F𝄪', 'A♯'] },
    { root: 'A♯', type: 'major', expected: ['A♯', 'C𝄪', 'E♯'] },
    { root: 'E♯', type: 'major', expected: ['E♯', 'G𝄪', 'B♯'] },
    { root: 'B♯', type: 'major', expected: ['B♯', 'D𝄪', 'F𝄪'] },
    { root: 'F', type: 'major', expected: ['F', 'A', 'C'] },
    { root: 'B♭', type: 'major', expected: ['B♭', 'D', 'F'] },
    { root: 'E♭', type: 'major', expected: ['E♭', 'G', 'B♭'] },
  ],

  // Progression 8: Circle of fifths flat side
  [
    { root: 'C', type: 'major', expected: ['C', 'E', 'G'] },
    { root: 'F', type: 'major', expected: ['F', 'A', 'C'] },
    { root: 'B♭', type: 'major', expected: ['B♭', 'D', 'F'] },
    { root: 'E♭', type: 'major', expected: ['E♭', 'G', 'B♭'] },
    { root: 'A♭', type: 'major', expected: ['A♭', 'C', 'E♭'] },
    { root: 'D♭', type: 'major', expected: ['D♭', 'F', 'A♭'] },
    { root: 'G♭', type: 'major', expected: ['G♭', 'B♭', 'D♭'] },
    { root: 'C♭', type: 'major', expected: ['C♭', 'E♭', 'G♭'] },
    { root: 'F♭', type: 'major', expected: ['F♭', 'A♭', 'C♭'] },
    { root: 'B𝄫', type: 'major', expected: ['B𝄫', 'D♭', 'F♭'] },
    { root: 'E𝄫', type: 'major', expected: ['E𝄫', 'G♭', 'B𝄫'] },
    { root: 'A𝄫', type: 'major', expected: ['A𝄫', 'C♭', 'E𝄫'] },
    { root: 'D𝄫', type: 'major', expected: ['D𝄫', 'F♭', 'A𝄫'] },
    { root: 'G𝄫', type: 'major', expected: ['G𝄫', 'B𝄫', 'D𝄫'] },
    { root: 'C𝄫', type: 'major', expected: ['C𝄫', 'E𝄫', 'G𝄫'] },
    { root: 'F𝄫', type: 'major', expected: ['F𝄫', 'A𝄫', 'C𝄫'] },
  ],

  // Progression 9: Diminished 7th chords with enharmonic roots
  [
    { root: 'C', type: 'dim7', expected: ['C', 'E♭', 'G♭', 'B𝄫'] },
    { root: 'C♯', type: 'dim7', expected: ['C♯', 'E', 'G', 'B♭'] },
    { root: 'D', type: 'dim7', expected: ['D', 'F', 'A♭', 'C♭'] },
    { root: 'D♯', type: 'dim7', expected: ['D♯', 'F♯', 'A', 'C'] },
    { root: 'E', type: 'dim7', expected: ['E', 'G', 'B♭', 'D♭'] },
    { root: 'F', type: 'dim7', expected: ['F', 'A♭', 'C♭', 'E𝄫'] },
    { root: 'F♯', type: 'dim7', expected: ['F♯', 'A', 'C', 'E♭'] },
    { root: 'G', type: 'dim7', expected: ['G', 'B♭', 'D♭', 'F♭'] },
    { root: 'G♯', type: 'dim7', expected: ['G♯', 'B', 'D', 'F'] },
    { root: 'A', type: 'dim7', expected: ['A', 'C', 'E♭', 'G♭'] },
    { root: 'A♯', type: 'dim7', expected: ['A♯', 'C♯', 'E', 'G'] },
    { root: 'B', type: 'dim7', expected: ['B', 'D', 'F', 'A♭'] },
    { root: 'C♭', type: 'dim7', expected: ['C♭', 'E𝄫', 'G𝄫', 'B'] },
    { root: 'D♭', type: 'dim7', expected: ['D♭', 'F♭', 'A𝄫', 'C𝄫'] },
    { root: 'E♭', type: 'dim7', expected: ['E♭', 'G♭', 'B𝄫', 'D𝄫'] },
    { root: 'G♭', type: 'dim7', expected: ['G♭', 'B𝄫', 'D𝄫', 'F𝄫'] },
  ],

  // Progression 10: Augmented chords with various roots
  [
    { root: 'C', type: 'augmented', expected: ['C', 'E', 'G♯'] },
    { root: 'C♯', type: 'augmented', expected: ['C♯', 'E♯', 'G𝄪'] },
    { root: 'D', type: 'augmented', expected: ['D', 'F♯', 'A♯'] },
    { root: 'D♯', type: 'augmented', expected: ['D♯', 'F𝄪', 'A𝄪'] },
    { root: 'E', type: 'augmented', expected: ['E', 'G♯', 'B♯'] },
    { root: 'F', type: 'augmented', expected: ['F', 'A', 'C♯'] },
    { root: 'F♯', type: 'augmented', expected: ['F♯', 'A♯', 'C𝄪'] },
    { root: 'G', type: 'augmented', expected: ['G', 'B', 'D♯'] },
    { root: 'G♯', type: 'augmented', expected: ['G♯', 'B♯', 'D𝄪'] },
    { root: 'A', type: 'augmented', expected: ['A', 'C♯', 'E♯'] },
    { root: 'A♯', type: 'augmented', expected: ['A♯', 'C𝄪', 'E𝄪'] },
    { root: 'B', type: 'augmented', expected: ['B', 'D♯', 'F𝄪'] },
    { root: 'D♭', type: 'augmented', expected: ['D♭', 'F', 'A'] },
    { root: 'E♭', type: 'augmented', expected: ['E♭', 'G', 'B'] },
    { root: 'G♭', type: 'augmented', expected: ['G♭', 'B♭', 'D'] },
    { root: 'A♭', type: 'augmented', expected: ['A♭', 'C', 'E'] },
  ],

  // Progression 11: Minor keys with enharmonic spellings
  [
    { root: 'C', type: 'minor', expected: ['C', 'E♭', 'G'] },
    { root: 'C♯', type: 'minor', expected: ['C♯', 'E', 'G♯'] },
    { root: 'D', type: 'minor', expected: ['D', 'F', 'A'] },
    { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
    { root: 'E', type: 'minor', expected: ['E', 'G', 'B'] },
    { root: 'F', type: 'minor', expected: ['F', 'A♭', 'C'] },
    { root: 'F♯', type: 'minor', expected: ['F♯', 'A', 'C♯'] },
    { root: 'G', type: 'minor', expected: ['G', 'B♭', 'D'] },
    { root: 'G♯', type: 'minor', expected: ['G♯', 'B', 'D♯'] },
    { root: 'A', type: 'minor', expected: ['A', 'C', 'E'] },
    { root: 'A♯', type: 'minor', expected: ['A♯', 'C♯', 'E♯'] },
    { root: 'B', type: 'minor', expected: ['B', 'D', 'F♯'] },
    { root: 'D♭', type: 'minor', expected: ['D♭', 'F♭', 'A♭'] },
    { root: 'E♭', type: 'minor', expected: ['E♭', 'G♭', 'B♭'] },
    { root: 'G♭', type: 'minor', expected: ['G♭', 'B𝄫', 'D♭'] },
    { root: 'A♭', type: 'minor', expected: ['A♭', 'C♭', 'E♭'] },
  ],

  // Progression 12: Dominant 7th chords in enharmonic keys
  [
    { root: 'C', type: '7', expected: ['C', 'E', 'G', 'B♭'] },
    { root: 'C♯', type: '7', expected: ['C♯', 'E♯', 'G♯', 'B'] },
    { root: 'D', type: '7', expected: ['D', 'F♯', 'A', 'C'] },
    { root: 'D♯', type: '7', expected: ['D♯', 'F𝄪', 'A♯', 'C♯'] },
    { root: 'E', type: '7', expected: ['E', 'G♯', 'B', 'D'] },
    { root: 'F', type: '7', expected: ['F', 'A', 'C', 'E♭'] },
    { root: 'F♯', type: '7', expected: ['F♯', 'A♯', 'C♯', 'E'] },
    { root: 'G', type: '7', expected: ['G', 'B', 'D', 'F'] },
    { root: 'G♯', type: '7', expected: ['G♯', 'B♯', 'D♯', 'F♯'] },
    { root: 'A', type: '7', expected: ['A', 'C♯', 'E', 'G'] },
    { root: 'A♯', type: '7', expected: ['A♯', 'C𝄪', 'E♯', 'G♯'] },
    { root: 'B', type: '7', expected: ['B', 'D♯', 'F♯', 'A'] },
    { root: 'D♭', type: '7', expected: ['D♭', 'F', 'A♭', 'C♭'] },
    { root: 'E♭', type: '7', expected: ['E♭', 'G', 'B♭', 'D♭'] },
    { root: 'G♭', type: '7', expected: ['G♭', 'B♭', 'D♭', 'F♭'] },
    { root: 'A♭', type: '7', expected: ['A♭', 'C', 'E♭', 'G♭'] },
  ],

  // Progression 13: Major 7th chords with enharmonic roots
  [
    { root: 'C', type: 'maj7', expected: ['C', 'E', 'G', 'B'] },
    { root: 'C♯', type: 'maj7', expected: ['C♯', 'E♯', 'G♯', 'B♯'] },
    { root: 'D', type: 'maj7', expected: ['D', 'F♯', 'A', 'C♯'] },
    { root: 'D♯', type: 'maj7', expected: ['D♯', 'F𝄪', 'A♯', 'C𝄪'] },
    { root: 'E', type: 'maj7', expected: ['E', 'G♯', 'B', 'D♯'] },
    { root: 'F', type: 'maj7', expected: ['F', 'A', 'C', 'E'] },
    { root: 'F♯', type: 'maj7', expected: ['F♯', 'A♯', 'C♯', 'E♯'] },
    { root: 'G', type: 'maj7', expected: ['G', 'B', 'D', 'F♯'] },
    { root: 'G♯', type: 'maj7', expected: ['G♯', 'B♯', 'D♯', 'F𝄪'] },
    { root: 'A', type: 'maj7', expected: ['A', 'C♯', 'E', 'G♯'] },
    { root: 'A♯', type: 'maj7', expected: ['A♯', 'C𝄪', 'E♯', 'G𝄪'] },
    { root: 'B', type: 'maj7', expected: ['B', 'D♯', 'F♯', 'A♯'] },
    { root: 'D♭', type: 'maj7', expected: ['D♭', 'F', 'A♭', 'C'] },
    { root: 'E♭', type: 'maj7', expected: ['E♭', 'G', 'B♭', 'D'] },
    { root: 'G♭', type: 'maj7', expected: ['G♭', 'B♭', 'D♭', 'F'] },
    { root: 'A♭', type: 'maj7', expected: ['A♭', 'C', 'E♭', 'G'] },
  ],

  // Progression 14: Minor 7th chords across enharmonic keys
  [
    { root: 'C', type: 'm7', expected: ['C', 'E♭', 'G', 'B♭'] },
    { root: 'C♯', type: 'm7', expected: ['C♯', 'E', 'G♯', 'B'] },
    { root: 'D', type: 'm7', expected: ['D', 'F', 'A', 'C'] },
    { root: 'D♯', type: 'm7', expected: ['D♯', 'F♯', 'A♯', 'C♯'] },
    { root: 'E', type: 'm7', expected: ['E', 'G', 'B', 'D'] },
    { root: 'F', type: 'm7', expected: ['F', 'A♭', 'C', 'E♭'] },
    { root: 'F♯', type: 'm7', expected: ['F♯', 'A', 'C♯', 'E'] },
    { root: 'G', type: 'm7', expected: ['G', 'B♭', 'D', 'F'] },
    { root: 'G♯', type: 'm7', expected: ['G♯', 'B', 'D♯', 'F♯'] },
    { root: 'A', type: 'm7', expected: ['A', 'C', 'E', 'G'] },
    { root: 'A♯', type: 'm7', expected: ['A♯', 'C♯', 'E♯', 'G♯'] },
    { root: 'B', type: 'm7', expected: ['B', 'D', 'F♯', 'A'] },
    { root: 'D♭', type: 'm7', expected: ['D♭', 'F♭', 'A♭', 'C♭'] },
    { root: 'E♭', type: 'm7', expected: ['E♭', 'G♭', 'B♭', 'D♭'] },
    { root: 'G♭', type: 'm7', expected: ['G♭', 'B𝄫', 'D♭', 'F♭'] },
    { root: 'A♭', type: 'm7', expected: ['A♭', 'C♭', 'E♭', 'G♭'] },
  ],

  // Progression 15: Augmented major 7th chords
  [
    { root: 'C', type: 'augmaj7', expected: ['C', 'E', 'G♯', 'B'] },
    { root: 'C♯', type: 'augmaj7', expected: ['C♯', 'E♯', 'G𝄪', 'B♯'] },
    { root: 'D', type: 'augmaj7', expected: ['D', 'F♯', 'A♯', 'C♯'] },
    { root: 'D♯', type: 'augmaj7', expected: ['D♯', 'F𝄪', 'A𝄪', 'C𝄪'] },
    { root: 'E', type: 'augmaj7', expected: ['E', 'G♯', 'B♯', 'D♯'] },
    { root: 'F', type: 'augmaj7', expected: ['F', 'A', 'C♯', 'E'] },
    { root: 'F♯', type: 'augmaj7', expected: ['F♯', 'A♯', 'C𝄪', 'E♯'] },
    { root: 'G', type: 'augmaj7', expected: ['G', 'B', 'D♯', 'F♯'] },
    { root: 'G♯', type: 'augmaj7', expected: ['G♯', 'B♯', 'D𝄪', 'F𝄪'] },
    { root: 'A', type: 'augmaj7', expected: ['A', 'C♯', 'E♯', 'G♯'] },
    { root: 'A♯', type: 'augmaj7', expected: ['A♯', 'C𝄪', 'E𝄪', 'G𝄪'] },
    { root: 'B', type: 'augmaj7', expected: ['B', 'D♯', 'F𝄪', 'A♯'] },
    { root: 'D♭', type: 'augmaj7', expected: ['D♭', 'F', 'A', 'C'] },
    { root: 'E♭', type: 'augmaj7', expected: ['E♭', 'G', 'B', 'D'] },
    { root: 'G♭', type: 'augmaj7', expected: ['G♭', 'B♭', 'D', 'F'] },
    { root: 'A♭', type: 'augmaj7', expected: ['A♭', 'C', 'E', 'G'] },
  ],

  // Progression 16: Chromatic progression with major triads
  [
    { root: 'C', type: 'major', expected: ['C', 'E', 'G'] },
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'D', type: 'major', expected: ['D', 'F♯', 'A'] },
    { root: 'D♯', type: 'major', expected: ['D♯', 'F𝄪', 'A♯'] },
    { root: 'E', type: 'major', expected: ['E', 'G♯', 'B'] },
    { root: 'F', type: 'major', expected: ['F', 'A', 'C'] },
    { root: 'F♯', type: 'major', expected: ['F♯', 'A♯', 'C♯'] },
    { root: 'G', type: 'major', expected: ['G', 'B', 'D'] },
    { root: 'G♯', type: 'major', expected: ['G♯', 'B♯', 'D♯'] },
    { root: 'A', type: 'major', expected: ['A', 'C♯', 'E'] },
    { root: 'A♯', type: 'major', expected: ['A♯', 'C𝄪', 'E♯'] },
    { root: 'B', type: 'major', expected: ['B', 'D♯', 'F♯'] },
    { root: 'C', type: 'major', expected: ['C', 'E', 'G'] },
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'D', type: 'major', expected: ['D', 'F♯', 'A'] },
    { root: 'D♯', type: 'major', expected: ['D♯', 'F𝄪', 'A♯'] },
  ],

  // Progression 17: Chromatic progression with minor triads
  [
    { root: 'C', type: 'minor', expected: ['C', 'E♭', 'G'] },
    { root: 'C♯', type: 'minor', expected: ['C♯', 'E', 'G♯'] },
    { root: 'D', type: 'minor', expected: ['D', 'F', 'A'] },
    { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
    { root: 'E', type: 'minor', expected: ['E', 'G', 'B'] },
    { root: 'F', type: 'minor', expected: ['F', 'A♭', 'C'] },
    { root: 'F♯', type: 'minor', expected: ['F♯', 'A', 'C♯'] },
    { root: 'G', type: 'minor', expected: ['G', 'B♭', 'D'] },
    { root: 'G♯', type: 'minor', expected: ['G♯', 'B', 'D♯'] },
    { root: 'A', type: 'minor', expected: ['A', 'C', 'E'] },
    { root: 'A♯', type: 'minor', expected: ['A♯', 'C♯', 'E♯'] },
    { root: 'B', type: 'minor', expected: ['B', 'D', 'F♯'] },
    { root: 'C', type: 'minor', expected: ['C', 'E♭', 'G'] },
    { root: 'C♯', type: 'minor', expected: ['C♯', 'E', 'G♯'] },
    { root: 'D', type: 'minor', expected: ['D', 'F', 'A'] },
    { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
  ],

  // Progression 18: Diminished triads chromatic
  [
    { root: 'C', type: 'diminished', expected: ['C', 'E♭', 'G♭'] },
    { root: 'C♯', type: 'diminished', expected: ['C♯', 'E', 'G'] },
    { root: 'D', type: 'diminished', expected: ['D', 'F', 'A♭'] },
    { root: 'D♯', type: 'diminished', expected: ['D♯', 'F♯', 'A'] },
    { root: 'E', type: 'diminished', expected: ['E', 'G', 'B♭'] },
    { root: 'F', type: 'diminished', expected: ['F', 'A♭', 'C♭'] },
    { root: 'F♯', type: 'diminished', expected: ['F♯', 'A', 'C'] },
    { root: 'G', type: 'diminished', expected: ['G', 'B♭', 'D♭'] },
    { root: 'G♯', type: 'diminished', expected: ['G♯', 'B', 'D'] },
    { root: 'A', type: 'diminished', expected: ['A', 'C', 'E♭'] },
    { root: 'A♯', type: 'diminished', expected: ['A♯', 'C♯', 'E'] },
    { root: 'B', type: 'diminished', expected: ['B', 'D', 'F'] },
    { root: 'C', type: 'diminished', expected: ['C', 'E♭', 'G♭'] },
    { root: 'C♯', type: 'diminished', expected: ['C♯', 'E', 'G'] },
    { root: 'D', type: 'diminished', expected: ['D', 'F', 'A♭'] },
    { root: 'D♯', type: 'diminished', expected: ['D♯', 'F♯', 'A'] },
  ],

  // Progression 19: Mixed enharmonic with all types
  [
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'D♭', type: 'minor', expected: ['D♭', 'F♭', 'A♭'] },
    { root: 'D♯', type: 'diminished', expected: ['D♯', 'F♯', 'A'] },
    { root: 'E♭', type: 'augmented', expected: ['E♭', 'G', 'B'] },
    { root: 'F♯', type: 'maj7', expected: ['F♯', 'A♯', 'C♯', 'E♯'] },
    { root: 'G♭', type: 'm7', expected: ['G♭', 'B𝄫', 'D♭', 'F♭'] },
    { root: 'G♯', type: '7', expected: ['G♯', 'B♯', 'D♯', 'F♯'] },
    { root: 'A♭', type: 'dim7', expected: ['A♭', 'C♭', 'E𝄫', 'G𝄫'] },
    { root: 'A♯', type: 'augmaj7', expected: ['A♯', 'C𝄪', 'E𝄪', 'G𝄪'] },
    { root: 'B♭', type: 'major', expected: ['B♭', 'D', 'F'] },
    { root: 'C♭', type: 'minor', expected: ['C♭', 'E𝄫', 'G♭'] },
    { root: 'C♯', type: 'diminished', expected: ['C♯', 'E', 'G'] },
    { root: 'D♭', type: 'augmented', expected: ['D♭', 'F', 'A'] },
    { root: 'D♯', type: 'maj7', expected: ['D♯', 'F𝄪', 'A♯', 'C𝄪'] },
    { root: 'E♭', type: 'm7', expected: ['E♭', 'G♭', 'B♭', 'D♭'] },
    { root: 'F♯', type: '7', expected: ['F♯', 'A♯', 'C♯', 'E'] },
  ],

  // Progression 20: Theoretical keys with double accidentals
  [
    { root: 'C♭', type: 'major', expected: ['C♭', 'E♭', 'G♭'] },
    { root: 'C♭', type: 'minor', expected: ['C♭', 'E𝄫', 'G♭'] },
    { root: 'C♭', type: 'diminished', expected: ['C♭', 'E𝄫', 'G𝄫'] },
    { root: 'C♭', type: 'augmented', expected: ['C♭', 'E♭', 'G'] },
    { root: 'F♭', type: 'major', expected: ['F♭', 'A♭', 'C♭'] },
    { root: 'F♭', type: 'minor', expected: ['F♭', 'A𝄫', 'C♭'] },
    { root: 'F♭', type: 'diminished', expected: ['F♭', 'A𝄫', 'C𝄫'] },
    { root: 'F♭', type: 'augmented', expected: ['F♭', 'A♭', 'C'] },
    { root: 'B𝄫', type: 'major', expected: ['B𝄫', 'D♭', 'F♭'] },
    { root: 'B𝄫', type: 'minor', expected: ['B𝄫', 'D𝄫', 'F♭'] },
    { root: 'B𝄫', type: 'diminished', expected: ['B𝄫', 'D𝄫', 'F𝄫'] },
    { root: 'B𝄫', type: 'augmented', expected: ['B𝄫', 'D♭', 'F'] },
    { root: 'E𝄫', type: 'major', expected: ['E𝄫', 'G♭', 'B𝄫'] },
    { root: 'A𝄫', type: 'major', expected: ['A𝄫', 'C♭', 'E𝄫'] },
    { root: 'D𝄫', type: 'major', expected: ['D𝄫', 'F♭', 'A𝄫'] },
    { root: 'G𝄫', type: 'major', expected: ['G𝄫', 'B𝄫', 'D𝄫'] },
  ],

  // Progression 21: Sharp keys with double sharps
  [
    { root: 'D♯', type: 'major', expected: ['D♯', 'F𝄪', 'A♯'] },
    { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
    { root: 'A♯', type: 'major', expected: ['A♯', 'C𝄪', 'E♯'] },
    { root: 'A♯', type: 'minor', expected: ['A♯', 'C♯', 'E♯'] },
    { root: 'E♯', type: 'major', expected: ['E♯', 'G𝄪', 'B♯'] },
    { root: 'E♯', type: 'minor', expected: ['E♯', 'G♯', 'B♯'] },
    { root: 'B♯', type: 'major', expected: ['B♯', 'D𝄪', 'F𝄪'] },
    { root: 'B♯', type: 'minor', expected: ['B♯', 'D♯', 'F𝄪'] },
    { root: 'D♯', type: 'maj7', expected: ['D♯', 'F𝄪', 'A♯', 'C𝄪'] },
    { root: 'A♯', type: 'maj7', expected: ['A♯', 'C𝄪', 'E♯', 'G𝄪'] },
    { root: 'E♯', type: 'maj7', expected: ['E♯', 'G𝄪', 'B♯', 'D𝄪'] },
    { root: 'B♯', type: 'maj7', expected: ['B♯', 'D𝄪', 'F𝄪', 'A𝄪'] },
    { root: 'D♯', type: '7', expected: ['D♯', 'F𝄪', 'A♯', 'C♯'] },
    { root: 'A♯', type: '7', expected: ['A♯', 'C𝄪', 'E♯', 'G♯'] },
    { root: 'E♯', type: '7', expected: ['E♯', 'G𝄪', 'B♯', 'D♯'] },
    { root: 'B♯', type: '7', expected: ['B♯', 'D𝄪', 'F𝄪', 'A♯'] },
  ],

  // Progression 22: Flat keys with double flats
  [
    { root: 'C♭', type: 'major', expected: ['C♭', 'E♭', 'G♭'] },
    { root: 'C♭', type: 'minor', expected: ['C♭', 'E𝄫', 'G♭'] },
    { root: 'F♭', type: 'major', expected: ['F♭', 'A♭', 'C♭'] },
    { root: 'F♭', type: 'minor', expected: ['F♭', 'A𝄫', 'C♭'] },
    { root: 'B𝄫', type: 'major', expected: ['B𝄫', 'D♭', 'F♭'] },
    { root: 'B𝄫', type: 'minor', expected: ['B𝄫', 'D𝄫', 'F♭'] },
    { root: 'E𝄫', type: 'major', expected: ['E𝄫', 'G♭', 'B𝄫'] },
    { root: 'A𝄫', type: 'major', expected: ['A𝄫', 'C♭', 'E𝄫'] },
    { root: 'C♭', type: 'm7', expected: ['C♭', 'E𝄫', 'G♭', 'B𝄫'] },
    { root: 'F♭', type: 'm7', expected: ['F♭', 'A𝄫', 'C♭', 'E𝄫'] },
    { root: 'B𝄫', type: 'm7', expected: ['B𝄫', 'D𝄫', 'F♭', 'A𝄫'] },
    { root: 'C♭', type: 'dim7', expected: ['C♭', 'E𝄫', 'G𝄫', 'B'] },
    { root: 'F♭', type: 'dim7', expected: ['F♭', 'A𝄫', 'C𝄫', 'E'] },
    { root: 'B𝄫', type: 'dim7', expected: ['B𝄫', 'D𝄫', 'F𝄫', 'A'] },
    { root: 'G♭', type: 'minor', expected: ['G♭', 'B𝄫', 'D♭'] },
    { root: 'G♭', type: 'dim7', expected: ['G♭', 'B𝄫', 'D𝄫', 'F𝄫'] },
  ],

  // Progression 23: Alternating sharp/flat enharmonic pairs
  [
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'D♭', type: 'major', expected: ['D♭', 'F', 'A♭'] },
    { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
    { root: 'E♭', type: 'minor', expected: ['E♭', 'G♭', 'B♭'] },
    { root: 'F♯', type: 'major', expected: ['F♯', 'A♯', 'C♯'] },
    { root: 'G♭', type: 'major', expected: ['G♭', 'B♭', 'D♭'] },
    { root: 'G♯', type: 'minor', expected: ['G♯', 'B', 'D♯'] },
    { root: 'A♭', type: 'minor', expected: ['A♭', 'C♭', 'E♭'] },
    { root: 'A♯', type: 'major', expected: ['A♯', 'C𝄪', 'E♯'] },
    { root: 'B♭', type: 'major', expected: ['B♭', 'D', 'F'] },
    { root: 'C♯', type: '7', expected: ['C♯', 'E♯', 'G♯', 'B'] },
    { root: 'D♭', type: '7', expected: ['D♭', 'F', 'A♭', 'C♭'] },
    { root: 'F♯', type: 'm7', expected: ['F♯', 'A', 'C♯', 'E'] },
    { root: 'G♭', type: 'm7', expected: ['G♭', 'B𝄫', 'D♭', 'F♭'] },
    { root: 'A♯', type: 'dim7', expected: ['A♯', 'C♯', 'E', 'G'] },
    { root: 'B♭', type: 'dim7', expected: ['B♭', 'D♭', 'F♭', 'A𝄫'] },
  ],

  // Progression 24: All diminished 7th chords (enharmonically equivalent sets)
  [
    { root: 'C', type: 'dim7', expected: ['C', 'E♭', 'G♭', 'B𝄫'] },
    { root: 'C♯', type: 'dim7', expected: ['C♯', 'E', 'G', 'B♭'] },
    { root: 'D', type: 'dim7', expected: ['D', 'F', 'A♭', 'C♭'] },
    { root: 'D♯', type: 'dim7', expected: ['D♯', 'F♯', 'A', 'C'] },
    { root: 'E', type: 'dim7', expected: ['E', 'G', 'B♭', 'D♭'] },
    { root: 'F', type: 'dim7', expected: ['F', 'A♭', 'C♭', 'E𝄫'] },
    { root: 'F♯', type: 'dim7', expected: ['F♯', 'A', 'C', 'E♭'] },
    { root: 'G', type: 'dim7', expected: ['G', 'B♭', 'D♭', 'F♭'] },
    { root: 'G♯', type: 'dim7', expected: ['G♯', 'B', 'D', 'F'] },
    { root: 'A', type: 'dim7', expected: ['A', 'C', 'E♭', 'G♭'] },
    { root: 'A♯', type: 'dim7', expected: ['A♯', 'C♯', 'E', 'G'] },
    { root: 'B', type: 'dim7', expected: ['B', 'D', 'F', 'A♭'] },
    { root: 'C♭', type: 'dim7', expected: ['C♭', 'E𝄫', 'G𝄫', 'B'] },
    { root: 'D♭', type: 'dim7', expected: ['D♭', 'F♭', 'A𝄫', 'C𝄫'] },
    { root: 'E♭', type: 'dim7', expected: ['E♭', 'G♭', 'B𝄫', 'D𝄫'] },
    { root: 'G♭', type: 'dim7', expected: ['G♭', 'B𝄫', 'D𝄫', 'F𝄫'] },
  ],

  // Progression 25: Mixed theoretical keys progression
  [
    { root: 'C♭', type: 'major', expected: ['C♭', 'E♭', 'G♭'] },
    { root: 'G♯', type: 'major', expected: ['G♯', 'B♯', 'D♯'] },
    { root: 'A♯', type: 'major', expected: ['A♯', 'C𝄪', 'E♯'] },
    { root: 'F♭', type: 'minor', expected: ['F♭', 'A𝄫', 'C♭'] },
    { root: 'B𝄫', type: 'major', expected: ['B𝄫', 'D♭', 'F♭'] },
    { root: 'D♯', type: 'minor', expected: ['D♯', 'F♯', 'A♯'] },
    { root: 'G♭', type: 'minor', expected: ['G♭', 'B𝄫', 'D♭'] },
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'C♭', type: 'm7', expected: ['C♭', 'E𝄫', 'G♭', 'B𝄫'] },
    { root: 'G♯', type: 'maj7', expected: ['G♯', 'B♯', 'D♯', 'F𝄪'] },
    { root: 'A♯', type: '7', expected: ['A♯', 'C𝄪', 'E♯', 'G♯'] },
    { root: 'F♭', type: 'dim7', expected: ['F♭', 'A𝄫', 'C𝄫', 'E'] },
    { root: 'B𝄫', type: 'augmaj7', expected: ['B𝄫', 'D♭', 'F', 'A♭'] },
    { root: 'D♯', type: 'augmented', expected: ['D♯', 'F𝄪', 'A𝄪'] },
    { root: 'G♭', type: 'augmented', expected: ['G♭', 'B♭', 'D'] },
    { root: 'C♯', type: 'diminished', expected: ['C♯', 'E', 'G'] },
  ],

  // Progression 26: Seventh chords with enharmonic roots
  [
    { root: 'C', type: 'maj7', expected: ['C', 'E', 'G', 'B'] },
    { root: 'C♯', type: 'maj7', expected: ['C♯', 'E♯', 'G♯', 'B♯'] },
    { root: 'D♭', type: 'maj7', expected: ['D♭', 'F', 'A♭', 'C'] },
    { root: 'D', type: 'maj7', expected: ['D', 'F♯', 'A', 'C♯'] },
    { root: 'D♯', type: 'maj7', expected: ['D♯', 'F𝄪', 'A♯', 'C𝄪'] },
    { root: 'E♭', type: 'maj7', expected: ['E♭', 'G', 'B♭', 'D'] },
    { root: 'E', type: 'maj7', expected: ['E', 'G♯', 'B', 'D♯'] },
    { root: 'F', type: 'maj7', expected: ['F', 'A', 'C', 'E'] },
    { root: 'F♯', type: 'maj7', expected: ['F♯', 'A♯', 'C♯', 'E♯'] },
    { root: 'G♭', type: 'maj7', expected: ['G♭', 'B♭', 'D♭', 'F'] },
    { root: 'G', type: 'maj7', expected: ['G', 'B', 'D', 'F♯'] },
    { root: 'G♯', type: 'maj7', expected: ['G♯', 'B♯', 'D♯', 'F𝄪'] },
    { root: 'A♭', type: 'maj7', expected: ['A♭', 'C', 'E♭', 'G'] },
    { root: 'A', type: 'maj7', expected: ['A', 'C♯', 'E', 'G♯'] },
    { root: 'A♯', type: 'maj7', expected: ['A♯', 'C𝄪', 'E♯', 'G𝄪'] },
    { root: 'B♭', type: 'maj7', expected: ['B♭', 'D', 'F', 'A'] },
  ],

  // Progression 27: Minor 7th chords chromatic
  [
    { root: 'C', type: 'm7', expected: ['C', 'E♭', 'G', 'B♭'] },
    { root: 'C♯', type: 'm7', expected: ['C♯', 'E', 'G♯', 'B'] },
    { root: 'D', type: 'm7', expected: ['D', 'F', 'A', 'C'] },
    { root: 'D♯', type: 'm7', expected: ['D♯', 'F♯', 'A♯', 'C♯'] },
    { root: 'E', type: 'm7', expected: ['E', 'G', 'B', 'D'] },
    { root: 'F', type: 'm7', expected: ['F', 'A♭', 'C', 'E♭'] },
    { root: 'F♯', type: 'm7', expected: ['F♯', 'A', 'C♯', 'E'] },
    { root: 'G', type: 'm7', expected: ['G', 'B♭', 'D', 'F'] },
    { root: 'G♯', type: 'm7', expected: ['G♯', 'B', 'D♯', 'F♯'] },
    { root: 'A', type: 'm7', expected: ['A', 'C', 'E', 'G'] },
    { root: 'A♯', type: 'm7', expected: ['A♯', 'C♯', 'E♯', 'G♯'] },
    { root: 'B', type: 'm7', expected: ['B', 'D', 'F♯', 'A'] },
    { root: 'D♭', type: 'm7', expected: ['D♭', 'F♭', 'A♭', 'C♭'] },
    { root: 'E♭', type: 'm7', expected: ['E♭', 'G♭', 'B♭', 'D♭'] },
    { root: 'G♭', type: 'm7', expected: ['G♭', 'B𝄫', 'D♭', 'F♭'] },
    { root: 'A♭', type: 'm7', expected: ['A♭', 'C♭', 'E♭', 'G♭'] },
  ],

  // Progression 28: Dominant 7th chords chromatic
  [
    { root: 'C', type: '7', expected: ['C', 'E', 'G', 'B♭'] },
    { root: 'C♯', type: '7', expected: ['C♯', 'E♯', 'G♯', 'B'] },
    { root: 'D', type: '7', expected: ['D', 'F♯', 'A', 'C'] },
    { root: 'D♯', type: '7', expected: ['D♯', 'F𝄪', 'A♯', 'C♯'] },
    { root: 'E', type: '7', expected: ['E', 'G♯', 'B', 'D'] },
    { root: 'F', type: '7', expected: ['F', 'A', 'C', 'E♭'] },
    { root: 'F♯', type: '7', expected: ['F♯', 'A♯', 'C♯', 'E'] },
    { root: 'G', type: '7', expected: ['G', 'B', 'D', 'F'] },
    { root: 'G♯', type: '7', expected: ['G♯', 'B♯', 'D♯', 'F♯'] },
    { root: 'A', type: '7', expected: ['A', 'C♯', 'E', 'G'] },
    { root: 'A♯', type: '7', expected: ['A♯', 'C𝄪', 'E♯', 'G♯'] },
    { root: 'B', type: '7', expected: ['B', 'D♯', 'F♯', 'A'] },
    { root: 'D♭', type: '7', expected: ['D♭', 'F', 'A♭', 'C♭'] },
    { root: 'E♭', type: '7', expected: ['E♭', 'G', 'B♭', 'D♭'] },
    { root: 'G♭', type: '7', expected: ['G♭', 'B♭', 'D♭', 'F♭'] },
    { root: 'A♭', type: '7', expected: ['A♭', 'C', 'E♭', 'G♭'] },
  ],

  // Progression 29: Augmented major 7th chromatic
  [
    { root: 'C', type: 'augmaj7', expected: ['C', 'E', 'G♯', 'B'] },
    { root: 'C♯', type: 'augmaj7', expected: ['C♯', 'E♯', 'G𝄪', 'B♯'] },
    { root: 'D', type: 'augmaj7', expected: ['D', 'F♯', 'A♯', 'C♯'] },
    { root: 'D♯', type: 'augmaj7', expected: ['D♯', 'F𝄪', 'A𝄪', 'C𝄪'] },
    { root: 'E', type: 'augmaj7', expected: ['E', 'G♯', 'B♯', 'D♯'] },
    { root: 'F', type: 'augmaj7', expected: ['F', 'A', 'C♯', 'E'] },
    { root: 'F♯', type: 'augmaj7', expected: ['F♯', 'A♯', 'C𝄪', 'E♯'] },
    { root: 'G', type: 'augmaj7', expected: ['G', 'B', 'D♯', 'F♯'] },
    { root: 'G♯', type: 'augmaj7', expected: ['G♯', 'B♯', 'D𝄪', 'F𝄪'] },
    { root: 'A', type: 'augmaj7', expected: ['A', 'C♯', 'E♯', 'G♯'] },
    { root: 'A♯', type: 'augmaj7', expected: ['A♯', 'C𝄪', 'E𝄪', 'G𝄪'] },
    { root: 'B', type: 'augmaj7', expected: ['B', 'D♯', 'F𝄪', 'A♯'] },
    { root: 'D♭', type: 'augmaj7', expected: ['D♭', 'F', 'A', 'C'] },
    { root: 'E♭', type: 'augmaj7', expected: ['E♭', 'G', 'B', 'D'] },
    { root: 'G♭', type: 'augmaj7', expected: ['G♭', 'B♭', 'D', 'F'] },
    { root: 'A♭', type: 'augmaj7', expected: ['A♭', 'C', 'E', 'G'] },
  ],

  // Progression 30: Complex mixed progression with all enharmonic challenges
  [
    { root: 'C♯', type: 'major', expected: ['C♯', 'E♯', 'G♯'] },
    { root: 'D♭', type: 'minor', expected: ['D♭', 'F♭', 'A♭'] },
    { root: 'D♯', type: 'diminished', expected: ['D♯', 'F♯', 'A'] },
    { root: 'E♭', type: 'augmented', expected: ['E♭', 'G', 'B'] },
    { root: 'F♯', type: 'maj7', expected: ['F♯', 'A♯', 'C♯', 'E♯'] },
    { root: 'G♭', type: 'm7', expected: ['G♭', 'B𝄫', 'D♭', 'F♭'] },
    { root: 'G♯', type: '7', expected: ['G♯', 'B♯', 'D♯', 'F♯'] },
    { root: 'A♭', type: 'dim7', expected: ['A♭', 'C♭', 'E𝄫', 'G𝄫'] },
    { root: 'A♯', type: 'augmaj7', expected: ['A♯', 'C𝄪', 'E𝄪', 'G𝄪'] },
    { root: 'B♭', type: 'major', expected: ['B♭', 'D', 'F'] },
    { root: 'C♭', type: 'minor', expected: ['C♭', 'E𝄫', 'G♭'] },
    { root: 'C♯', type: 'diminished', expected: ['C♯', 'E', 'G'] },
    { root: 'D♭', type: 'augmented', expected: ['D♭', 'F', 'A'] },
    { root: 'D♯', type: 'maj7', expected: ['D♯', 'F𝄪', 'A♯', 'C𝄪'] },
    { root: 'E♭', type: 'm7', expected: ['E♭', 'G♭', 'B♭', 'D♭'] },
    { root: 'F♯', type: '7', expected: ['F♯', 'A♯', 'C♯', 'E'] },
  ],
];

console.log('=== Rigorous Test Suite: 30 Enharmonic 16-Chord Progressions ===\n');

let totalPassed = 0;
let totalFailed = 0;
const allFailures = [];

for (let progIndex = 0; progIndex < progressions.length; progIndex++) {
  const progression = progressions[progIndex];
  console.log(`\n--- Progression ${progIndex + 1}/30 ---`);
  
  let progPassed = 0;
  let progFailed = 0;
  const progFailures = [];
  
  for (let chordIndex = 0; chordIndex < progression.length; chordIndex++) {
    const chord = progression[chordIndex];
    const result = verifyChord(chord.root, chord.type, chord.expected);
    
    if (result.matches) {
      progPassed++;
      totalPassed++;
    } else {
      progFailed++;
      totalFailed++;
      progFailures.push({
        index: chordIndex + 1,
        root: chord.root,
        type: chord.type,
        expected: chord.expected,
        got: result.result,
        error: result.error
      });
    }
  }
  
  console.log(`  Passed: ${progPassed}/${progression.length}`);
  console.log(`  Failed: ${progFailed}/${progression.length}`);
  
  if (progFailures.length > 0) {
    console.log(`  Failures:`);
    progFailures.forEach(f => {
      if (f.error) {
        console.log(`    Chord ${f.index}: ${f.root} ${f.type} - Error: ${f.error}`);
      } else {
        console.log(`    Chord ${f.index}: ${f.root} ${f.type}`);
        console.log(`      Expected: [${f.expected.join(', ')}]`);
        console.log(`      Got:      [${f.got.join(', ')}]`);
      }
    });
    allFailures.push({
      progression: progIndex + 1,
      failures: progFailures
    });
  }
}

console.log(`\n\n=== FINAL RESULTS ===`);
console.log(`Total Progressions: 30`);
console.log(`Total Chords Tested: ${30 * 16} = ${30 * 16}`);
console.log(`Total Passed: ${totalPassed}`);
console.log(`Total Failed: ${totalFailed}`);
console.log(`Success Rate: ${((totalPassed / (30 * 16)) * 100).toFixed(2)}%`);

if (allFailures.length > 0) {
  console.log(`\n=== FAILURE SUMMARY ===`);
  console.log(`Progressions with failures: ${allFailures.length}/30`);
  allFailures.forEach(f => {
    console.log(`\n  Progression ${f.progression}: ${f.failures.length} failure(s)`);
  });
  process.exit(1);
} else {
  console.log(`\n✓ ALL TESTS PASSED! All 480 chords (30 progressions × 16 chords) spelled correctly!`);
  process.exit(0);
}

