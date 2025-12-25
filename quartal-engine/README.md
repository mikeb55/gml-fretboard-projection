# Quartal Harmonic Engine

A deterministic MusicXML output engine for generating quartal harmony on guitar.

## Overview

This engine generates MusicXML files containing quartal harmony (4th-based stacking) for guitar. MusicXML is the source of truth - any future visualizers must be derived from MusicXML outputs, not replace them.

## Versions

- **v1.0**: Core quartal harmony generator from scale/mode input
- **v1.1**: MusicXML melody harmonizer (melody unchanged, harmony added below)
- **v1.2**: Taste-control switches (density, tritone policy, register, string set)
- **v2.0**: Quintile Engine (not yet implemented)

## Quick Start

### Desktop Access
**Double-click the "Quartal Engine" shortcut on your desktop** to open the natural language CLI.

### Natural Language Interface

Simply type commands in plain English:

```
Quartal Engine> Generate a musicxml of the C major scale harmonised as quartals
Quartal Engine> Generate D dorian quartals, 4 bars
Quartal Engine> Generate F# lydian 4-note stacks, 8 bars
```

The CLI will:
1. Parse your command
2. Generate MusicXML directly
3. Save it to `output/generated/`
4. Show you the file path

**No JSON files required!** Just natural language commands.

### Multi-Scale Commands

The engine supports multiple scales in a single command using "then" or semicolons:

```
Generate G mixolydian quartals, 3 bars, quarter notes; Generate G# locrian quartals, 1 bar, quarter notes; Generate C mixolydian quartals, 1 bar, quarter notes
```

Or using "then":

```
Generate G mixolydian quartals, 3 bars, then G# locrian quartals, 1 bar, then C mixolydian quartals, 1 bar
```

### Note Durations

The engine correctly generates the appropriate number of chords per bar based on note duration:
- **Whole notes**: 1 chord per bar
- **Half notes**: 2 chords per bar
- **Quarter notes**: 4 chords per bar
- **Eighth notes**: 8 chords per bar
- **16th notes**: 16 chords per bar

Example:
```
Generate C major quartals, 4 bars, quarter notes
```
This generates 4 bars with 4 quarter-note chords per bar (16 chords total for 3-note quartals).

### Installation
```bash
cd quartal-engine
npm install
```

### Running Tests
```bash
npm test
```

### Command Line Usage

**Interactive Mode:**
```bash
node quartal-cli.js
```

**Direct Command (one-shot):**
```bash
echo "Generate C major quartals" | node quartal-cli.js
```

### Legacy JSON-Based Generators (for testing)

**v1.0:**
```bash
node generate_v1.0.js tests/fixtures/fixture_a_v1.0.json
```

**v1.1:**
```bash
node generate_v1.1.js tests/fixtures/fixture_c_v1.1.json
```

**v1.2:**
```bash
node generate_v1.2.js tests/fixtures/fixture_e_v1.2.json
```

## Test Command

```bash
node tests/runners/run_all_tests.js
```

## PASS Summary

✅ **ALL TESTS PASSING**
- v1.0: 2/2 passed
- v1.1: 2/2 passed  
- v1.2: 2/2 passed
- **Total: 6/6 passed**

## File Structure

See `STATUS.md` for complete file tree and documentation.

## Version Lock Policy

All versions (v1.0, v1.1, v1.2) are LOCKED - no breaking changes allowed. New versions are separate systems.

## Recent Updates

### Note Counting Fix
- Fixed bug where engine only generated 1 chord per bar regardless of note duration
- Now correctly generates multiple chords per bar based on duration (whole=1, half=2, quarter=4, eighth=8, 16th=16)
- Comprehensive test suite: 60 different 4-measure combinations verified

### Multi-Scale Command Support
- Added support for "then" separator: `Generate X scale N bars, then Y scale N bars, then...`
- Added support for semicolon separator: `Generate X scale N bars; Generate Y scale N bars; ...`
- Perfect for following chord progressions from songs

### GCE Jazz Guitar Collection
- Reference guide for all 18 tunes from GCE Jazz Guitar collection
- Includes "Greezy" and other jazz standards
- See `GCE_SONGS_REFERENCE.md` and `GREEZY_COMMAND.md` for examples

