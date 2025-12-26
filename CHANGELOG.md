## [0.6.3] - Voicing + register legality gates

### Added
- Stage v0.5 implementation: Voicing + register legality gates
- add constraints: max spread, no voice crossing (configurable), instrument constraints hook
- blocked moves must include reason codes

### Testing
- All stage v0.5 tests pass
- All checks pass

---

## [0.5.3] - State graph formalization

### Added
- Stage v0.4 implementation: State graph formalization
- implement explicit state graph API: getState(id), getAdjacentValidStates(id), tryMove(fromId, toId)
- tryMove returns { ok: boolean, reasonCodes: [] }
- illegal moves must be blocked, never substituted

### Testing
- All stage v0.4 tests pass
- All checks pass

---

## [0.4.3] - One-note motion enforcement

### Added
- Stage v0.3 implementation: One-note motion enforcement
- any transition must move exactly one voice (or BLOCK)
- add voiceleading checks and tests

### Testing
- All stage v0.3 tests pass
- All checks pass

---

## [0.3.3] - Add paired state I6 <-> vii°7

### Added
- Stage v0.2 implementation: Add paired state I6 <-> vii°7
- engine exposes a 'state' model
- each state returns deterministic adjacent valid states
- include ReasonCodes for paired motion
- add tests for determinism (same input -> same exits)

### Testing
- All stage v0.2 tests pass
- All checks pass

---

## [0.2.3] - Major 6 is first-class

### Added
- Stage v0.1 implementation: Major 6 is first-class
- parse C6 / Cmaj6 correctly
- spell intervals [0,4,7,9]
- do NOT misparse C13 as C6
- add ReasonCodes for MAJ6 tonic

### Testing
- All stage v0.1 tests pass
- All checks pass

---

# Changelog

All notable changes to the Fretboard Projection Layer are documented in this file.

## [v0.2.1] - Barry Harris Foundations 0 Compliance: MAJ6 Chord Support

### Added
- **MAJ6 chord type** as first-class chord type with intervals [0, 4, 7, 9]
- Chord symbol parsing for `C6` and `Cmaj6` (but not `C13`)
- Tonic normalization system with `preferTonicMaj6` option
- Reason codes: `TONIC_MAJ6_HOME`, `NORMALIZED_TONIC_MAJ7_TO_MAJ6`
- Comprehensive test suite (`tests/test-maj6-foundations.js`) with 87+ test cases
- Tonic normalization module (`src/tonic-normalization.js`)

### Changed
- `parseChordSymbol()` now accepts options object for tonic normalization
- Backward compatibility maintained: old API (just symbol and octave) still works
- `parseChordProgression()` now supports tonic normalization options

### Technical Details
- MAJ6 intervals: root (0), major 3rd (4), perfect 5th (7), major 6th (9)
- Letter-name integrity: MAJ6 uses root–3rd–5th–6th letter names (e.g., C–E–G–A)
- Parser correctly distinguishes `C6`/`Cmaj6` from `C13` (13th chords not parsed as 6th)
- Tonic normalization: when `preferTonicMaj6: true` and key root matches chord root, Imaj7 → maj6

### Testing
- All MAJ6 tests pass (87/87, 100% success rate)
- Verified MAJ6 intervals exactly [0, 4, 7, 9] across 40+ randomized roots
- Confirmed C6/Cmaj6 parse correctly
- Confirmed C13 does NOT parse as MAJ6
- Verified interval qualities (major 3rd, perfect 5th, major 6th)
- Tonic normalization tests pass

### Visual / Musical Impact
**MAJ6 is now a first-class chord type usable as tonic.** The system supports Barry Harris Foundations 0 compliance by providing stable tonic-compatible structures. When tonic normalization is enabled, in-key Imaj7 chords are automatically normalized to MAJ6 internally, maintaining the Foundations 0 approach while preserving user-facing symbols. This enables proper Barry Harris voicing generation where the 6th replaces the 7th in tonic contexts.

---

## [v0.2.0] - Bar Count Engine (Screenshot-Driven, No Silent Defaults)

### Added
- Bar count engine test suite (`tests/test-bar-count-engine-v0.2.0.js`)
- Chart fixtures for testing (`tests/fixtures/chart-fixtures.js`)
- `npm run test:bar-count` command
- Support for 8, 12, 16, 24, 32 bar forms
- Navigation tests to verify final bar accessibility

### Changed
- Bar count detection now uses visual evidence first, then text parsing, then musical form inference
- NEVER defaults to 4 bars - explicit fail-safe rules

### Fixed
- Bar count now matches chart length (12-bar blues, 32-bar AABA, etc.)
- Navigation can reach final bar in all tested forms
- No silent fallback to 4 bars

### Testing
- All bar count tests pass (11/11)
- Tests verify navigation reaches final bar
- Tests verify no reset to bar 4

### Visual / Musical Impact
**Bar count now accurately reflects chart length.** The system properly detects and handles various musical forms (blues, AABA, short forms) without defaulting to 4 bars. Navigation works correctly for all bar counts.

