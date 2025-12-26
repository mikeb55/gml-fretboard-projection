# GML Fretboard Projection Layer

## What This Layer Does

The Fretboard Projection Layer is a **pure mapping system** that takes voicings from the harmonic engine and decides **where** those notes appear on the guitar fretboard. It maps MIDI note numbers to specific strings and frets, creating a visual representation that feels calm, intentional, and guitarist-realistic.

Think of it like a translator: the harmonic engine speaks in "musical notes" (MIDI numbers), and this layer translates those into "guitar positions" (which string, which fret).

## What This Layer Does NOT Do

- ❌ **Never decides harmony** - It doesn't choose chords or voicings
- ❌ **Never alters voicings** - It accepts voicings as read-only truth from the engine
- ❌ **Never changes notes** - It only decides WHERE notes appear, not WHAT notes appear
- ❌ **No UI rendering** - This is pure logic, no visual output
- ❌ **No audio** - This is about position, not sound

## How It Relates to gml-harmonic-engine

This layer **consumes** output from `gml-harmonic-engine`:

1. The harmonic engine decides **what notes** to play (voicings)
2. The harmonic engine decides **when to hold** chords (HOLD signals)
3. The harmonic engine decides **register position** (low/mid/high)
4. **This layer** decides **where on the fretboard** those notes appear

The relationship is one-way: engine → projection. The projection layer never talks back to the engine.

## Example: Input → Output Mapping

### Input (from engine):
```javascript
{
  voicing: [48, 52, 55, 59],        // Cmaj7 (MIDI notes)
  inversion: 'root',
  registerPosition: 'mid',
  hold: false,
  reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
}
```

### Output (from projection):
```javascript
{
  stringSet: [6, 5, 4, 3],          // Which strings to use
  frets: [3, null, null, null, null, null],  // Fret positions (string 6 = fret 3, etc.)
  positionWindow: [3, 8],           // Current position range
  anchorFret: 3,                     // Lowest fret used
  movementType: 'RESET',             // HOLD | STEP | RESET
  shapeId: 'root',                   // Preserved from engine
  registerBand: 'mid'                // Preserved from engine
}
```

### What This Means:
- The C note (MIDI 48) appears on string 6, fret 3
- The E note (MIDI 52) appears on string 5, fret 2
- The G note (MIDI 55) appears on string 4, fret 5
- The B note (MIDI 59) appears on string 3, fret 4
- All notes are within a 5-fret span (playable with one hand position)

## Visual Philosophy: Labyrinth-Style Calm

The projection layer is designed to create **calm, intentional movement** on the fretboard:

- **HOLD = Visual Stillness**: When the engine says "hold this chord," the fretboard doesn't move. Same strings, same frets, complete stillness.

- **STEP = Minimal Movement**: Small, intentional changes. One finger moves, or two. The hand position shifts slightly. Nothing jarring.

- **RESET = Single Intentional Jump**: When a big change is needed (register reset, major position change), it happens once, cleanly. No gradual drift, no wandering.

- **Position Window**: The layer maintains a "comfort zone" on the fretboard. It prefers to stay in this zone, only leaving when necessary.

- **Shape Continuity**: When possible, similar chord shapes use similar string sets. This creates visual patterns that feel natural to a guitarist.

## Core Behaviors

### 1. HOLD = Visual Stillness
If `hold === true`, the projection reuses the previous mapping exactly. No movement, no change. Complete visual stillness.

### 2. Position-First Logic
The layer maintains a current "position window" (a range of frets). It prefers to map notes within this window, only leaving when impossible or when a RESET is required.

### 3. Shape Continuity
- Prefers the same `shapeId` (inversion type)
- Prefers the same string set
- Prefers minimal fret movement

### 4. String Set Priority
The layer tries string sets in this order:
1. `[6, 5, 4, 3]` - Low strings (bass-heavy)
2. `[5, 4, 3, 2]` - Mid-low strings (balanced)
3. `[4, 3, 2, 1]` - Mid-high strings (treble-heavy)
4. Mixed sets only if unavoidable

### 5. Minimal Movement
- Changes one note if possible
- Avoids string jumps
- STEP preferred over RESET

### 6. Register Reset
When the engine signals a register reset (or the layer detects a major register change), it performs a single, intentional jump. No gradual drift.

## Technical Details

### Input Format
Each chord from the engine provides:
- `voicing`: Array of MIDI note numbers (ordered)
- `inversion`: String ('root', 'first', 'second', 'third') → becomes `shapeId`
- `registerPosition`: String ('low', 'mid', 'high') → becomes `registerBand`
- `hold`: Boolean (if true, reuse previous mapping)
- `reasonCodes`: Array of explanation objects from engine

### Output Format
Each projection result provides:
- `stringSet`: Array of string numbers used (1-6, where 6 is low E)
- `frets`: Array of 6 fret positions (null = string not used)
- `positionWindow`: `[minFret, maxFret]` - current position range
- `anchorFret`: Lowest fret used in this mapping
- `movementType`: 'HOLD' | 'STEP' | 'RESET'
- `shapeId`: Preserved from engine input
- `registerBand`: Preserved from engine input

