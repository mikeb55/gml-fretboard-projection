#!/bin/bash

echo "Integrating rhythm patterns..."

# Add to TriadGen
cp rhythm_patterns.js triadgen/
sed -i 's|</body>|<script src="rhythm_patterns.js"></script>\n</body>|' triadgen/FULL_TRIADGEN.html

# Add to Quintet
cp rhythm_patterns.js quintet-composer/
for f in quintet-composer/*-enhanced.html; do
    if [ -f "$f" ]; then
        sed -i 's|</body>|<script src="rhythm_patterns.js"></script>\n</body>|' "$f"
    fi
done

echo "✅ Rhythm patterns integrated"
