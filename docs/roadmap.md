# Fretboard Projection Layer - Version Roadmap

## Current Version: v0.1.3

## Version History & Roadmap

### v0.1.0 - Test Harness + Baseline Audit ✅
**Status**: Complete

**Objectives**:
- Add test harness that documents known bugs
- Create tests that fail on 4-bar cap and 6-4 voicing bias
- Establish baseline for future fixes

**Deliverables**:
- `tests/test-baseline-audit-v0.1.0.js` - Baseline audit test suite
- `npm run test:baseline` command
- Tests document known bugs (expected to fail initially)

**Known Issues Documented**:
- A) 4-bar ceiling: Bar count must match iReal Pro screenshot chart length
- B) Always 6-4 voicing bias: Voicing engine must generate multiple playable options

---

### v0.2.0 - Bar Count Engine (Screenshot-Driven, No Silent Defaults) 🔄
**Status**: In Progress

**Objectives**:
- Implement bar counting subsystem with screenshot/image support
- Remove any silent defaults to 4 bars
- Refactor core data model to store bars[] dynamically
- Ensure UI navigation clamps only at [1..totalBars]

**Key Features**:
- `detectBarCountFromIRealScreenshot(imageBytes)` function
- Visual evidence first, then text parsing, then musical form inference
- NEVER default to 4 bars
- Support 8, 12, 16, 24, 32 bar forms

**Tests Required**:
- 12-bar blues fixture
- 32-bar AABA fixture
- 8/16-bar short form fixtures
- Assert navigation reaches final bar
- Assert no resets to bar 4

---

### v0.3.0 - Voicing Engine v1 (Stop Always-6-4) 🔄
**Status**: In Progress

**Objectives**:
- Implement voicing generator with explicit constraints
- Generate multiple voicing candidates
- Score candidates by playability, voice-leading, register, diversity
- Add "diversity governor" to prevent always selecting same shape

**Key Features**:
- `generateVoicings(chordTones, context) -> VoicingCandidate[]`
- Multiple string sets: [6,5,4,3], [5,4,3,2], [4,3,2,1], and variations
- Multiple inversions: root, first, second, third
- Drop voicings (omit 5th, etc.)
- Voice-leading scoring
- Diversity penalties for repetition

**Constraints**:
- fretSpan <= 5 (configurable)
- maxJumpBetweenVoicings <= 5 semitones average
- Avoid extreme registers unless requested
- Prefer common tones
- Allow omissions with reason codes

**Tests Required**:
- "Not always 6-4" test: 100 random trials, assert 3+ string sets
- Inversion distribution not degenerate (not 90% same)
- Playability tests: fretSpan never exceeds limit

---

### v0.4.0 - Labyrinth Constraints Layer (Explainable Walls) 📋
**Status**: Planned

**Objectives**:
- Create explicit constraint system
- Document allowed/illegal states
- Implement move validation with reason codes
- UI shows allowed/blocked moves with explanations

**Key Features**:
- `docs/constraints.md` - Constraint definitions
- `validateMove(prevState, nextState) -> { ok, reasonCodes[] }`
- UI displays:
  - Current state
  - Allowed moves
  - Blocked moves with reasons

**Constraints to Document**:
- Allowed states (valid fretboard positions)
- Illegal states (impossible positions)
- Adjacency rules (valid moves between states)
- Invariants (always-true conditions)

**Tests Required**:
- Attempt illegal moves, assert blocked with reason codes
- No silent substitution
- All moves explainable

---

### v0.5.0 - Full Automated Regression Suite + "Never Ask Me To Click" Mode 📋
**Status**: Planned

**Objectives**:
- Add `npm run verify` command
- Run lint, unit, integration (>=40 trials), golden tests
- Auto-cycle demo in dev mode (no clicking needed)
- Generate test reports

**Key Features**:
- `npm run verify` - One command runs everything
- >=40 randomized trials per integration test
- Golden tests for deterministic validation
- Auto-cycling demo for visual verification
- Test report generation

**Deliverables**:
- CI-style verification script
- Test report format
- Auto-demo mode

---

## Non-Negotiable Rules

1. **No hardcoded bar caps** - No default to 4, no silent fallback
2. **No single template inversion** - Must support multiple inversions, drop voicings, string sets
3. **No UI-dependent testing** - All validation through headless unit/integration tests
4. **Every invalid state returns Reasons** - Machine-readable ReasonCodes + human text
5. **Every version updates docs** - README.md, CHANGELOG.md, docs/roadmap.md, docs/constraints.md
6. **Each version runs >=40 randomized trials** - Plus deterministic golden tests

---

## Testing Philosophy

- **Fail First**: Tests document bugs before fixing them
- **Headless**: No UI dependencies in tests
- **Comprehensive**: >=40 randomized trials + golden tests
- **Explainable**: Every failure has a reason code
- **Automated**: One command runs everything

---

## Success Criteria

- ✅ v0.1.0: Test harness exists, documents known bugs
- ⏳ v0.2.0: Bar count matches screenshot, no 4-bar default
- ⏳ v0.3.0: Voicing diversity, no always-6-4 bias
- ⏳ v0.4.0: Constraints explainable, moves validated
- ⏳ v0.5.0: Full regression suite, automated verification

