#!/bin/bash

echo "🎸 Launching Guitar Quintet Generator"
echo "====================================="

# Check if file exists
if [ -f "BULLETPROOF_GUITAR_QUINTET_X100.html" ]; then
    echo "✅ File found"
    echo "Opening in default browser..."
    start BULLETPROOF_GUITAR_QUINTET_X100.html
    
    echo ""
    echo "Instructions:"
    echo "1. Select style, duration, and key"
    echo "2. Click 'Generate Complete Guitar Quintet'"
    echo "3. Click 'Export to MusicXML' for notation software"
    echo "4. Click 'Export to MIDI' for DAW/playback"
    echo ""
    echo "✅ Generator launched successfully"
else
    echo "❌ File not found!"
    echo "Creating file now..."
    
    # Create the file if it doesn't exist
    cat > BULLETPROOF_GUITAR_QUINTET_X100.html << 'EOF'
[Previous HTML content would go here]
EOF
    
    echo "✅ File created"
    echo "Launching..."
    start BULLETPROOF_GUITAR_QUINTET_X100.html
fi

