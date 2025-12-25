# Quartal Harmonic Engine v1.2 - Specification

## Purpose
Add taste-control switches to v1.1 without breaking changes. These switches allow fine-tuning of quartal harmony generation while maintaining backward compatibility.

## Version
**v1.2 (Taste Controls Layer - LOCKED)**

## Backward Compatibility
- **v1.0 and v1.1 must remain completely unchanged**
- All v1.2 switches are **optional** with sensible defaults
- Existing v1.0 and v1.1 inputs must produce identical outputs

## New Input Parameters (All Optional)

### Density Control
- **Parameter**: `density`
- **Values**: 2, 3, or 4 voices
- **Default**: 3 (maintains v1.1 behavior)
- **Effect**: Controls number of harmony voices below melody (v1.1) or in generated harmony (v1.0)

### Tritone Management
- **Parameter**: `tritonePolicy`
- **Values**: 
  - `"allow"`: Allow tritones anywhere (default, maintains v1.1 behavior)
  - `"avoid-top"`: Avoid tritones in top voice (melody or highest harmony voice)
  - `"avoid-internal"`: Avoid tritones in internal voices (not top or bottom)
  - `"avoid-all"`: Avoid tritones entirely (may limit options)
- **Default**: `"allow"`
- **Effect**: Controls placement of tritones in quartal stacks

### Register Constraints
- **Parameter**: `registerConstraint`
- **Values**:
  - `"none"`: No register constraints (default, maintains v1.1 behavior)
  - `"one-position"`: Force all harmony voices into a single guitar position (max 5-fret span)
  - `"low-register"`: Prefer lower register (frets 0-7)
  - `"mid-register"`: Prefer mid register (frets 5-12)
  - `"high-register"`: Prefer high register (frets 10-17)
- **Default**: `"none"`
- **Effect**: Controls vertical spacing and register placement

### String Set Constraints
- **Parameter**: `stringSet`
- **Values**: 
  - `"auto"`: Automatic selection (default, maintains v1.1 behavior)
  - `"6-5-4"`: Force strings 6, 5, 4
  - `"5-4-3"`: Force strings 5, 4, 3
  - `"4-3-2"`: Force strings 4, 3, 2
  - `"3-2-1"`: Force strings 3, 2, 1
- **Default**: `"auto"`
- **Effect**: Forces specific string set for harmony voices

## Implementation Rules

1. **Default behavior**: When switches are not specified, behavior must match v1.1 exactly
2. **Switch application**: Switches only affect harmony generation, never melody
3. **Deterministic**: Same input with same switches must produce identical output
4. **Validation**: All v1.0 and v1.1 validation rules still apply

## Forbidden Behaviours

1. **No breaking changes**: v1.0 and v1.1 inputs must work unchanged
2. **No melody modification**: Switches never affect melody (v1.1)
3. **No new harmonic systems**: Still quartal harmony only
4. **No output format changes**: Still MusicXML only

## Output Requirements

Same as v1.1:
- MusicXML only
- Well-formed XML
- Deterministic output
- Correct enharmonic spelling

## Self-Check Checklist

Before outputting MusicXML, verify:

- [ ] All v1.1 checks pass
- [ ] Density matches requested value (if specified)
- [ ] Tritone policy is respected (if specified)
- [ ] Register constraints are met (if specified)
- [ ] String set constraints are met (if specified)
- [ ] Default behavior matches v1.1 when switches not specified
- [ ] Output is deterministic

## Version Lock
This specification is LOCKED for v1.2. No breaking changes allowed. v1.0 and v1.1 must remain unchanged.



