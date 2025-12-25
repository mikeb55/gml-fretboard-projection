#!/bin/bash

echo "📊 Updating Master Dashboard - 10 minutes"

# Add today's new files to dashboard
sed -i '/<div class="grid">/a\
        <!-- New Today -->\
        <div class="app-card">\
            <div class="app-status status-new"></div>\
            <h3>🎼 Composer Profiles</h3>\
            <p class="app-description">MIDI pattern extractor - 85% complete</p>\
            <div class="app-features">\
                <span class="feature-tag new">MIDI Parser</span>\
                <span class="feature-tag new">Pattern Extraction</span>\
            </div>\
            <div class="app-actions">\
                <a href="gml-composer-profiles-extension/index.html" class="btn btn-primary">Open</a>\
            </div>\
        </div>' GML_MASTER_DASHBOARD.html

git add GML_MASTER_DASHBOARD.html
git commit -m "Dashboard updated with Composer Profiles"
git push origin main

echo "✅ Dashboard updated in 10 minutes"
start GML_MASTER_DASHBOARD.html
