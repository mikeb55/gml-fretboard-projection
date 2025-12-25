# Example Commands for Quartal Engine CLI

Here are 5 example phrases you can use with the natural language CLI to generate harmonized quartal scales in different keys and modes:

## Example 1: C Major Scale (Full 7-Bar Harmonization)
```
Generate a musicxml of the C major scale harmonised as quartals
```
**Result:** 7 bars, 21 notes (3-note quartals, one per scale degree)

## Example 2: D Dorian Mode (4 Bars)
```
Generate D dorian quartals, 4 bars
```
**Result:** 4 bars, 12 notes (3-note quartals)

## Example 3: F# Lydian with 4-Note Stacks
```
Generate F# lydian 4-note quartal stacks
```
**Result:** 1 bar, 4 notes (4-note quartal stack)

## Example 4: A Minor Scale (Full Harmonization, 8 Bars)
```
Generate A minor quartals, 8 bars
```
**Result:** 8 bars, 24 notes (3-note quartals, cycles through scale degrees)

## Example 5: G Mixolydian with 4-Note Stacks (Full Scale)
```
Generate a musicxml of the G mixolydian scale harmonised as 4-note quartals
```
**Result:** 7 bars, 28 notes (4-note quartals, one per scale degree)

---

## Additional Examples

### Bb Major (3-Note, Custom Bars)
```
Generate Bb major quartals, 6 bars
```

### E Phrygian (4-Note Stacks)
```
Generate E phrygian 4-note quartal stacks, 4 bars
```

### C# Locrian (Full Scale)
```
Generate a musicxml of the C# locrian scale harmonised as quartals
```

### F Lydian (3-Note, 8 Bars)
```
Generate F lydian quartals, 8 bars
```

### D# Minor (4-Note, Full Scale)
```
Generate a musicxml of the D# minor scale harmonised as 4-note quartals
```

---

## Command Patterns

The parser recognizes these patterns:

1. **"Generate [ROOT] [SCALE] quartals"** - Defaults to 1 bar, 3-note
2. **"Generate [ROOT] [SCALE] quartals, [N] bars"** - Custom bar count
3. **"Generate [ROOT] [SCALE] 4-note quartal stacks"** - 4-note quartals
4. **"Generate a musicxml of the [ROOT] [SCALE] scale harmonised as quartals"** - Full scale (7 bars)
5. **"Generate [ROOT] [SCALE] quartals, [N] bars"** - Custom bars with 3-note stacks

## Supported Roots
C, C#, Db, D, D#, Eb, E, F, F#, Gb, G, G#, Ab, A, A#, Bb, B

## Supported Modes
major, minor, dorian, mixolydian, lydian, phrygian, locrian


