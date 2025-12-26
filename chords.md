# All C Chord Types

Complete reference for all C chords supported by the app.

## Input Format

```javascript
spellChord("C", chordType)
```

## Triads (3 notes)

### C Major
- **Input:** `spellChord("C", "major")`
- **Output:** `[C, E, G]`
- **Intervals:** Root, Major 3rd, Perfect 5th

### C Minor
- **Input:** `spellChord("C", "minor")`
- **Output:** `[C, E♭, G]`
- **Intervals:** Root, Minor 3rd, Perfect 5th

### C Diminished
- **Input:** `spellChord("C", "diminished")`
- **Output:** `[C, E♭, G♭]`
- **Intervals:** Root, Minor 3rd, Diminished 5th

### C Augmented
- **Input:** `spellChord("C", "augmented")`
- **Output:** `[C, E, G♯]`
- **Intervals:** Root, Major 3rd, Augmented 5th

## Seventh Chords (4 notes)

### C Major 7th
- **Input:** `spellChord("C", "maj7")`
- **Output:** `[C, E, G, B]`
- **Intervals:** Root, Major 3rd, Perfect 5th, Major 7th

### C Dominant 7th
- **Input:** `spellChord("C", "7")`
- **Output:** `[C, E, G, B♭]`
- **Intervals:** Root, Major 3rd, Perfect 5th, Minor 7th

### C Minor 7th
- **Input:** `spellChord("C", "m7")`
- **Output:** `[C, E♭, G, B♭]`
- **Intervals:** Root, Minor 3rd, Perfect 5th, Minor 7th

### C Diminished 7th
- **Input:** `spellChord("C", "dim7")`
- **Output:** `[C, E♭, G♭, B𝄫]`
- **Intervals:** Root, Minor 3rd, Diminished 5th, Diminished 7th

### C Augmented Major 7th
- **Input:** `spellChord("C", "augmaj7")`
- **Output:** `[C, E, G♯, B]`
- **Intervals:** Root, Major 3rd, Augmented 5th, Major 7th

## Quick Reference Table

| Chord Name | Input | Output |
|------------|-------|--------|
| C major | `spellChord("C", "major")` | `[C, E, G]` |
| C minor | `spellChord("C", "minor")` | `[C, E♭, G]` |
| C diminished | `spellChord("C", "diminished")` | `[C, E♭, G♭]` |
| C augmented | `spellChord("C", "augmented")` | `[C, E, G♯]` |
| C major 7th | `spellChord("C", "maj7")` | `[C, E, G, B]` |
| C dominant 7th | `spellChord("C", "7")` | `[C, E, G, B♭]` |
| C minor 7th | `spellChord("C", "m7")` | `[C, E♭, G, B♭]` |
| C diminished 7th | `spellChord("C", "dim7")` | `[C, E♭, G♭, B𝄫]` |
| C augmented major 7th | `spellChord("C", "augmaj7")` | `[C, E, G♯, B]` |

## Notes

- All spellings follow **letter-name integrity** rules (each chord tone uses a different letter)
- Accidentals are calculated to match required interval qualities
- The app uses deterministic chord spelling based on music theory principles
- All 9 chord types are supported for any root note (not just C)

## Usage Example

```javascript
import { spellChord } from './src/chord-spelling.js';

// Get C major triad
const cmaj = spellChord("C", "major");
console.log(cmaj); // [C, E, G]

// Get C minor 7th
const cm7 = spellChord("C", "m7");
console.log(cm7); // [C, E♭, G, B♭]
```

