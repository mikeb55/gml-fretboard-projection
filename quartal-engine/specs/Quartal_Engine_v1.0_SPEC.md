# Quartal Harmonic Engine v1.0 - Specification

## Purpose
Generate diatonic quartal harmony (3-note and 4-note stacks) from scale/mode input and output MusicXML only. This is a pure harmony generator with no melody parsing or tertian harmony logic.

## Version
**v1.0 (CORE - LOCKED)**

## Allowed Inputs

### Input Type A: Scale/Mode
- Scale name: major, minor, dorian, mixolydian, lydian, phrygian, locrian
- Root note: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- Optional: octave range specification (default: 1 octave)

### Input Type B: Parent Scale with Explicit Mode
- Parent scale: major or minor
- Mode: ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian
- Root note: as above

### Input Type C: Chord Symbol with Implied Scale
- Chord symbol: e.g., "Cmaj7", "Dm7", "G7"
- Implied scale derived from chord function (e.g., Cmaj7 → C major, Dm7 → D dorian)

## Deterministic Rules

1. **Reproducibility**: Identical input must produce byte-identical MusicXML output
2. **No randomness**: All decisions must be deterministic
3. **Consistent ordering**: When multiple valid options exist, use consistent selection criteria (e.g., lowest available position, left-to-right string assignment)

## Harmony Rules

### Quartal Stacking
- **3-note stacks**: Scale degrees n, n+3, n+6 (mod 7)
- **4-note stacks**: Scale degrees n, n+3, n+6, n+9 (mod 7)
- All intervals must be diatonic to the governing scale/mode
- Stacking direction: upward (lower to higher pitch)

### Scale Degree Mapping
- Ionian (Major): 0, 2, 4, 5, 7, 9, 11 (C, D, E, F, G, A, B)
- Dorian: 0, 2, 3, 5, 7, 9, 10 (C, D, Eb, F, G, A, Bb)
- Phrygian: 0, 1, 3, 5, 7, 8, 10 (C, Db, Eb, F, G, Ab, Bb)
- Lydian: 0, 2, 4, 6, 7, 9, 11 (C, D, E, F#, G, A, B)
- Mixolydian: 0, 2, 4, 5, 7, 9, 10 (C, D, E, F, G, A, Bb)
- Aeolian (Minor): 0, 2, 3, 5, 7, 8, 10 (C, D, Eb, F, G, Ab, Bb)
- Locrian: 0, 1, 3, 5, 6, 8, 10 (C, Db, Eb, F, Gb, Ab, Bb)

### Stack Selection
- Default: 3-note stacks unless explicitly specified
- When 4-note stacks are requested, use n+9 (tenth) as the top voice
- Stack root (n) must be a valid scale degree

## Guitar Constraints

### String Assignment
- **Adjacent strings only**: Harmony voices must be placed on adjacent strings
- **String sets**: 6-5-4, 5-4-3, 4-3-2, 3-2-1 (for 3-note) or 6-5-4-3, 5-4-3-2, 4-3-2-1 (for 4-note)
- **Default string set**: Use lowest available string set that accommodates the stack

### Fret Reach
- **Maximum reach**: 5 frets span
- **Octave displacement allowed**: If a pitch cannot be placed within 5 frets, use octave displacement to bring it into range
- **Position-first anchoring**: Choose target position first, then place notes around it

### Tuning
- Standard guitar tuning (EADGBE): [40, 45, 50, 55, 59, 64] (MIDI notes)

## Voice-Leading Rules

1. **Smooth motion**: Prefer stepwise or small interval motion between harmony voices
2. **Avoid large leaps**: In lower voices, prefer oblique or stepwise motion
3. **Parallel motion**: Avoid excessive parallel perfect intervals (but quartal harmony inherently uses parallel fourths)
4. **Register consistency**: Maintain consistent register where possible

## Forbidden Behaviours

1. **No tertian harmony**: Do not use major/minor thirds as primary intervals
2. **No functional cadence logic**: Do not infer cadential progressions
3. **No melody parsing**: Do not accept or process existing melodies
4. **No non-diatonic pitches**: All pitches must belong to the governing scale/mode (unless mode requires specific accidentals)
5. **No breaking changes**: v1.0 behavior must remain stable

## Output Requirements

### MusicXML Format
- **Output format**: MusicXML 3.1 or 4.0
- **Structure**: Single staff, guitar (treble clef)
- **Content**: Harmony voices only (no melody)
- **Rhythm**: Quarter notes (default) or as specified
- **Bars**: As specified in input (default: 1 bar)

### MusicXML Elements Required
- `<score-partwise>` root element
- `<part-list>` with part definition
- `<part>` with `<measure>` elements
- `<note>` elements with `<pitch>`, `<duration>`, `<voice>`
- Correct enharmonic spelling for the given key/mode

### Output Constraints
- **No prose**: Output must be MusicXML only
- **No explanatory text**: All documentation in code comments or separate files
- **Well-formed XML**: Must parse as valid XML
- **Deterministic**: Same input = identical output

## Self-Check Checklist

Before outputting MusicXML, verify:

- [ ] All pitches are diatonic to the governing scale/mode
- [ ] Quartal stacking intervals are correct (n, n+3, n+6, optional n+9)
- [ ] Guitar constraints are met (adjacent strings, max 5-fret span)
- [ ] MusicXML is well-formed and valid
- [ ] No tertian harmony intervals used
- [ ] No non-diatonic accidentals (unless mode requires)
- [ ] Output is deterministic (re-run produces identical result)
- [ ] All required MusicXML elements are present
- [ ] Enharmonic spelling is correct for the key/mode

## Version Lock
This specification is LOCKED for v1.0. No breaking changes allowed.



