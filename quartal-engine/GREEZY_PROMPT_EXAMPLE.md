# How to Create a Command for "Greezy" Chord Progression

## Understanding Chord-to-Scale Mapping

To follow a chord progression with quartal harmonies, you need to map each chord to a scale/mode. Here's the mapping:

### Common Chord-to-Scale Mappings:

- **Major chords (C, D, E, F, G, A, B)**: Use **Mixolydian** mode (gives quartal sound)
  - C major → C mixolydian
  - G major → G mixolydian
  - D major → D mixolydian

- **Minor chords (Am, Dm, Em, etc.)**: Use **Dorian** mode
  - Am → A dorian
  - Dm → D dorian
  - Em → E dorian

- **Diminished chords**: Use **Locrian** mode
  - Bdim → B locrian

- **For modal/quartal sound**: You can also use the root's **Mixolydian** or **Dorian** regardless of chord quality

## Command Format

Use semicolons (`;`) or "then" to separate each chord/scale segment:

```
Generate [ROOT] [SCALE] quartals, [BARS] bars, [DURATION] notes; Generate [ROOT] [SCALE] quartals, [BARS] bars, [DURATION] notes; ...
```

## Example: Full Song Structure

If "Greezy" has a chord progression like: **G - Am - C - D** (repeated)

### Option 1: One chord per bar (common)
```
Generate G mixolydian quartals, 1 bar, quarter notes; Generate A dorian quartals, 1 bar, quarter notes; Generate C mixolydian quartals, 1 bar, quarter notes; Generate D mixolydian quartals, 1 bar, quarter notes
```

### Option 2: Multiple bars per chord
```
Generate G mixolydian quartals, 4 bars, quarter notes; Generate A dorian quartals, 4 bars, quarter notes; Generate C mixolydian quartals, 4 bars, quarter notes; Generate D mixolydian quartals, 4 bars, quarter notes
```

### Option 3: Full song with repeats (if you know the structure)
```
Generate G mixolydian quartals, 4 bars, quarter notes; Generate A dorian quartals, 4 bars, quarter notes; Generate C mixolydian quartals, 4 bars, quarter notes; Generate D mixolydian quartals, 4 bars, quarter notes; Generate G mixolydian quartals, 4 bars, quarter notes; Generate A dorian quartals, 4 bars, quarter notes; Generate C mixolydian quartals, 4 bars, quarter notes; Generate D mixolydian quartals, 4 bars, quarter notes
```

## Complete Example Prompt for "Greezy"

**Assuming a typical pop/jazz progression, here's a template:**

### Verse (8 bars):
```
Generate G mixolydian quartals, 2 bars, quarter notes; Generate A dorian quartals, 2 bars, quarter notes; Generate C mixolydian quartals, 2 bars, quarter notes; Generate D mixolydian quartals, 2 bars, quarter notes
```

### Chorus (8 bars):
```
Generate G mixolydian quartals, 2 bars, quarter notes; Generate C mixolydian quartals, 2 bars, quarter notes; Generate A dorian quartals, 2 bars, quarter notes; Generate D mixolydian quartals, 2 bars, quarter notes
```

### Full Song (combine with semicolons):
```
Generate G mixolydian quartals, 2 bars, quarter notes; Generate A dorian quartals, 2 bars, quarter notes; Generate C mixolydian quartals, 2 bars, quarter notes; Generate D mixolydian quartals, 2 bars, quarter notes; Generate G mixolydian quartals, 2 bars, quarter notes; Generate C mixolydian quartals, 2 bars, quarter notes; Generate A dorian quartals, 2 bars, quarter notes; Generate D mixolydian quartals, 2 bars, quarter notes
```

## Tips:

1. **Duration options**: `quarter notes`, `eighth notes`, `half notes`, `whole notes`, `sixteenth notes`
2. **Stack type**: Add `4-note quartals` for richer harmony
3. **Tempo**: Add `tempo 120` (or your desired BPM) at the end
4. **Count your bars**: Make sure total bars match your song structure

## Quick Reference: Common Progressions

**I - V - vi - IV (Pop progression in G):**
```
Generate G mixolydian quartals, 1 bar, quarter notes; Generate D mixolydian quartals, 1 bar, quarter notes; Generate A dorian quartals, 1 bar, quarter notes; Generate C mixolydian quartals, 1 bar, quarter notes
```

**ii - V - I (Jazz progression in C):**
```
Generate D dorian quartals, 1 bar, quarter notes; Generate G mixolydian quartals, 1 bar, quarter notes; Generate C mixolydian quartals, 1 bar, quarter notes
```

**Blues progression (in G):**
```
Generate G mixolydian quartals, 1 bar, quarter notes; Generate G mixolydian quartals, 1 bar, quarter notes; Generate G mixolydian quartals, 1 bar, quarter notes; Generate G mixolydian quartals, 1 bar, quarter notes; Generate C mixolydian quartals, 1 bar, quarter notes; Generate C mixolydian quartals, 1 bar, quarter notes; Generate G mixolydian quartals, 1 bar, quarter notes; Generate G mixolydian quartals, 1 bar, quarter notes; Generate D mixolydian quartals, 1 bar, quarter notes; Generate C mixolydian quartals, 1 bar, quarter notes; Generate G mixolydian quartals, 1 bar, quarter notes; Generate D mixolydian quartals, 1 bar, quarter notes
```

