# Changelog

All notable changes to the Fretboard Projection Layer are documented in this file.

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
