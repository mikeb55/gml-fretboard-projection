# Chord Extensions Reference

## Supported Chord Types

The app can spell the following chord types:

### Triads (3 notes)
- **`"major"`** - Major triad (root, major 3rd, perfect 5th)
- **`"minor"`** - Minor triad (root, minor 3rd, perfect 5th)
- **`"diminished"`** - Diminished triad (root, minor 3rd, diminished 5th)
- **`"augmented"`** - Augmented triad (root, major 3rd, augmented 5th)

### Seventh Chords (4 notes)
- **`"maj7"`** - Major 7th chord (major triad + major 7th)
- **`"7"`** - Dominant 7th chord (major triad + minor 7th)
- **`"m7"`** - Minor 7th chord (minor triad + minor 7th)
- **`"dim7"`** - Diminished 7th chord (diminished triad + diminished 7th)
- **`"augmaj7"`** - Augmented major 7th chord (augmented triad + major 7th)

## All C Chords

### Input Format
```javascript
spellChord(rootName, chordType)
```

### C Chord Examples

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

## Root Name Formats

Root names can include:

- **Natural notes**: `"C"`, `"D"`, `"E"`, `"F"`, `"G"`, `"A"`, `"B"`
- **Sharps**: `"C♯"`, `"D♯"`, `"F♯"`, `"G♯"`, `"A♯"`
- **Flats**: `"D♭"`, `"E♭"`, `"G♭"`, `"A♭"`, `"B♭"`
- **Double sharps**: `"C𝄪"`, `"D𝄪"`, `"F𝄪"`, `"G𝄪"`, `"A𝄪"`
- **Double flats**: `"C𝄫"`, `"D𝄫"`, `"E𝄫"`, `"F𝄫"`, `"G𝄫"`, `"A𝄫"`, `"B𝄫"`

## Usage in UI

The UI automatically infers chord type from MIDI notes when displaying chords. The `inferChordFromMidi()` function detects:

- **Triads**: major, minor, diminished, augmented
- **Seventh chords**: maj7, 7, m7, dim7, augmaj7

Then uses `spellChord()` to get the correct spelling.

## Examples

```javascript
import { spellChord } from './src/chord-spelling.js';

// Basic triads
spellChord("C", "major")      // [C, E, G]
spellChord("C", "minor")      // [C, E♭, G]
spellChord("C♯", "major")     // [C♯, E♯, G♯]
spellChord("E♭", "minor")     // [E♭, G♭, B♭]

// Seventh chords
spellChord("C", "maj7")       // [C, E, G, B]
spellChord("C", "7")          // [C, E, G, B♭]
spellChord("C", "m7")         // [C, E♭, G, B♭]
spellChord("C", "dim7")       // [C, E♭, G♭, B𝄫]

// Rare/theoretical keys
spellChord("G♯", "major")    // [G♯, B♯, D♯]
spellChord("C♭", "major")    // [C♭, E♭, G♭]
spellChord("F♭", "minor")     // [F♭, A𝄫, C♭]
```

## Limitations

Currently **not supported**:
- Extended chords (9th, 11th, 13th)
- Suspended chords (sus2, sus4)
- Add chords (add9, add11)
- Altered chords (7♭9, 7♯11, etc.)
- Slash chords (inversions with different bass notes)

These could be added in the future by extending the `intervals` object in `chord-spelling.js`.

