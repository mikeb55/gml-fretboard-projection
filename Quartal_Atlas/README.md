# GML – Quartal Atlas

Quartal Atlas is a visual guitar fretboard tool for exploring quartal harmonies (4-note voicings built in perfect fourths). It is a sibling project to **Triad Atlas**, sharing the same design philosophy and visual approach.

**Current Status:** v1.0 - Core functionality complete

## Design Philosophy

**Quartal Atlas is a fixed lens, not a generative engine.**

- **Descriptive, not generative** — Shows quartal voicings visually
- **Non-authorial** — Makes no musical decisions
- **Stability and clarity prioritized** — Focused on teaching voice-leading, inversion flow, and quartal harmony
- **Visual/practice-based** — Fixed rules, frozen behavior, no music generation or export

Quartal Atlas answers:
> *"What is this quartal voicing, and how can I understand it?"*

## Relationship to Triad Atlas

**Quartal Atlas** and **Triad Atlas** are sibling projects:

### Triad Atlas
- 3-note triads (R, 3, 5)
- 3 inversions
- String sets: 6-4, 5-3, 4-2, 3-1

### Quartal Atlas
- 4-note quartal voicings (R, 4, 7, 10)
- 4 inversions
- String sets: 6-3, 5-2, 4-1

Both projects share:
- Same visual design language
- Same inversion flow navigation
- Same practice mode concepts
- Same limited fretboard view (LFV)
- Same color/B&W modes

## Features

### Core Functionality
- **Quartal Voicing Visualization** — Display 4-note quartal voicings on guitar fretboard
- **Inversion Flow** — Navigate through 4 inversions (Root, 1st, 2nd, 3rd)
- **String Set Selection** — Choose from 6-3, 5-2, or 4-1 string sets
- **Quartal Types** — Perfect (all perfect 4ths) or Mixed (perfect + augmented 4th)

### Visual Features
- **Color Mode** — Color-coded notes: Root (red), Fourth (blue), Seventh (orange), Tenth (green)
- **Black & White Mode** — Monochrome display
- **Top Voice Emphasis** — Visual highlighting of the highest note
- **Limited Fretboard View (LFV)** — Restrict view to specific fret ranges
- **Focus Controls** — Show target note only, hide context notes

### Practice Features
- **Practice Mode** — Simplified UI for focused practice
- **Inversion Navigation** — Previous/Next buttons for smooth flow
- **Flow Direction** — Ascending or descending inversion sequences

### Layout
- **Portrait/Landscape Toggle** — Switch between vertical and horizontal layouts
- **Export PNG** — Export current fretboard view as image

## Project Structure

```
Quartal_Atlas/
├── README.md
├── core/
│   ├── index.html
│   ├── styles.css
│   ├── quartal-engine.js
│   └── ui.js
└── assets/
```

## Technical Details

- **Technology:** Plain HTML, CSS, vanilla JavaScript (no frameworks)
- **No Dependencies:** No audio, MIDI, timers, randomness, or data persistence
- **Guitar Tuning:** Standard EADGBE (MIDI: 40, 45, 50, 55, 59, 64)
- **Fret Range:** 0-24 frets
- **Playability Constraint:** All voicings constrained to 4-fret span for realistic guitar shapes

## Quartal Harmony Theory

### Perfect Quartals
All intervals are perfect fourths (5 semitones):
- Example: C-F-Bb-Eb
- Root → Fourth: C to F (5 semitones)
- Fourth → Seventh: F to Bb (5 semitones)
- Seventh → Tenth: Bb to Eb (5 semitones)

### Mixed Quartals
Perfect fourths with one augmented fourth (6 semitones):
- Example: C-F-Bb-E
- Root → Fourth: C to F (5 semitones)
- Fourth → Seventh: F to Bb (5 semitones)
- Seventh → Tenth: Bb to E (6 semitones - augmented)

### Inversions
- **Root Position:** R, 4, 7, 10
- **1st Inversion:** 4, 7, 10, R+12
- **2nd Inversion:** 7, 10, R+12, 4+12
- **3rd Inversion:** 10, R+12, 4+12, 7+12

## Usage

1. Open `core/index.html` in a web browser
2. Select root note, quartal type, string set, and inversion
3. Use Previous/Next buttons to navigate inversions
4. Toggle between color and black & white modes
5. Enable Practice Mode for simplified UI

## GitHub Integration

This project is part of the `gml-triadgen` ecosystem and is committed to the existing repository at `https://github.com/mikeb55/gml-triadgen` under the `Quartal_Atlas/` directory.

## Future Enhancements

Potential future features (if needed):
- Quartal pair relationships (similar to Triad Pairs)
- Melodic overlay derived from quartal inversions
- Timed practice mode
- Preset catalog for common quartal progressions

However, Quartal Atlas follows the same "fixed lens" philosophy as Triad Atlas—stability and clarity over feature expansion.




