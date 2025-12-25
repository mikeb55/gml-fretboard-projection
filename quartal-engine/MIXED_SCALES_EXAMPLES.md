# Mixed Scales/Modes Examples for Quartal Engine

## Current Status

**The quartal engine currently supports ONE scale/mode per command.** Each command generates quartal harmony based on a single scale.

However, here are 3 examples of commands that would generate **hugely different keys and modes**:

## Example 1: C# Locrian (Dark, Unstable)
```
Generate C# locrian quartals, 4 bars, quarter notes
```
**Result:**
- **Key:** C# Locrian (C#, D, E, F#, G#, A, B)
- **Character:** Dark, unstable, diminished quality
- **Quartal Stacks:** Based on locrian mode intervals
- **Output:** 4 bars, 12 notes (3-note quartals)

## Example 2: F Lydian (Bright, Floating)
```
Generate F lydian 4-note quartals, 8 bars, half notes
```
**Result:**
- **Key:** F Lydian (F, G, A, B, C, D, E)
- **Character:** Bright, floating, #4 creates tension
- **Quartal Stacks:** 4-note stacks with lydian color
- **Output:** 8 bars, 32 notes (4-note quartals, half-note duration)

## Example 3: Eb Phrygian (Exotic, Spanish)
```
Generate a musicxml of the Eb phrygian scale harmonised as quartals
```
**Result:**
- **Key:** Eb Phrygian (Eb, Fb, Gb, Ab, Bb, Cb, Db)
- **Character:** Exotic, Spanish, flamenco-like
- **Quartal Stacks:** Full 7-bar harmonization (one per scale degree)
- **Output:** 7 bars, 21 notes (3-note quartals, complete scale)

---

## Comparison: These Three Commands Generate

| Command | Root | Mode | Character | Bars | Notes |
|---------|------|------|-----------|------|-------|
| C# Locrian | C# | Locrian | Dark, unstable | 4 | 12 |
| F Lydian | F | Lydian | Bright, floating | 8 | 32 |
| Eb Phrygian | Eb | Phrygian | Exotic, Spanish | 7 | 21 |

**These are hugely different:**
- **C# Locrian:** Tritone-heavy, diminished quality, very dark
- **F Lydian:** #4 creates brightness, floating quality
- **Eb Phrygian:** b2 creates exotic, Spanish/Flamenco character

---

## Future: Mixing Scales in One Command

To support mixing scales/modes in one command, the engine would need to:

1. **Parse multiple scale specifications:**
   ```
   Generate C major quartals bars 1-4, then F lydian quartals bars 5-8
   ```

2. **Or use a progression format:**
   ```
   Generate quartals: C major (2 bars), F lydian (2 bars), G mixolydian (2 bars)
   ```

3. **Or specify per-bar scales:**
   ```
   Generate 8 bars: C major, C major, F lydian, F lydian, G mixolydian, G mixolydian, C major, C major
   ```

**This feature is not currently implemented**, but could be added to allow modal interchange and scale mixing within a single progression.

---

## Current Workaround

To create progressions with different scales/modes, generate separate files and combine them in your notation software:

1. Generate: `C major quartals, 4 bars` → Save as `part1.musicxml`
2. Generate: `F lydian quartals, 4 bars` → Save as `part2.musicxml`
3. Open both in Sibelius/Guitar Pro and combine

---

## More Examples of Different Keys/Modes

### Dark/Unstable
- **C# Locrian:** `Generate C# locrian quartals, 4 bars`
- **B Locrian:** `Generate B locrian 4-note quartals, 8 bars`

### Bright/Floating
- **F Lydian:** `Generate F lydian quartals, 4 bars`
- **C Lydian:** `Generate a musicxml of the C lydian scale harmonised as quartals`

### Exotic/Spanish
- **E Phrygian:** `Generate E phrygian quartals, 8 bars`
- **Eb Phrygian:** `Generate Eb phrygian 4-note quartals, 4 bars`

### Modal Jazz
- **D Dorian:** `Generate D dorian quartals, 8 bars, quarter notes`
- **G Mixolydian:** `Generate G mixolydian quartals, 8 bars, eighth notes`

### Traditional
- **C Major:** `Generate a musicxml of the C major scale harmonised as quartals`
- **A Minor:** `Generate A minor quartals, 4 bars, half notes`

