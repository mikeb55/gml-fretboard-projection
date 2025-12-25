#!/bin/bash
echo "🎼 Installing VoiceLeading.js..."

# Save VoiceLeading.js to quartet apps
for app in gml-quartet quartet-engine; do
    if [ -d "$app" ]; then
        # Copy the VoiceLeading.js from the artifact content
        # (You'll need to save the artifact content as VoiceLeading.js first)
        echo "Installing in $app..."
        
        # Add to enhanced HTML
        for html in "$app"/*-enhanced.html "$app"/quartet*.html; do
            if [ -f "$html" ] && ! grep -q "VoiceLeading" "$html"; then
                sed -i 's|</body>|<script src="VoiceLeading.js"></script>\n</body>|' "$html"
                echo "  ✅ Added to $(basename $html)"
            fi
        done
    fi
done

echo "🎵 VoiceLeading.js installed!"
echo ""
echo "Test it with: new VoiceLeading().generateProgression(8, 'jazz')"
