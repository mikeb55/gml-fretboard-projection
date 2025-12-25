#!/bin/bash

echo "📁 STANDARDIZING ENHANCED FILES"
echo "================================"
echo ""

# Define the standard naming for each app
declare -A APP_NAMES=(
    ["gml-riffgen"]="riffgen-enhanced.html"
    ["triadgen"]="triadgen-enhanced.html"
    ["quartet-engine"]="quartet-engine-enhanced.html"
    ["quintet-composer"]="quintet-enhanced.html"
    ["drum-engine"]="drum-engine-enhanced.html"
    ["gml-quartet"]="quartet-enhanced.html"
    ["generative-chamber-composer"]="gcc-enhanced.html"
    ["infinite-riff-machine"]="riff-machine-enhanced.html"
    ["string-fx-mapper"]="string-fx-enhanced.html"
)

for app in "${!APP_NAMES[@]}"; do
    if [ -d "$app" ]; then
        cd "$app"
        target="${APP_NAMES[$app]}"
        
        # Find the best enhanced/fixed file to use as source
        if [ -f "index-enhanced.html" ]; then
            cp "index-enhanced.html" "$target"
            echo "✅ $app → $target"
        elif [ -f "*-enhanced.html" ]; then
            cp *-enhanced.html "$target" 2>/dev/null
            echo "✅ $app → $target"
        elif [ -f "*_fixed.html" ]; then
            cp *_fixed.html "$target" 2>/dev/null
            echo "✅ $app → $target (from fixed)"
        elif [ -f "index.html" ]; then
            cp "index.html" "$target"
            echo "📝 $app → $target (from original)"
        fi
        
        cd ..
    fi
done

echo ""
echo "📋 QUICK ACCESS LIST:"
echo "===================="
for app in "${!APP_NAMES[@]}"; do
    if [ -f "$app/${APP_NAMES[$app]}" ]; then
        echo "• $app/${APP_NAMES[$app]}"
    fi
done

echo ""
echo "✨ Standardization complete!"
echo ""
echo "💡 Test them all with:"
echo "   for f in */*-enhanced.html; do echo \$f; done"
