# Fretboard UI v0.1

## Labyrinth-Style Visualiser

The Fretboard UI renders the output from `gml-fretboard-projection` as a visual guitar fretboard.

## What This UI Does

- **Renders a guitar fretboard** with 6 strings and frets
- **Shows notes** from the projection layer output
- **Visualizes movement types** (HOLD = still, STEP = subtle, RESET = jump)
- **Emphasizes position window** (the active fret range)
- **Provides bar-by-bar navigation** (step forward/backward)

## What This UI Does NOT Do

- ❌ Does NOT decide harmony
- ❌ Does NOT project voicings
- ❌ Does NOT generate audio
- ❌ Does NOT sync with DAWs
- ❌ Only shows what the projection layer already decided

## Input Format

The UI expects an array of projection outputs, where each bar contains:

```javascript
{
  stringSet: [6, 5, 4, 3],        // Which strings are used
  frets: [3, 2, 5, 4, null, null], // Fret positions (null = unused string)
  positionWindow: [2, 7],         // Active fret range
  anchorFret: 2,                   // Lowest fret used
  movementType: 'HOLD',           // 'HOLD' | 'STEP' | 'RESET'
  shapeId: 'root',                // Preserved from engine
  registerBand: 'mid',             // Preserved from engine
  reasonCodes: [...]              // Optional, for display
}
```

## Visual Design Philosophy

**Labyrinth-style calm:**
- **HOLD bars**: No movement, notes frozen in place (darker blue)
- **STEP bars**: Subtle animation, minimal movement (standard blue)
- **RESET bars**: Clear jump animation, visually distinct (red)

**Position window:**
- Active frets are highlighted (light blue background)
- Frets outside the window are faded
- Window does NOT drift unless RESET occurs

## Usage

```javascript
import { FretboardUI } from './src/fretboard-ui-v0.1.js';

const container = document.getElementById('fretboard-container');
const ui = new FretboardUI(container, {
  showBarNumber: false,      // Toggle bar number overlay
  showMovementType: false,    // Toggle movement type label
  showReasonCodes: false     // Toggle reason codes display
});

// Load projection outputs
const projectionOutputs = [
  { stringSet: [6,5,4,3], frets: [3,2,5,4,null,null], ... },
  // ... more bars
];

ui.loadBars(projectionOutputs);

// Navigate
ui.nextBar();
ui.previousBar();
```

## Movement Rules

### HOLD
- **No visual movement**
- Notes remain frozen
- Darker blue color
- No animation

### STEP
- **Minimal movement animation**
- Short, smooth transitions
- Standard blue color
- Subtle fade-in

### RESET
- **Clear jump animation**
- Red color (distinct)
- Fade-in with scale animation
- Visually obvious position change

## Position Window

The position window is the "comfort zone" on the fretboard:
- Highlighted with light blue background
- Frets outside the window are faded (30% opacity)
- Window range is determined by projection layer
- Window does NOT drift unless RESET occurs

## Optional Overlays

All overlays are toggleable (default: OFF):

- **Bar Number**: Shows current bar (e.g., "Bar 3 / 64")
- **Movement Type**: Shows HOLD / STEP / RESET label with color coding
- **Reason Codes**: Shows plain-English explanations from engine

Reason codes are **read-only** and **never affect visuals**. They're explanatory only.

## Demo

Open `demo/index.html` in a browser to see the UI in action with sample data.

## Version Roadmap

- **v0.1** (current): Static fretboard + step navigation
- **v0.2**: Playback + tempo
- **v0.3**: Screenshot → fretboard live view
- **v0.4**: Teaching overlays / annotation mode

## Success Criteria

- ii–V–I mostly looks static
- HOLD bars show zero motion
- STEP motion is subtle
- RESET is obvious and intentional
- Long forms do not visually creep up the neck
- Visuals match musical intent

## Dependencies

- **gml-fretboard-projection**: Provides the projection outputs to visualize
- No other dependencies (pure vanilla JS, SVG, CSS)

## License

MIT

