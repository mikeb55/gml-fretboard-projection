#!/bin/bash
WORKSPACE="/c/Users/mike/Documents/gml-workspace"
BACKUP_DIR="$WORKSPACE/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Template integration code
TEMPLATE_CODE='<script src="https://raw.githubusercontent.com/mikeb55/-gml-enhancement-suite/main/templates/TemplateSystem.js"></script>
<script>
window.addEventListener("DOMContentLoaded", async () => {
    if (window.TemplateSystem) {
        window.templateSystem = new TemplateSystem();
        await window.templateSystem.init();
        var container = document.getElementById("controls") || document.body;
        window.templateSystem.createDropdown(container.id || "body", (g,t) => console.log("Loaded:", g));
    }
});
</script>'

# Add to all apps
for app in gml-riffgen triadgen quartet-engine quintet-composer drum-engine gml-quartet; do
    FILE="$WORKSPACE/$app/index.html"
    if [ -f "$FILE" ]; then
        echo "✅ Updating $app..."
        cp "$FILE" "$BACKUP_DIR/$app-index.html"
        if ! grep -q "Template System" "$FILE"; then
            sed -i "s|</body>|$TEMPLATE_CODE\n</body>|" "$FILE"
        fi
    fi
done

echo "🎉 COMPLETE! Template System added to all apps!"
echo "🔧 Test any app or open: file://$WORKSPACE/verify_templates.html"
