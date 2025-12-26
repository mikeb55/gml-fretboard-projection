# Fretboard Projection Layer - Constraints Documentation

## Labyrinth of Limitations

This document defines the explicit constraints, allowed states, illegal states, and adjacency rules for the Fretboard Projection Layer.

**Status**: Initial draft - to be expanded in v0.4.0

---

## Core Constraints

### 1. Fret Span Constraint
- **Rule**: Maximum fret span ≤ 5 frets
- **Reason**: Must be playable with one hand position
- **Violation**: If span > 5, voicing is rejected
- **ReasonCode**: `FRET_SPAN_EXCEEDED`

### 2. Maximum Fret Constraint
- **Rule**: Maximum fret ≤ 12
- **Reason**: Cap at 12th fret for playability
- **Violation**: If any fret > 12, voicing is rejected or octave-adjusted
- **ReasonCode**: `MAX_FRET_EXCEEDED`

### 3. String Set Validity
- **Rule**: String set must have enough strings for voicing
- **Reason**: Cannot map 4 notes to 3 strings
- **Violation**: If stringSet.length < voicing.length, voicing is rejected
- **ReasonCode**: `INSUFFICIENT_STRINGS`

### 4. Position Window Constraint
- **Rule**: Position window maintains stability
- **Reason**: Prevents drift over long progressions
- **Violation**: If anchor drifts > maxFretSpan from window center, correction applied
- **ReasonCode**: `POSITION_DRIFT_DETECTED`

---

## Allowed States

### Valid Fretboard Positions
- Fret positions: 0-12 (0 = open string)
- String numbers: 1-6 (1 = high E, 6 = low E)
- Fret span: ≤ 5 frets
- All notes within position window (when window exists)

### Valid String Sets
- `[6, 5, 4, 3]` - Low strings (bass-heavy)
- `[5, 4, 3, 2]` - Mid-low strings (balanced)
- `[4, 3, 2, 1]` - Mid-high strings (treble-heavy)
- Custom combinations (when needed)

### Valid Movement Types
- `HOLD` - No movement, reuse previous mapping
- `STEP` - Minimal movement (1-2 fret changes)
- `RESET` - Intentional jump (register change, major position change)

---

## Illegal States

### Impossible Positions
- Fret < 0 (below open string)
- Fret > 12 (above cap)
- Fret span > 5 (unplayable)
- String number < 1 or > 6

### Invalid Transitions
- Jump > 5 semitones average between voicings (unless RESET)
- Position window drift > maxFretSpan without RESET
- String set change when same set would work

---

## Adjacency Rules (Valid Moves)

### HOLD Move
- **Condition**: `hold === true` in engine output
- **Result**: Reuse previous mapping exactly
- **Allowed**: Always
- **ReasonCode**: `HOLD_REQUESTED`

### STEP Move
- **Condition**: 1-2 fret changes, same string set
- **Result**: Minimal movement, maintain position window
- **Allowed**: When voicing fits in current position window
- **ReasonCode**: `STEP_MINIMAL_MOVEMENT`

### RESET Move
- **Condition**: Register reset signal OR major position change
- **Result**: Clean jump to new position, reset position window
- **Allowed**: When register changes OR position window invalid
- **ReasonCode**: `RESET_REGISTER_CHANGE` or `RESET_POSITION_CHANGE`

---

## Invariants (Always True)

1. **Bar Count Invariant**: `bars.length === totalBars` (never capped at 4)
2. **Fret Span Invariant**: `maxFret - minFret ≤ 5` (always playable)
3. **String Validity**: All string numbers in [1, 6]
4. **Fret Validity**: All fret positions in [0, 12] or null
5. **Voicing Completeness**: All notes in voicing mapped to strings (or omitted with reason)

---

## Reason Codes

### Success Codes
- `HOLD_REQUESTED` - Hold signal from engine
- `STEP_MINIMAL_MOVEMENT` - Small movement within window
- `RESET_REGISTER_CHANGE` - Register reset
- `RESET_POSITION_CHANGE` - Major position change
- `VOICING_MAPPED` - Successfully mapped to fretboard

### Failure Codes
- `FRET_SPAN_EXCEEDED` - Fret span > 5
- `MAX_FRET_EXCEEDED` - Fret > 12
- `INSUFFICIENT_STRINGS` - Not enough strings for voicing
- `POSITION_DRIFT_DETECTED` - Position window drifted
- `CANNOT_MAP_VOICING` - No valid mapping found

### Warning Codes
- `OCTAVE_ADJUSTMENT` - Note adjusted by octave
- `STRING_SET_CHANGED` - String set changed from previous
- `POSITION_WINDOW_EXPANDED` - Window expanded to fit voicing

---

## Future Constraints (v0.4.0+)

- Voice-leading constraints (max jump between voicings)
- Diversity constraints (prevent always same string set)
- Register constraints (low/high register preferences)
- Omission rules (when to omit notes and why)

---

## Validation Function Signature

```javascript
validateMove(prevState, nextState) -> {
  ok: boolean,
  reasonCodes: Array<{code: string, message: string}>,
  warnings: Array<{code: string, message: string}>
}
```

---

**Last Updated**: v0.1.0 baseline
**Next Update**: v0.4.0 - Full constraint system implementation


