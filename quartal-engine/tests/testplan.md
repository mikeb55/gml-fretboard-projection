# Quartal Engine Test Plan

## Overview
This test plan validates Quartal Harmonic Engine outputs against specifications for versions 1.0, 1.1, and 1.2.

## Test Structure

### Fixtures
- **Fixture A (v1.0)**: D Dorian, 1 octave, quarter-notes, 3-note stacks
- **Fixture B (v1.0)**: C Lydian, 8 bars, bars 1-4 use 3-note stacks, bars 5-8 use 4-note stacks
- **Fixture C (v1.1)**: 4-bar monophonic melody, D Dorian harmonization
- **Fixture D (v1.1)**: Same melody as C, but C Lydian harmonization

### Validation Rules

#### v1.0 Validation
1. **XML Structure**: Well-formed XML with required elements
2. **Diatonic Check**: All pitches belong to governing scale/mode
3. **Quartal Intervals**: Harmony uses quartal stacking (n, n+3, n+6, optional n+9)
4. **Guitar Constraints**: Adjacent strings, max 5-fret span (basic check)

#### v1.1 Validation
1. **XML Structure**: Well-formed XML with required elements
2. **Melody Integrity**: Original melody pitches and rhythms unchanged
3. **Diatonic Check**: All pitches (melody + harmony) belong to governing scale/mode
4. **Voice Assignment**: Melody is top voice, harmony below
5. **Quartal Intervals**: Harmony uses quartal stacking

## Running Tests

```bash
cd quartal-engine/tests/runners
node run_all_tests.js
```

## Expected Behavior

- Tests should produce deterministic outputs
- Re-running tests should produce identical results
- All validation checks must pass for a test to be considered passing

## Test Output

Tests output:
- ✅ PASS: All validations passed
- ❌ FAIL: One or more validations failed (with error details)
- ⚠️  WARNINGS: Non-critical issues detected



