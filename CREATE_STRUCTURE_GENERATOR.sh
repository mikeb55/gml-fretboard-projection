#!/bin/bash

echo "🛡️ BULLETPROOF Structure Generator for 5-Minute Compositions"
echo "==========================================================="

# Create the structure generator
cat > structure_generator.js << 'STRUCTURE'
// BULLETPROOF Structure Generator for Extended Compositions
class StructureGenerator {
    constructor() {
        this.forms = {
            ABA: ['intro', 'A', 'B', 'A', 'coda'],
            RONDO: ['intro', 'A', 'B', 'A', 'C', 'A', 'coda'],
            SONATA: ['intro', 'exposition', 'development', 'recapitulation', 'coda'],
            THROUGHCOMPOSED: ['intro', 'section1', 'section2', 'section3', 'section4', 'coda']
        };
        
        this.sectionLengths = {
            intro: { bars: 8, tempo: 'moderate' },
            A: { bars: 16, tempo: 'main' },
            B: { bars: 16, tempo: 'contrast' },
            C: { bars: 12, tempo: 'varied' },
            exposition: { bars: 32, tempo: 'main' },
            development: { bars: 24, tempo: 'varied' },
            recapitulation: { bars: 32, tempo: 'main' },
            coda: { bars: 8, tempo: 'slow' }
        };
    }
    
    generateStructure(targetMinutes = 5, form = 'ABA') {
        const targetBars = targetMinutes * 30; // Assuming 120bpm, 4/4
        const sections = this.forms[form];
        const structure = [];
        
        sections.forEach(section => {
            const baseLength = this.sectionLengths[section] || { bars: 16 };
            structure.push({
                name: section,
                bars: baseLength.bars,
                tempo: baseLength.tempo,
                key: this.selectKey(section),
                dynamics: this.selectDynamics(section),
                texture: this.selectTexture(section)
            });
        });
        
        // Scale to target length
        const totalBars = structure.reduce((sum, s) => sum + s.bars, 0);
        const scale = targetBars / totalBars;
        
        structure.forEach(s => {
            s.bars = Math.round(s.bars * scale);
            s.measures = s.bars / 4;
            s.duration = (s.bars * 2) + ' seconds'; // at 120bpm
        });
        
        return structure;
    }
    
    selectKey(section) {
        const keys = {
            intro: 'tonic',
            A: 'tonic',
            B: 'dominant',
            C: 'relative',
            exposition: 'tonic',
            development: 'varied',
            recapitulation: 'tonic',
            coda: 'tonic'
        };
        return keys[section] || 'tonic';
    }
    
    selectDynamics(section) {
        const dynamics = {
            intro: 'pp-mp',
            A: 'mf',
            B: 'f',
            C: 'mp-mf',
            exposition: 'mf-f',
            development: 'pp-ff',
            recapitulation: 'mf-f',
            coda: 'pp-p'
        };
        return dynamics[section] || 'mf';
    }
    
    selectTexture(section) {
        const textures = {
            intro: 'sparse',
            A: 'homophonic',
            B: 'polyphonic',
            C: 'dialogic',
            exposition: 'full',
            development: 'fragmented',
            recapitulation: 'full',
            coda: 'thinning'
        };
        return textures[section] || 'homophonic';
    }
    
    applyToQuintet(structure) {
        // Map structure to quintet voices
        return structure.map(section => ({
            ...section,
            violin1: this.generateVoiceRole('violin1', section),
            violin2: this.generateVoiceRole('violin2', section),
            viola: this.generateVoiceRole('viola', section),
            cello: this.generateVoiceRole('cello', section),
            bass: this.generateVoiceRole('bass', section)
        }));
    }
    
    generateVoiceRole(instrument, section) {
        const roles = {
            sparse: { violin1: 'melody', violin2: 'rest', viola: 'rest', cello: 'pedal', bass: 'pedal' },
            homophonic: { violin1: 'melody', violin2: 'harmony', viola: 'harmony', cello: 'bass', bass: 'bass' },
            polyphonic: { violin1: 'voice1', violin2: 'voice2', viola: 'voice3', cello: 'voice4', bass: 'voice5' },
            dialogic: { violin1: 'question', violin2: 'answer', viola: 'comment', cello: 'support', bass: 'support' },
            full: { violin1: 'lead', violin2: 'counter', viola: 'fill', cello: 'rhythm', bass: 'foundation' },
            fragmented: { violin1: 'fragment', violin2: 'fragment', viola: 'fragment', cello: 'fragment', bass: 'sparse' },
            thinning: { violin1: 'fade', violin2: 'fade', viola: 'sustain', cello: 'sustain', bass: 'pedal' }
        };
        
        const texture = section.texture;
        return roles[texture] ? roles[texture][instrument] : 'support';
    }
}

