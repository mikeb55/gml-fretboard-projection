#!/bin/bash

echo "📦 SAVING TODAY'S WORK TO GITHUB"
echo "================================="
echo ""

# Today's commit message
COMMIT_MSG="Sept 18: VoiceLeading.js + Template fixes + Sound integration

✅ Created VoiceLeading.js for Quartet V2.0
✅ Fixed Template System integration in all apps
✅ Added working generate functions (no more fake errors!)
✅ Standardized naming to *-enhanced.html
✅ Integrated Tone.js for audio playback
✅ Created test files with sound
✅ Fixed generate button connections
✅ BULLETPROOF-9x3 protocol applied

Features:
- Voice leading with proper ranges
- 4 styles: Classical/Jazz/Pop/Modal
- Audio playback with Tone.js
- Visual progression display
- Template System working everywhere"

echo "📝 Processing repositories..."
echo ""

# Apps that were modified today
REPOS=(
    "gml-quartet"
    "quartet-engine"
    "quintet-composer"
    "triadgen"
    "gml-riffgen"
    "drum-engine"
    "gml-enhancement-suite"
)

SUCCESS=0
FAILED=0

for repo in "${REPOS[@]}"; do
    if [ -d "$repo" ]; then
        cd "$repo"
        echo "📁 $repo:"
        
        # Check for changes
        if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
            git add -A
            git commit -m "$COMMIT_MSG" 2>/dev/null
            
            if git push origin main 2>/dev/null || git push origin master 2>/dev/null; then
                echo "  ✅ Pushed successfully!"
                ((SUCCESS++))
            else
                echo "  ⚠️ Push failed (may need auth)"
                ((FAILED++))
            fi
        else
            echo "  ✓ No changes to commit"
        fi
        
        cd ..
        echo ""
    fi
done

echo "================================="
echo "📊 SUMMARY:"
echo "  ✅ Successfully pushed: $SUCCESS repos"
if [ $FAILED -gt 0 ]; then
    echo "  ⚠️ Need manual push: $FAILED repos"
fi
echo ""
echo "💾 Today's work is saved!"
echo ""

# Create today's log
cat > "LOG_$(date +%Y%m%d).md" << 'LOG'
# Session Log - Sept 18, 2025

## Completed:
1. ✅ Template System - Fixed integration across ALL apps
2. ✅ VoiceLeading.js - Created Quartet V2.0 foundation
3. ✅ Sound Integration - Added Tone.js audio playback
4. ✅ Fixed "Generate function needs to be connected" error
5. ✅ Standardized file naming (*-enhanced.html)

## Key Files Created:
- VoiceLeading.js - Voice leading rules engine
- test_voiceleading_with_sound.html - Audio test page
- universal_generator.js - Failsafe generator
- *-enhanced.html files - Standardized versions

## Next Priorities:
- GCC Module 1 (2 hours)
- Composer-Profiles MIDI parsing (3 hours)

## Test Links:
- gml-quartet/test_voiceleading_with_sound.html
- All *-enhanced.html files working
LOG

echo "📄 Session log created!"
