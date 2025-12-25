# Quartal Harmonic Engine v1.1 - Specification

## Purpose
Harmonize an existing MusicXML melody using diatonic quartal harmony. The melody remains completely unchanged (pitch, rhythm, bar structure), and harmony is added below it.

## Version
**v1.1 (MusicXML Melody Harmoniser - LOCKED)**

## Allowed Inputs

### Required Input
1. **MusicXML melody file**: Single staff, monophonic melody
2. **Governing scale/mode**: Explicitly provided (not inferred)
   - Scale name: major, minor, dorian, mixolydian, lydian, phrygian, locrian
   - Root note: C, C#, D, D#, E, F, F#, G, G#, A, A#, B

### Optional Input
- **Chord progression**: If provided, defines harmonic context for each bar/segment
- **Density preference**: 2, 3, or 4 voices (default: 3)

## Deterministic Rules

1. **Reproducibility**: Identical input must produce byte-identical MusicXML output
2. **No randomness**: All decisions must be deterministic
3. **Consistent voice assignment**: When multiple valid options exist, use consistent selection criteria

## Melody Protection Rules

### Absolute Constraints
- **Melody pitch**: Must remain completely unchanged
- **Melody rhythm**: Must remain completely unchanged
- **Melody bar structure**: Must remain completely unchanged
- **Melody position**: Melody must always remain the top voice
- **No harmony above melody**: Harmony must be constructed downward only

### Melody Analysis
- Extract melody pitches and rhythms from input MusicXML
- Preserve all timing information (note durations, rests, ties)
- Preserve all bar boundaries

## Harmony Rules

### Quartal Stacking (Same as v1.0)
- **3-note stacks**: Scale degrees n, n+3, n+6 (mod 7)
- **4-note stacks**: Scale degrees n, n+3, n+6, n+9 (mod 7)
- All intervals must be diatonic to the governing scale/mode

### Harmony Construction
- **Downward only**: Harmony voices are added below the melody
- **Scale alignment**: Harmony pitches must belong to the governing scale/mode
- **Stack root selection**: Choose stack root (n) that best supports the melody note
  - Prefer stack roots where the melody note is part of the quartal stack
  - If melody note is not part of any quartal stack, choose stack root that creates smooth voice-leading

## Guitar Constraints (Same as v1.0)

### String Assignment
- **Adjacent strings only**: Harmony voices must be placed on adjacent strings
- **String sets**: 6-5-4, 5-4-3, 4-3-2, 3-2-1 (for 3-note) or 6-5-4-3, 5-4-3-2, 4-3-2-1 (for 4-note)
- **Melody string**: Melody may be on any string, but harmony must be below

### Fret Reach
- **Maximum reach**: 5 frets span
- **Octave displacement allowed**: For playability
- **Position-first anchoring**: Choose target position first, then place notes around it

## Voice-Leading Rules

1. **Smooth motion**: Harmony voices should move smoothly beneath the melody
2. **Avoid large leaps**: In lower voices, prefer oblique or stepwise motion
3. **Oblique motion preferred**: When melody moves, prefer holding harmony notes or moving stepwise
4. **Avoid unnecessary parallel motion**: If it causes density issues

## Forbidden Behaviours

1. **Do not change the melody**: Melody must remain completely unchanged
2. **Do not introduce new harmonic systems**: Quartal harmony only
3. **Do not infer harmony without explicit scale**: Governing scale/mode must be explicitly provided
4. **Do not add stylistic embellishments**: No trills, grace notes, or ornaments
5. **Do not explain theory**: Output MusicXML only, no prose

## Output Requirements

### MusicXML Format
- **Output format**: MusicXML 3.1 or 4.0
- **Structure**: Single staff, guitar (treble clef)
- **Content**: Original melody (unchanged) + harmony voices below
- **Voice assignment**: Melody = voice 1, harmony voices = voice 2, 3, 4 (as needed)
- **Rhythm**: Preserve original melody rhythm exactly

### MusicXML Elements Required
- `<score-partwise>` root element
- `<part-list>` with part definition
- `<part>` with `<measure>` elements matching input
- `<note>` elements with:
  - Original melody notes (unchanged)
  - New harmony notes (below melody)
  - Correct `<voice>` assignment
  - Correct `<pitch>`, `<duration>`, `<type>`
- Correct enharmonic spelling

### Output Constraints
- **No prose**: Output must be MusicXML only
- **No explanatory text**: All documentation in code comments or separate files
- **Well-formed XML**: Must parse as valid XML
- **Deterministic**: Same input = identical output
- **Melody integrity**: Melody must be byte-identical to input (except for voice assignment if needed)

## Self-Check Checklist

Before outputting MusicXML, verify:

- [ ] Melody pitches are unchanged
- [ ] Melody rhythms are unchanged
- [ ] Melody bar structure is unchanged
- [ ] Melody is the top voice
- [ ] All harmony pitches are diatonic to the governing scale/mode
- [ ] Quartal stacking intervals are correct (n, n+3, n+6, optional n+9)
- [ ] Guitar constraints are met (adjacent strings, max 5-fret span)
- [ ] MusicXML is well-formed and valid
- [ ] No tertian harmony intervals used
- [ ] Output is deterministic (re-run produces identical result)
- [ ] All required MusicXML elements are present
- [ ] Enharmonic spelling is correct for the key/mode

## Version Lock
This specification is LOCKED for v1.1. No breaking changes allowed. v1.0 must remain unchanged.