---

## [v0.1.0] - Test Harness + Baseline Audit

### Added
- Baseline audit test suite (`tests/test-baseline-audit-v0.1.0.js`)
- `npm run test:baseline` command
- Tests that document known bugs (expected to fail initially)
- `docs/roadmap.md` - Version roadmap and planning
- `docs/constraints.md` - Constraint definitions (initial draft)

### Known Issues Documented
- **BUG A**: 4-bar ceiling - Bar count must match iReal Pro screenshot chart length
- **BUG B**: Always 6-4 voicing bias - Voicing engine must generate multiple playable options

### Testing
- Baseline audit tests run and document failures
- Tests verify bar count is NOT capped at 4
- Tests verify voicing diversity (not always [6,5,4,3] string set)
- Tests verify inversion distribution is not degenerate

### Visual / Musical Impact
**Baseline established for future fixes.** The test harness now documents the known bugs that need to be addressed in subsequent versions. Tests are expected to fail initially, demonstrating the issues that need fixing.

---

## [v0.1.3] - Long-Form Stability Refinements

### Added
- Mapping history tracking (last 8 mappings) for drift detection
- Drift correction mechanism that prevents position window from wandering
- Enhanced movement type detection with anchor movement awareness
- More conservative position window management

### Changed
- Position window recentering logic - window now recenters gradually when anchor drifts from center
- Movement type detection now considers anchor movement distance, not just fret changes
- STEP vs RESET threshold adjusted to be more conservative (fewer false RESETs)

### Fixed
- Position window drift in long-form progressions (64+ bars)
- Gradual position creep that could occur over many bars

### Visual / Musical Impact
**The fretboard now maintains its position more consistently over long progressions.** Previously, the position window could gradually drift over 64 bars, causing the hand position to slowly move up or down the neck. Now, the layer detects this drift and corrects it, keeping the position centered. This creates a more stable, intentional feel - the fretboard "settles" into a position and stays there, rather than wandering. Movement feels more deliberate and less like gradual drift.

---

## [v0.1.2] - Register Reset Robustness

### Added
- Enhanced register reset detection (not just explicit signals)
- Register-appropriate string set selection on reset
- Position window reset behavior that centers on new anchor

### Changed
- Register reset now triggers on low→high or high→low register changes
- Position window reset now creates a clean window centered on new anchor
- String set selection on reset now considers register band (low register → lower strings)

### Fixed
- Register resets not being detected when register position changed significantly
- Position window not resetting cleanly on register change

### Visual / Musical Impact
**Register resets are now more intentional and visually clear.** When the harmonic engine moves from a low register to a high register (or vice versa), the projection layer detects this and performs a clean, single RESET. The position window resets to center on the new position, and the string set is chosen to match the register (low register → lower strings, high register → higher strings). This creates a clear visual break that matches the musical intent - when the harmony jumps registers, the fretboard jumps with it, cleanly and intentionally.

---

## [v0.1.1] - Improved Shape Continuity

### Added
- Shape continuity detection (prefers same shapeId when possible)
- Enhanced string set preservation (maintains string set even when shape changes)
- Improved position window management with conservative expansion

### Changed
- Movement type detection now considers string set changes, not just fret changes
- Position window expansion is more conservative (smaller adjustments)
- String set preservation prioritized even when shapeId changes

### Fixed
- String sets changing unnecessarily when shape was similar
- Position window expanding too aggressively

### Visual / Musical Impact
**The fretboard now maintains visual continuity better.** When chord shapes are similar (same inversion type), the projection layer prefers to keep the same string set and similar fret positions. This creates smoother visual transitions - the hand position stays more consistent, and changes feel more intentional. The fretboard "remembers" where it was and tries to stay in a similar position, creating a more cohesive visual flow.

---

## [v0.1.0] - Baseline Projection

### Added
- Core projection functionality: maps MIDI voicings to guitar strings and frets
- HOLD behavior: visual stillness when engine signals hold
- Position window tracking: maintains current fretboard position range
- String set priority system: prefers lower strings (6-5-4-3, then 5-4-3-2, then 4-3-2-1)
- Movement type detection: HOLD, STEP, or RESET
- Fret span constraint: maximum 5 frets (playable with one hand position)
- Octave wrapping: handles notes that require octave adjustment
- Basic shape and register preservation: passes through shapeId and registerBand from engine

### Visual / Musical Impact
**The fretboard projection layer is born.** This baseline version creates the foundation for all future versions. It successfully maps voicings to the fretboard, respects HOLD signals (creating visual stillness), and maintains a position window to keep the hand position stable. Movement types (HOLD/STEP/RESET) are detected, allowing the UI layer to understand how the fretboard is moving. The layer prioritizes lower strings (more bass-heavy, guitarist-realistic) and ensures all chords are playable (fret span ≤ 5). This creates a calm, intentional feel - the fretboard moves when it needs to, stays still when it should, and always feels playable.
