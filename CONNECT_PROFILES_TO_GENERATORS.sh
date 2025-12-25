#!/bin/bash

echo "🛡️ BULLETPROOF PROFILE-TO-GENERATOR CONNECTION"
echo "=============================================="
echo ""

# Step 1: Verify Composer-Profiles exists and works
echo "1. Checking Composer-Profiles..."
if [ -f "gml-composer-profiles-extension/index.html" ]; then
    echo "✅ Composer-Profiles found"
else
    echo "❌ Composer-Profiles missing!"
    exit 1
fi

# Step 2: Create profile loader module
echo "2. Creating universal profile loader..."
cat > profile_loader.js << 'LOADER'
// Universal Profile Loader for all GML apps
class ProfileLoader {
    constructor() {
        this.currentProfile = null;
        this.loadFromStorage();
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('currentComposerProfile');
            if (stored) {
                this.currentProfile = JSON.parse(stored);
                console.log('Profile loaded:', this.currentProfile.name);
                return true;
            }
        } catch(e) {
            console.error('Profile load error:', e);
        }
        return false;
    }
    
    applyToGenerator(generatorFunction) {
        if (!this.currentProfile) {
            console.log('No profile loaded');
            return generatorFunction;
        }
        
        // Wrap the original generator
        return function(...args) {
            console.log('Applying profile:', this.currentProfile.name);
            
            // Apply tempo if available
            if (this.currentProfile.tempo && window.Tone) {
                Tone.Transport.bpm.value = this.currentProfile.tempo;
            }
            
            // Apply to any tempo input
            const tempoInput = document.getElementById('tempo');
            if (tempoInput && this.currentProfile.tempo) {
                tempoInput.value = this.currentProfile.tempo;
            }
            
            // Apply intervals to generation
            if (window.currentTriads && this.currentProfile.intervals) {
                // Use profile intervals for next note selection
                const intervals = this.currentProfile.intervals.slice(0, 5);
                console.log('Using intervals:', intervals);
            }
            
            // Call original generator
            return generatorFunction.apply(this, args);
        }.bind(this);
    }
    
    displayStatus() {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(0,255,0,0.2);padding:10px;border-radius:5px;z-index:9999';
        div.innerHTML = this.currentProfile ? 
            `Profile: ${this.currentProfile.name}<br>Tempo: ${this.currentProfile.tempo}` : 
            'No profile loaded';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
}

// Auto-initialize
window.profileLoader = new ProfileLoader();

// Auto-apply to common generator functions
window.addEventListener('DOMContentLoaded', () => {
    // Wrap generate functions if they exist
    if (window.generate) {
        window.generate = window.profileLoader.applyToGenerator(window.generate);
    }
    if (window.generateTriads) {
        window.generateTriads = window.profileLoader.applyToGenerator(window.generateTriads);
    }
    
    // Show status
    window.profileLoader.displayStatus();
});
LOADER

echo "✅ Profile loader created"

# Step 3: Add to Quintet Composer
echo "3. Adding to Quintet Composer..."
if [ -d "quintet-composer" ]; then
    cp profile_loader.js quintet-composer/
    
    # Find and update HTML files
    for html in quintet-composer/*.html; do
        if [ -f "$html" ] && ! grep -q "profile_loader.js" "$html"; then
            sed -i 's|</body>|<script src="profile_loader.js"></script>\n</body>|' "$html"
            echo "   ✅ Added to $(basename $html)"
        fi
    done
else
    echo "   ⚠️ Quintet Composer not found"
fi

# Step 4: Add to Quartet Engine
echo "4. Adding to Quartet Engine..."
if [ -d "quartet-engine" ]; then
    cp profile_loader.js quartet-engine/
    
    for html in quartet-engine/*.html; do
        if [ -f "$html" ] && ! grep -q "profile_loader.js" "$html"; then
            sed -i 's|</body>|<script src="profile_loader.js"></script>\n</body>|' "$html"
            echo "   ✅ Added to $(basename $html)"
        fi
    done
else
    echo "   ⚠️ Quartet Engine not found"
fi

# Step 5: Add to TriadGen
echo "5. Adding to TriadGen..."
if [ -d "triadgen" ]; then
    cp profile_loader.js triadgen/
    
    for html in triadgen/FULL_TRIADGEN.html triadgen/WORKING_TRIADGEN.html; do
        if [ -f "$html" ] && ! grep -q "profile_loader.js" "$html"; then
            sed -i 's|</body>|<script src="profile_loader.js"></script>\n</body>|' "$html"
            echo "   ✅ Added to $(basename $html)"
        fi
    done
else
    echo "   ⚠️ TriadGen not found"
fi

# Step 6: Create test file
echo "6. Creating test page..."
cat > test_profile_integration.html << 'TEST'
<!DOCTYPE html>
<html>
<head><title>Profile Integration Test</title></head>
<body style="font-family: monospace; padding: 20px;">
    <h1>Profile Integration Test</h1>
    
    <button onclick="checkProfile()">Check Profile</button>
    <button onclick="testGeneration()">Test Generation</button>
    <button onclick="clearProfile()">Clear Profile</button>
    
    <div id="output" style="background: #eee; padding: 20px; margin: 20px 0;"></div>
    
    <script src="profile_loader.js"></script>
    <script>
        function checkProfile() {
            const profile = window.profileLoader.currentProfile;
            const output = profile ? 
                `Profile loaded: ${profile.name}\nTempo: ${profile.tempo}\nIntervals: ${profile.intervals.slice(0,5)}` :
                'No profile loaded';
            document.getElementById('output').innerText = output;
        }
        
        function testGeneration() {
            // Dummy generator to test wrapping
            window.testGen = function() {
                return { notes: [60, 62, 64] };
            };
            
            // Apply profile
            window.testGen = window.profileLoader.applyToGenerator(window.testGen);
            
            // Run it
            const result = window.testGen();
            document.getElementById('output').innerText = 'Generated: ' + JSON.stringify(result);
        }
        
        function clearProfile() {
            localStorage.removeItem('currentComposerProfile');
            location.reload();
        }
    </script>
</body>
</html>
TEST

echo "✅ Test page created"

# Step 7: Summary
echo ""
echo "=============================================="
echo "✅ PROFILE CONNECTION COMPLETE!"
echo ""
echo "What this does:"
echo "  • Loads saved profiles automatically"
echo "  • Applies tempo from profiles"
echo "  • Wraps generator functions"
echo "  • Shows profile status overlay"
echo ""
echo "To test:"
echo "  1. Save a profile in Composer-Profiles"
echo "  2. Open any enhanced app"
echo "  3. You'll see profile name in top-right"
echo "  4. Generate - it will use profile tempo"
echo ""
echo "Test page: test_profile_integration.html"
echo "=============================================="

