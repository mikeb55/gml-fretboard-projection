# Barry Engine Integration Guide

This document explains how to integrate the Barry engine (`mikeb55/grand-criteria-of-excellence-jazz`) with the fretboard projection layer.

## Overview

The Barry engine is the **authoritative source** for jazz harmony rules, voicing evaluation, and the "Grand Criteria of Excellence" scoring system. The fretboard projection layer **consumes** Barry's outputs and maps them to guitar fretboard positions.

**Important**: This repo does **not** implement Barry's rules. It only provides an integration layer to consume Barry's outputs.

## Architecture

```
┌─────────────────┐
│  Barry Engine   │  (mikeb55/grand-criteria-of-excellence-jazz)
│  (External)     │
└────────┬────────┘
         │
         │ EngineVoicing[]
         │ EnginePhrase[]
         ▼
┌─────────────────┐
│  barryClient.js │  (Integration Layer)
│  (This Repo)    │
└────────┬────────┘
         │
         │ EngineVoicing[]
         ▼
┌─────────────────┐
│  Fretboard      │
│  Projection     │
└────────┬────────┘
         │
         │ FretboardMapping[]
         ▼
┌─────────────────┐
│  Fretboard UI   │
└─────────────────┘
```

## Data Flow

### 1. Input to Barry

The Barry client accepts a `BarryContext`:

```javascript
const context = {
  keyRoot: 'C',              // Root note of the key
  mode: 'major',             // Mode ('major', 'minor', etc.)
  chordSymbols: ['Cmaj7', 'Dm7', 'G7'],  // Chord progression
  options: {                 // Optional preferences
    registerPreference: 'mid',
    style: 'barry-harris',
  }
};
```

### 2. Output from Barry

Barry returns `EngineVoicing[]`:

```javascript
[
  {
    voicing: [48, 52, 55, 59],      // MIDI note numbers
    inversion: 'root',               // 'root', '1st', '2nd', '3rd'
    registerPosition: 'mid',        // 'low', 'mid', 'high'
    hold: false,                     // Whether to hold (visual stillness)
    reasonCodes: [                   // Explanatory tags from Barry
      { code: 'BARRY_HARRIS_INVERSION', message: '...' }
    ]
  },
  // ... more voicings
]
```

### 3. Projection to Fretboard

The projection layer converts `EngineVoicing` → `FretboardMapping`:

```javascript
{
  stringSet: [6, 5, 4, 3],          // Which strings to use
  frets: [3, 2, 5, 4, null, null],  // Fret positions per string
  positionWindow: [3, 8],            // Current position range
  anchorFret: 3,                     // Lowest fret used
  movementType: 'RESET',             // 'HOLD' | 'STEP' | 'RESET'
  shapeId: 'root',                   // Preserved from engine
  registerBand: 'mid'                // Preserved from engine
}
```

## Usage

### Basic Example

```javascript
import { createBarryClient } from './src/barryClient.js';
import { FretboardProjection } from './src/fretboard-projection-v0.1.3.js';

// Create Barry client
const barryClient = createBarryClient({
  transport: 'import',  // or 'http' or 'mock'
  enginePath: '../grand-criteria-of-excellence-jazz/src/index.js',
});

// Prepare context
const context = {
  keyRoot: 'C',
  mode: 'major',
  chordSymbols: ['Cmaj7', 'Dm7', 'G7', 'Cmaj7'],
};

// Get evaluated voicings from Barry
const engineOutputs = await barryClient.getEvaluatedVoicings(context);

// Project to fretboard
const projection = new FretboardProjection();
const fretboardMappings = engineOutputs.map(voicing => 
  projection.project(voicing)
);
```

### Transport Options

#### 1. Import (Local Package)

Use when Barry engine is installed as a local package or in a monorepo:

```javascript
const barryClient = createBarryClient({
  transport: 'import',
  enginePath: '../grand-criteria-of-excellence-jazz/src/index.js',
});
```

#### 2. HTTP (API)

Use when Barry engine is deployed as a service:

```javascript
const barryClient = createBarryClient({
  transport: 'http',
  apiUrl: 'https://api.barry-engine.example.com',
});
```

#### 3. Mock (Development/Testing)

Use for development and testing without a real Barry engine:

```javascript
const barryClient = createBarryClient({
  transport: 'mock',
});
```

## API Reference

### `BarryClient`

#### Constructor

```javascript
new BarryClient(config)
```

**Parameters:**
- `config.transport` - Transport type: `'import'` | `'http'` | `'mock'`
- `config.enginePath` - Path to Barry engine (for `'import'` transport)
- `config.apiUrl` - API URL (for `'http'` transport)

#### Methods

##### `getEvaluatedVoicings(context)`

Get evaluated voicings from Barry engine.

**Parameters:**
- `context` - `BarryContext` object

**Returns:** `Promise<EngineVoicing[]>`

##### `getEvaluatedPhrases(context)`

Get evaluated phrases from Barry engine.

**Parameters:**
- `context` - `BarryContext` object

**Returns:** `Promise<EnginePhrase[]>`

### `createBarryClient(config)`

Convenience function to create a Barry client instance.

## Integration Guidelines

### ✅ DO

- Use the `BarryClient` for all communication with Barry
- Handle errors gracefully (Barry may be unavailable)
- Preserve Barry's `reasonCodes` in your data flow
- Respect Barry's `hold` signals for visual stillness
- Use Barry's `registerPosition` to guide fretboard placement

### ❌ DON'T

- Implement Barry's jazz rules in this repo
- Modify Barry's voicings before projection
- Ignore Barry's `reasonCodes` or `hold` signals
- Call Barry directly - always use `BarryClient`
- Assume Barry's output format - use the integration layer

## Error Handling

The Barry client throws errors if:

- Barry engine is unavailable
- Transport configuration is invalid
- Barry returns unexpected data format
- Network errors (for HTTP transport)

Always wrap Barry calls in try/catch:

```javascript
try {
  const voicings = await barryClient.getEvaluatedVoicings(context);
} catch (error) {
  console.error('Barry engine error:', error);
  // Fallback to mock data or show error to user
}
```

## Testing

For testing, use the `'mock'` transport:

```javascript
const barryClient = createBarryClient({ transport: 'mock' });
const voicings = await barryClient.getEvaluatedVoicings({
  keyRoot: 'C',
  mode: 'major',
  chordSymbols: ['Cmaj7', 'Dm7'],
});
// Returns mock voicings for development
```

## See Also

- [Main README](../README.md) - Project overview
- [API Documentation](./API.md) - Fretboard projection API
- [Integration Example](../demo/integration-example.js) - Complete example

