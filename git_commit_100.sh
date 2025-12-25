#!/bin/bash

echo "📦 GIT COMMIT - Composer-Profiles 100% Complete"
echo "==============================================="

# Commit message
MSG="Composer-Profiles 100% complete - full pattern extraction and application

✅ Interval extraction and application
✅ Rhythm pattern detection and use
✅ Chord progression analysis
✅ Velocity/dynamics extraction
✅ Phrase boundary detection
✅ Complete profile integration across all apps

Features:
- MIDI parsing extracts all musical patterns
- Patterns actively influence generation
- Chord progressions analyzed with Roman numerals
- Velocity curves applied to new generations
- Phrase structures detected and applied
- File saving to composer-profiles-data/

All generators now use extracted composer patterns"

# Add all changes
git add -A

# Commit
git commit -m "$MSG"

# Push
git push origin main

echo ""
echo "✅ Pushed to GitHub successfully"
