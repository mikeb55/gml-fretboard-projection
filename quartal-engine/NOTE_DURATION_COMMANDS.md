# Note Duration Commands - Quartal Engine

## How to Specify Note Duration

The Quartal Engine recognizes these note duration keywords in commands:

### Supported Durations

- **Quarter notes**: `quarter`, `quarter notes`, `quarter-note`
- **Eighth notes**: `eighth`, `eighth notes`, `8th`, `8th notes`
- **Half notes**: `half`, `half notes`, `half-note`
- **Sixteenth notes**: `sixteenth`, `16th`, `16th notes` (if supported)

### Default
If no duration is specified, **quarter notes** are used by default.

## Command Syntax

```
Generate [ROOT] [SCALE] quartals, [N] bars, [DURATION]
```

## Examples

### Quarter Notes (Default)
```
Generate C major quartals, 4 bars
Generate C major quartals, 4 bars, quarter notes
```

### Eighth Notes
```
Generate D dorian quartals, 4 bars, eighth notes
Generate D dorian quartals, 4 bars, 8th notes
```

### Half Notes
```
Generate E minor quartals, 4 bars, half notes
Generate E minor quartals, 4 bars, half
```

### Sixteenth Notes
```
Generate F lydian quartals, 4 bars, sixteenth notes
Generate F lydian quartals, 4 bars, 16th notes
```

## Sample Sentences for 3 Different Harmonized Progressions

### Example 1: Slow, Sustained Progression (Half Notes)
```
Generate C major quartals, 4 bars, half notes
```
**Result:** 4 bars, 12 notes (3-note quartals), half-note duration
**Use case:** Slow, sustained harmonic progression

### Example 2: Medium Tempo (Quarter Notes)
```
Generate D dorian quartals, 4 bars, quarter notes
```
**Result:** 4 bars, 12 notes (3-note quartals), quarter-note duration
**Use case:** Standard tempo, common time feel

### Example 3: Fast, Rhythmic (Eighth Notes)
```
Generate E minor quartals, 8 bars, eighth notes
```
**Result:** 8 bars, 24 notes (3-note quartals), eighth-note duration
**Use case:** Fast, rhythmic progression

## Complete Command Examples

### Full Scale Harmonization with Half Notes
```
Generate a musicxml of the C major scale harmonised as quartals, half notes
```

### 4-Note Quartals with Eighth Notes
```
Generate F# lydian 4-note quartals, 4 bars, eighth notes
```

### Custom Progression with Sixteenth Notes
```
Generate A minor quartals, 8 bars, 16th notes
```

## Note Duration in Output

The generated MusicXML will have:
- Correct `<duration>` values
- Correct `<type>` elements (half, quarter, eighth, 16th)
- Proper time signature (default: 4/4)

## Tips

1. **Half notes**: Best for slow, sustained progressions
2. **Quarter notes**: Standard, versatile (default)
3. **Eighth notes**: Good for faster, more rhythmic progressions
4. **Sixteenth notes**: Very fast, dense progressions

## Current Implementation

The engine currently supports:
- ✅ Quarter notes (default)
- ✅ Eighth notes
- ✅ Half notes
- ⚠️ Sixteenth notes (may need implementation)

Check the engine's current capabilities by testing a command.