// Export for use
if (typeof module !== 'undefined') {
    module.exports = StructureGenerator;
}
window.StructureGenerator = StructureGenerator;
STRUCTURE

echo "✅ Structure Generator created"

# Create test interface
cat > test_structure.html << 'TEST'
<!DOCTYPE html>
<html>
<head>
    <title>Structure Generator Test</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: white; }
        .section { background: rgba(255,255,255,0.1); padding: 15px; margin: 10px; border-radius: 8px; }
        button { background: #4CAF50; color: white; padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; }
        select { padding: 8px; margin: 5px; }
        #output { background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; white-space: pre; font-family: monospace; }
    </style>
</head>
<body>
    <h1>5-Minute Composition Structure Generator</h1>
    
    <div class="section">
        <label>Form:</label>
        <select id="form">
            <option value="ABA">ABA (Classic)</option>
            <option value="RONDO">Rondo</option>
            <option value="SONATA">Sonata</option>
            <option value="THROUGHCOMPOSED">Through-Composed</option>
        </select>
        
        <label>Duration (minutes):</label>
        <input type="number" id="duration" value="5" min="1" max="10">
        
        <button onclick="generateStructure()">Generate Structure</button>
        <button onclick="applyToQuintet()">Apply to Quintet</button>
    </div>
    
    <div id="output"></div>
    
    <script src="structure_generator.js"></script>
    <script>
        const generator = new StructureGenerator();
        let currentStructure = null;
        
        function generateStructure() {
            const form = document.getElementById('form').value;
            const duration = parseInt(document.getElementById('duration').value);
            
            currentStructure = generator.generateStructure(duration, form);
            
            let output = `STRUCTURE: ${form} - ${duration} minutes\n`;
            output += '='.repeat(50) + '\n\n';
            
            currentStructure.forEach((section, i) => {
                output += `${i+1}. ${section.name.toUpperCase()}\n`;
                output += `   Bars: ${section.bars} (${section.duration})\n`;
                output += `   Key: ${section.key}\n`;
                output += `   Dynamics: ${section.dynamics}\n`;
                output += `   Texture: ${section.texture}\n\n`;
            });
            
            const totalBars = currentStructure.reduce((sum, s) => sum + s.bars, 0);
            output += `\nTOTAL: ${totalBars} bars (~${Math.round(totalBars * 2)} seconds at 120bpm)`;
            
            document.getElementById('output').textContent = output;
        }
        
        function applyToQuintet() {
            if (!currentStructure) generateStructure();
            
            const quintetStructure = generator.applyToQuintet(currentStructure);
            
            let output = 'QUINTET ARRANGEMENT\n';
            output += '='.repeat(50) + '\n\n';
            
            quintetStructure.forEach((section, i) => {
                output += `${section.name.toUpperCase()}\n`;
                output += `  Violin I:  ${section.violin1}\n`;
                output += `  Violin II: ${section.violin2}\n`;
                output += `  Viola:     ${section.viola}\n`;
                output += `  Cello:     ${section.cello}\n`;
                output += `  Bass:      ${section.bass}\n\n`;
            });
            
            document.getElementById('output').textContent = output;
        }
        
        // Auto-generate on load
        generateStructure();
    </script>
</body>
</html>
TEST

echo "✅ Test interface created"

# Add to quintet composer
if [ -d "quintet-composer" ]; then
    cp structure_generator.js quintet-composer/
    echo "✅ Added to quintet-composer"
fi

echo ""
echo "==========================================================="
echo "✅ STRUCTURE GENERATOR COMPLETE!"
echo ""
echo "Features:"
echo "  • 4 classical forms (ABA, Rondo, Sonata, Through-Composed)"
echo "  • Automatic scaling to target duration"
echo "  • Section-specific dynamics and textures"
echo "  • Voice role assignment for quintet"
echo "  • Key relationship mapping"
echo ""
echo "Test with: test_structure.html"
echo ""
echo "Next: Extended VoiceLeading for 5 voices (45 minutes)"
echo "==========================================================="