### Constraints
- Maximum fret span: 5 frets (playable with one hand position)
- Maximum fret: 12 (cap at 12th fret)
- Standard tuning: EADGBE (MIDI 40, 45, 50, 55, 59, 64)

## Usage

```javascript
import { FretboardProjection } from './src/fretboard-projection-v0.1.3.js';

const projection = new FretboardProjection();

// Process a chord from the engine
const engineOutput = {
  voicing: [48, 52, 55, 59],
  inversion: 'root',
  registerPosition: 'mid',
  hold: false,
  reasonCodes: []
};

const fretboardMapping = projection.project(engineOutput);

console.log(fretboardMapping);
// {
//   stringSet: [6, 5, 4, 3],
//   frets: [3, 2, 5, 4, null, null],
//   positionWindow: [3, 8],
//   anchorFret: 3,
//   movementType: 'RESET',
//   shapeId: 'root',
//   registerBand: 'mid'
// }
```

## Testing

Run all tests:
```bash
npm test
```

Run baseline audit tests (documents known bugs):
```bash
npm run test:baseline
```

Run version-specific tests:
```bash
npm run test:v0.1.0
npm run test:v0.1.1
npm run test:v0.1.2
npm run test:v0.1.3
```

Each version has 40+ test cycles covering:
- Basic projection functionality
- HOLD behavior
- STEP vs RESET detection
- Long-form stability (32-64 bars)
- Register reset scenarios
- Shape continuity
- Position window management

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and visual/musical impact descriptions.

## Roadmap

See [docs/roadmap.md](./docs/roadmap.md) for the version roadmap and planned features.

## Constraints

See [docs/constraints.md](./docs/constraints.md) for the Labyrinth of Limitations constraint system.

## Supported Chord Types

The chord spelling system supports the following chord types:

### Triads (3 notes)
- **major** - Major triad (root, major 3rd, perfect 5th)
- **minor** - Minor triad (root, minor 3rd, perfect 5th)
- **diminished** - Diminished triad (root, minor 3rd, diminished 5th)
- **augmented** - Augmented triad (root, major 3rd, augmented 5th)

### Seventh Chords (4 notes)
- **maj7** - Major 7th chord (major triad + major 7th)
- **7** - Dominant 7th chord (major triad + minor 7th)
- **m7** - Minor 7th chord (minor triad + minor 7th)
- **dim7** - Diminished 7th chord (diminished triad + diminished 7th)
- **augmaj7** - Augmented major 7th chord (augmented triad + major 7th)

### Major 6th Chords (Barry Harris Foundations 0)
- **maj6** - Major 6th chord (major triad + major 6th) - Intervals: [0, 4, 7, 9]
  - Parses as `C6` or `Cmaj6`
  - Stable tonic-compatible structure per Barry Harris Foundations 0
  - When `preferTonicMaj6` is enabled, in-key Imaj7 chords are normalized to maj6 internally

### Tonic Normalization (Foundations Mode)

When `preferTonicMaj6` is enabled in the chord parser:
- Any in-key Imaj7 chord is internally normalized to MAJ6
- User-facing symbols may remain unchanged
- Internally, pitch spelling uses MAJ6 intervals [0, 4, 7, 9]
- Reason codes: `TONIC_MAJ6_HOME`, `NORMALIZED_TONIC_MAJ7_TO_MAJ6`

Example:
```javascript
import { parseChordSymbol } from './src/chord-symbol-parser.js';

// With tonic normalization enabled
const result = parseChordSymbol('Cmaj7', 4, {
  keyRoot: 'C',
  preferTonicMaj6: true
});
// Internally uses maj6 intervals, returns reason codes
```

## Autopilot System

The repository includes an automated stage-gated development system that validates, tests, and commits stages incrementally.

### Current Stage Status

Check `stages/stages.json` for the current stage. Stages progress from v0.1 through v0.5.

### Running Autopilot

```bash
npm run autopilot
```

The autopilot will:
1. Validate the current stage by running tests and checks
2. If stage passes: bump version, update CHANGELOG, commit, and tag
3. If stage fails: report errors (you must fix and retry)
4. Move to the next stage automatically on pass
5. Never use silent fallbacks - illegal moves are BLOCKED with explicit reason codes

### Stage Definitions

- **v0.1**: Major 6 is first-class (parse C6/Cmaj6, spell [0,4,7,9], don't misparse C13)
- **v0.2**: Add paired state I6 <-> vii°7 (state model, deterministic adjacent states)
- **v0.3**: One-note motion enforcement (exactly one voice moves or BLOCK)
- **v0.4**: State graph formalization (explicit API: getState, getAdjacentValidStates, tryMove)
- **v0.5**: Voicing + register legality gates (max spread, no voice crossing, instrument constraints)

### Manual Stage Testing

You can test individual stages:
```bash
# Test foundations 0 checks
node scripts/checks/foundations0_checks.mjs

# Test state graph checks
node scripts/checks/stategraph_checks.mjs v0.2

# Test voiceleading checks
node scripts/checks/voiceleading_checks.mjs v0.3
```

## Dependencies

- **gml-harmonic-engine**: Provides voicings, HOLD signals, register positions, and reason codes
- No other dependencies

## License

MIT
