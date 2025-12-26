# Enharmonic Spelling System

## Current Implementation

The current system uses a **heuristic-based approach** with hardcoded detections for specific rare keys. It works by:

1. **Detecting chord structure** from MIDI notes (identifying root, checking for minor third, etc.)
2. **Pattern matching** for known rare keys (C♭, G♯, F♭, D♯, A♯, G♭ minor, B𝄫)
3. **Heuristic rules** for common keys (defaulting to sharps for C#, flats for Eb, etc.)
4. **Hardcoded spellings** for specific cases (e.g., "if C# major, then F → E♯")

### Limitations

- **Not algorithmic**: Doesn't build chords from first principles
- **Incomplete coverage**: Only handles specific rare keys that have been explicitly coded
- **No letter-name integrity check**: Doesn't verify that chord tones use different letter names
- **MIDI-only context**: Cannot distinguish enharmonic equivalents (e.g., C# vs Db) without additional context
- **Hard to extend**: Adding new chord types or rare keys requires manual coding

## Ideal Algorithmic Approach (from Rules)

The ideal system should follow these principles:

### 1. Letter-Name Integrity
- Triad: root – 3rd letter – 5th letter (e.g., C → E → G)
- Seventh: root – 3rd – 5th – 7th letter
- Never skip or duplicate letter names

### 2. Interval Quality by Alteration
- Parse root: letter + accidental(s)
- Determine letter steps: C → E (3rd), C → G (5th)
- Assign accidentals to match required interval quality:
  - Major 3rd: 4 semitones
  - Minor 3rd: 3 semitones
  - Perfect 5th: 7 semitones
  - Diminished 5th: 6 semitones
  - Augmented 5th: 8 semitones

### 3. Algorithmic Construction
```
Given: root name (e.g., "G♯"), chord type (e.g., "major")
1. Parse root: G + ♯
2. Determine letters: G → B (3rd), G → D (5th)
3. Calculate required intervals: major 3rd (4 semitones), perfect 5th (7 semitones)
4. Assign accidentals:
   - G♯ to B: G♯ = 8, B = 11 → 3 semitones, need +1 → B♯
   - G♯ to D: G♯ = 8, D = 2 → 6 semitones, need +1 → D♯
5. Result: G♯ – B♯ – D♯
```

## GitHub Libraries for Reference

### JavaScript/TypeScript
- **teoria.js** (`saebekassebil/teoria`): Note objects, `note.enharmonics()`, chord parsing
- **12tet** (`nccurry/12tet`): TypeScript library with enharmonic utilities
- **Tonal.js**: Comprehensive music theory library with chord spelling

### Other Languages
- **MusicTheory (Swift)**: Notes, intervals, chords, scales
- **music_notes (Dart)**: Note + accidental representations, enharmonic operations
- **tonality (Haskell)**: Tonal pitch classes distinguishing enharmonic spellings
- **ChordParser (Python)**: Parse chord symbols, generate enharmonically correct names

## Potential Improvements

### Short-term
1. **Add letter-name integrity checks**: Verify chord tones use different letters
2. **Extend to more chord types**: Diminished, augmented, seventh chords
3. **Better detection**: Use interval analysis rather than pattern matching

### Long-term
1. **Refactor to algorithmic approach**: Build chords from root + chord type
2. **Parse root names**: Accept root as string (e.g., "G♯") rather than inferring from MIDI
3. **Context-aware**: Accept key signature or chord progression context
4. **Library integration**: Consider using or adapting code from teoria.js or Tonal.js

## Current Test Coverage

- ✅ Standard major/minor triads (24/24)
- ✅ Rare keys with double accidentals (C♭, G♯, F♭, D♯, A♯)
- ✅ Theoretical keys (G♭ minor, B𝄫 major)
- ❌ Diminished triads
- ❌ Augmented triads
- ❌ Seventh chords
- ❌ Letter-name integrity validation

## Example: Current vs. Ideal

**Current approach:**
```javascript
// Hardcoded detection
if (rootIndex === 8 && !hasMinorThird && 
    contextMidiNotes.some(n => (n % 12) === 0) && 
    contextMidiNotes.some(n => (n % 12) === 3)) {
  // G# major detected
  if (noteIndex === 0) result = 'B♯';
  if (noteIndex === 3) result = 'D♯';
}
```

**Ideal approach:**
```javascript
function spellChord(rootName, chordType) {
  const root = parseNote(rootName); // { letter: 'G', accidental: '♯' }
  const intervals = getIntervals(chordType); // [4, 7] for major triad
  const letters = getLetterSteps(root.letter, intervals.length); // ['G', 'B', 'D']
  
  return letters.map((letter, i) => {
    const requiredInterval = intervals[i];
    const actualInterval = getSemitoneDistance(root, letter);
    const accidental = calculateAccidental(requiredInterval, actualInterval);
    return letter + accidental;
  });
}
```

## References

- [Enharmonic Rules System Prompt](./ENHARMONIC_RULES.md) (provided by user)
- [GitHub: teoria.js](https://github.com/saebekassebil/teoria)
- [GitHub: 12tet](https://github.com/nccurry/12tet)
- [GitHub: Tonal.js](https://github.com/tonaljs/tonal)

