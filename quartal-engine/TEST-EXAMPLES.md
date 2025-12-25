# Quartal Engine - Test Examples

## ✅ All Tests Passed!

**Total Tests:** 16  
**Passed:** 16  
**Failed:** 0

## 3 Example Commands

### Example 1: C Major 3-Note Quartals (Default String Set)
```bash
Generate a musicxml of the C major scale harmonised as quartals
```

**Output:** `quartal-C-major-[timestamp].MusicXML`
- Root: C
- Scale: Major (Ionian)
- Stack Type: 3-note
- String Set: 6-5-4 (default)
- Bars: 1

### Example 2: D Dorian 4-Note Quartals, 4 Bars
```bash
Generate D dorian 4-note quartals, 4 bars
```

**Output:** `quartal-D-dorian-[timestamp].MusicXML`
- Root: D
- Scale: Dorian
- Stack Type: 4-note
- String Set: 6-5-4-3 (default for 4-note)
- Bars: 4

### Example 3: F# Lydian 3-Note Quartals, Multiple String Sets
```bash
Generate F# lydian 3-note stacks
```

**Output:** `quartal-F#-lydian-[timestamp].MusicXML`
- Root: F#
- Scale: Lydian
- Stack Type: 3-note
- String Set: 6-5-4 (default)
- Bars: 1

## Test Coverage

### String Sets Tested

**3-Note Quartals:**
- ✅ 6-5-4 (strings 5, 4, 3)
- ✅ 5-4-3 (strings 4, 3, 2)
- ✅ 4-3-2 (strings 3, 2, 1)
- ✅ 3-2-1 (strings 2, 1, 0)

**4-Note Quartals:**
- ✅ 6-5-4-3 (strings 5, 4, 3, 2)
- ✅ 5-4-3-2 (strings 4, 3, 2, 1)
- ✅ 4-3-2-1 (strings 3, 2, 1, 0)

### Scales Tested
- ✅ C Major
- ✅ D Dorian
- ✅ F# Lydian
- ✅ A Minor

### Stack Types Tested
- ✅ 3-note quartals
- ✅ 4-note quartals

### Bar Counts Tested
- ✅ 1 bar
- ✅ 4 bars

## Validation Results

All generated MusicXML files:
- ✅ Well-formed XML structure
- ✅ Correct pitch classes for quartal stacks
- ✅ Proper voice assignments (1, 2, 3, 4)
- ✅ Valid MusicXML 3.1 format
- ✅ Playable guitar positions (≤ 5 fret span)

## Running Tests

```bash
# Run comprehensive test suite
node comprehensive-test.js

# Validate musical content
node validate-musical-content.js

# Both tests should show 100% pass rate
```

## Output Location

All test outputs are saved to:
- `output/test-results/` - Test-generated files
- `output/generated/` - User-generated files

All files use `.MusicXML` extension for direct opening in:
- Sibelius
- Guitar Pro 8
- Cubase
- MuseScore
- Finale



