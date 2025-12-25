# Quartal Atlas Changelog

## [v1.0.1] - 2025-01-XX

### Fixed
- **Fret Markers Visibility**: Fixed fret markers not appearing below the fretboard by expanding SVG viewBox to include marker area
- **Inversion Navigation**: Fixed inversion navigation to properly change fretboard positions instead of just highlighting different notes
  - Enforced inversion-specific string-to-tone mapping (Tone[0] → String[0], etc.)
  - Each inversion now produces visibly different shapes on the fretboard

### Changed
- **Note Placement Algorithm**: Completely rewrote note placement to search entire fretboard and enforce proper inversion mapping
- **String Set Positions**: Added Low/Mid/High position options for each string set (6-3, 5-2, 4-1)
  - Low position: anchor fret 2 (frets 0-7)
  - Mid position: anchor fret 8 (frets 5-12)
  - High position: anchor fret 15 (frets 12-19)

## [v1.0] - 2025-01-XX

### Added
- Initial release of Quartal Atlas
- Core quartal harmony visualization
- 4-note quartal voicings (Root, Fourth, Seventh, Tenth)
- 4 inversions (Root Position, 1st, 2nd, 3rd)
- String set selection (6-3, 5-2, 4-1)
- Quartal types: Perfect, Mixed, Diatonic (scale-based)
- Inversion Flow navigation (Previous/Next buttons)
- Color and Black & White modes
- Limited Fretboard View (LFV)
- Practice Mode toggle
- Focus controls (Show Target Note Only, Hide Context Notes)
- Inversion Cycle Mode (manual navigation)
- Export PNG functionality
- Portrait/Landscape view toggle
- Fret markers at standard guitar positions (3, 5, 7, 9, 12, 15, 17)

### Technical
- Position-first anchoring algorithm for playable shapes
- 4-fret span constraint for realistic guitar voicings
- Comprehensive note placement across entire fretboard
- SVG-based fretboard rendering



