# Quartal Engine Status

## Current Versions

### v1.0 (CORE - LOCKED) ✅
- **Status**: Implemented and tested
- **Purpose**: Generate diatonic quartal harmony from scale/mode input
- **Output**: MusicXML only
- **Tests**: 2 fixtures, all passing
- **Files**:
  - Spec: `specs/Quartal_Engine_v1.0_SPEC.md`
  - Prompt: `prompts/CursorPrompt_Quartal_v1.0.txt`
  - Generator: `generate_v1.0.js`
  - Fixtures: `fixture_a_v1.0.json`, `fixture_b_v1.0.json`

### v1.1 (MusicXML Melody Harmoniser - LOCKED) ✅
- **Status**: Implemented and tested
- **Purpose**: Harmonize existing MusicXML melody with quartal harmony
- **Output**: MusicXML with melody unchanged + harmony below
- **Tests**: 2 fixtures, all passing
- **Files**:
  - Spec: `specs/Quartal_Engine_v1.1_SPEC.md`
  - Prompt: `prompts/CursorPrompt_Quartal_v1.1.txt`
  - Generator: `generate_v1.1.js`
  - Fixtures: `fixture_c_v1.1.json`, `fixture_d_v1.1.json`

### v1.2 (Taste Controls Layer - LOCKED) ✅
- **Status**: Implemented and tested
- **Purpose**: Add taste-control switches to v1.1 without breaking changes
- **Output**: MusicXML with optional switches (density, tritone policy, register, string set)
- **Tests**: 2 fixtures, all passing
- **Files**:
  - Spec: `specs/Quartal_Engine_v1.2_SPEC.md`
  - Prompt: `prompts/CursorPrompt_Quartal_v1.2.txt`
  - Generator: `generate_v1.2.js`
  - Fixtures: `fixture_e_v1.2.json`, `fixture_f_v1.2.json`

### v2.0 (Quintile Engine - NOT IMPLEMENTED)
- **Status**: Not started
- **Purpose**: Add quintile (5th-based) harmony system
- **Note**: Separate engine, separate spec/prompt required

## Test Status

### Test Runner
- **Location**: `tests/runners/run_all_tests.js`
- **Language**: Node.js/JavaScript
- **Dependencies**: `@xmldom/xmldom` (for v1.1/v1.2)

### Test Results
- **v1.0**: 2/2 passed ✅
- **v1.1**: 2/2 passed ✅
- **v1.2**: 2/2 passed ✅
- **Total**: 6/6 passed ✅

### Running Tests
```bash
cd quartal-engine
npm install  # First time only
npm test
# OR
node tests/runners/run_all_tests.js
```

## File Structure

```
quartal-engine/
├── specs/
│   ├── Quartal_Engine_v1.0_SPEC.md
│   ├── Quartal_Engine_v1.1_SPEC.md
│   ├── Quartal_Engine_v1.2_SPEC.md
│   └── Quintile_Engine_v2.0_SPEC.md (placeholder)
├── prompts/
│   ├── CursorPrompt_Quartal_v1.0.txt
│   ├── CursorPrompt_Quartal_v1.1.txt
│   ├── CursorPrompt_Quartal_v1.2.txt
│   └── CursorPrompt_Quintile_v2.0.txt (placeholder)
├── tests/
│   ├── fixtures/
│   │   ├── fixture_a_v1.0.json
│   │   ├── fixture_b_v1.0.json
│   │   ├── fixture_c_v1.1.json
│   │   ├── fixture_c_v1.1.xml
│   │   ├── fixture_d_v1.1.json
│   │   ├── fixture_d_v1.1.xml
│   │   ├── fixture_e_v1.2.json
│   │   └── fixture_f_v1.2.json
│   ├── expected/
│   │   ├── output_a_v1.0.xml
│   │   ├── output_b_v1.0.xml
│   │   ├── output_c_v1.1.xml
│   │   ├── output_d_v1.1.xml
│   │   ├── output_e_v1.2.xml
│   │   └── output_f_v1.2.xml
│   ├── runners/
│   │   └── run_all_tests.js
│   └── testplan.md
├── output/
│   ├── v1.0/
│   ├── v1.1/
│   ├── v1.2/
│   └── v2.0/
├── generate_v1.0.js
├── generate_v1.1.js
├── generate_v1.2.js
├── package.json
└── STATUS.md
```

## Known Limitations

1. **Quartal Interval Validation**: Current tests check diatonic pitches but don't fully validate quartal interval relationships (n, n+3, n+6, n+9). This would require more sophisticated chord analysis.

2. **Guitar Position Validation**: Tests don't fully validate guitar constraints (adjacent strings, 5-fret span). This would require parsing MusicXML and checking actual fret positions.

3. **Voice Assignment**: v1.1/v1.2 tests check that melody pitches are present but don't fully validate voice assignment (melody = voice 1, harmony = voices 2+).

4. **Tritone Detection**: v1.2 tritone policy validation is basic. Full validation would require analyzing all intervals in the harmony.

## Next Steps

1. **Enhanced Validation**: Add more sophisticated quartal interval and guitar constraint validation
2. **More Fixtures**: Add additional test cases for edge cases
3. **v2.0 Implementation**: When requested, implement Quintile Engine as separate system
4. **Documentation**: Add usage examples and API documentation

## Determinism

All versions produce deterministic outputs:
- Same input = identical MusicXML output
- Re-running generators produces byte-identical files
- Tests validate this determinism

## Version Lock Policy

- **v1.0, v1.1, v1.2 are LOCKED**: No breaking changes allowed
- New versions (v2.0+) are separate engines/systems
- Backward compatibility is maintained across all versions



