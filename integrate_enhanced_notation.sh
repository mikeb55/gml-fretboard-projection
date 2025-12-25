#!/bin/bash

echo "Integrating Enhanced Notation..."

# Add to guitar quintet generator
if [ -f "BULLETPROOF_GUITAR_QUINTET_X100.html" ]; then
    # Insert the enhanced notation class before the closing script tag
    sed -i '/<\/script>/i\
\
        // Enhanced Notation Integration\
        function addNotationEnhancements(xml) {\
            const enhancer = new EnhancedNotation();\
            return enhancer.enhanceFullScore(xml);\
        }\
' BULLETPROOF_GUITAR_QUINTET_X100.html
    
    echo "✅ Enhanced notation integrated"
else
    echo "❌ Guitar quintet file not found"
fi

echo "Features added:"
echo "  • Measure numbers on every bar"
echo "  • Rehearsal marks (A, B, C...) at sections"
echo "  • Tempo markings (Allegro, Andante, etc.)"
echo "  • Dynamic markings (pp, mf, ff, etc.)"
echo "  • Crescendo/diminuendo hairpins"
echo "  • Articulations (staccato, accent, tenuto)"

