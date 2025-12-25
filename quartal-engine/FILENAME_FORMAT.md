# Filename Format Documentation

## New Descriptive Filename Format

The Quartal Engine now generates descriptive filenames that clearly indicate what was generated.

### Format Pattern

```
{root}-{scale}-quartal-{stackType}-{bars}bars{fullscale}-{timestamp}.MusicXML
```

### Components

1. **Root Note**: The root note of the scale (e.g., `C`, `F#`, `Bb`)
   - Sharps (`#`) are converted to `sharp` (e.g., `F#` → `Fsharp`)
   - Flats (`b`) are converted to `flat` (e.g., `Bb` → `Bflat`)

2. **Scale/Mode**: The scale or mode name (e.g., `major`, `dorian`, `lydian`)

3. **Stack Type**: 
   - `3note` for 3-note quartal stacks
   - `4note` for 4-note quartal stacks

4. **Bar Count**: Number of bars generated (e.g., `1bars`, `4bars`, `7bars`)

5. **Full Scale Indicator** (optional): 
   - `-fullscale` is appended when generating a full 7-bar harmonization (one per scale degree)
   - Only appears when `bars === 7`

6. **Timestamp**: Unix timestamp for uniqueness

### Examples

| Command | Filename |
|---------|----------|
| `Generate a musicxml of the C major scale harmonised as quartals` | `C-major-quartal-3note-7bars-fullscale-1234567890.MusicXML` |
| `Generate D dorian quartals, 4 bars` | `D-dorian-quartal-3note-4bars-1234567890.MusicXML` |
| `Generate F# lydian 4-note quartal stacks` | `Fsharp-lydian-quartal-4note-1bars-1234567890.MusicXML` |
| `Generate A minor quartals, 8 bars` | `A-minor-quartal-3note-8bars-1234567890.MusicXML` |
| `Generate a musicxml of the G mixolydian scale harmonised as 4-note quartals` | `G-mixolydian-quartal-4note-7bars-fullscale-1234567890.MusicXML` |
| `Generate Bb major quartals, 4 bars` | `Bflat-major-quartal-3note-4bars-1234567890.MusicXML` |
| `Generate C# locrian quartals, 7 bars` | `Csharp-locrian-quartal-3note-7bars-fullscale-1234567890.MusicXML` |

### Benefits

1. **Immediate Clarity**: You can see at a glance what the file contains
2. **Easy Organization**: Files can be sorted and filtered by root, scale, stack type, or bar count
3. **No Ambiguity**: The filename tells you exactly what was generated
4. **Full Scale Indicator**: The `-fullscale` suffix makes it clear when a complete scale harmonization was generated
5. **Uniqueness**: Timestamp ensures no filename collisions

### Comparison

**Old Format:**
```
quartal-C-major-1234567890.MusicXML
```

**New Format:**
```
C-major-quartal-3note-7bars-fullscale-1234567890.MusicXML
```

The new format provides much more information and makes it easy to identify files without opening them.


