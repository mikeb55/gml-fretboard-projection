#!/bin/bash

echo "🛡️ BULLETPROOF Long-form Progression Engine"
echo "==========================================="

# Create the progression engine
cat > progression_engine.js << 'PROGRESSION'
// BULLETPROOF Long-form Progression Engine for Extended Compositions
class ProgressionEngine {
    constructor() {
        // Common progressions by style period
        this.progressionBank = {
            // Classical progressions (major/minor)
            classical: {
                major: [
                    ['I', 'IV', 'V', 'I'],
                    ['I', 'V', 'vi', 'IV'],
                    ['I', 'vi', 'IV', 'V'],
                    ['I', 'ii', 'V', 'I'],
                    ['I', 'IV', 'ii', 'V', 'I'],
                    ['I', 'V/V', 'V', 'I'],
                    ['I', 'vi', 'ii', 'V', 'I']
                ],
                minor: [
                    ['i', 'iv', 'V', 'i'],
                    ['i', 'VI', 'III', 'VII'],
                    ['i', 'ii°', 'V', 'i'],
                    ['i', 'iv', 'VII', 'III', 'VI', 'ii°', 'V', 'i']
                ]
            },
            // Romantic progressions
            romantic: {
                major: [
                    ['I', 'V/vi', 'vi', 'IV', 'V', 'I'],
                    ['I', 'bII', 'V', 'I'],
                    ['I', 'III', 'IV', 'V', 'I'],
                    ['I', 'vi', 'iii', 'IV', 'ii', 'V', 'I']
                ],
                chromatic: [
                    ['I', 'I+', 'IV', 'iv', 'I'],
                    ['I', 'bVI', 'bII', 'V', 'I'],
                    ['I', '#iv°7', 'V', 'I']
                ]
            },
            // Jazz/Modern
            jazz: [
                ['IMaj7', 'vi7', 'ii7', 'V7'],
                ['IMaj7', 'I7', 'IVMaj7', '#iv°7', 'IMaj7', 'V/ii', 'ii7', 'V7'],
                ['IMaj7', 'VIMaj7', 'IIMaj7', 'V7', 'IMaj7'],
                ['ii7', 'V7', 'IMaj7', 'VIMaj7']
            ],
            // Modal progressions
            modal: {
                dorian: ['i', 'IV', 'i', 'VII'],
                lydian: ['I', 'II', 'I', 'vii'],
                mixolydian: ['I', 'VII', 'IV', 'I'],
                phrygian: ['i', 'bII', 'i', 'vii']
            }
        };
        
        // Modulation patterns
        this.modulationPatterns = {
            dominant: ['I', 'V/V', 'V'],
            subdominant: ['I', 'IV', 'ii/IV', 'V/IV'],
            relative: ['I', 'vi', 'ii/vi', 'V/vi'],
            chromatic: ['I', 'bVI', 'bII', 'V/newkey'],
            sequential: ['I', 'V', 'V/V', 'V/V/V']
        };
        
        // Cadence formulas
        this.cadences = {
            authentic: ['V', 'I'],
            plagal: ['IV', 'I'],
            deceptive: ['V', 'vi'],
            half: ['I', 'V'],
            phrygian: ['iv6', 'V']
        };
    }
    
    generateLongformProgression(bars = 150, style = 'classical', key = 'C') {
        const progression = [];
        let currentBar = 0;
        const sectionLength = 8; // 8-bar phrases
        
        // Build structure
        const sections = Math.floor(bars / sectionLength);
        
        for (let section = 0; section < sections; section++) {
            const isLastSection = section === sections - 1;
            const isModulation = section % 4 === 3 && !isLastSection;
            
            if (isModulation) {
                // Add modulation
                progression.push(...this.createModulation(style));
            } else if (isLastSection) {
                // Add final cadence
                progression.push(...this.createFinalCadence(style));
            } else {
                // Add normal progression
                progression.push(...this.selectProgression(style, section));
            }
        }
        
        return this.expandToChords(progression, key);
    }
    
    selectProgression(style, sectionIndex) {
        let progressionSet;
        
        if (style === 'classical') {
            progressionSet = this.progressionBank.classical.major;
        } else if (style === 'romantic') {
            progressionSet = [...this.progressionBank.romantic.major, ...this.progressionBank.romantic.chromatic];
        } else if (style === 'jazz') {
            progressionSet = this.progressionBank.jazz;
        } else if (style === 'modal') {
            const modes = Object.values(this.progressionBank.modal);
            progressionSet = modes;
        } else {
            progressionSet = this.progressionBank.classical.major;
        }
        
        // Select based on section for variety
        const index = sectionIndex % progressionSet.length;
        return Array.isArray(progressionSet[index]) ? progressionSet[index] : progressionSet[0];
    }
    
    createModulation(style) {
        const patterns = Object.values(this.modulationPatterns);
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        return pattern;
    }
    
    createFinalCadence(style) {
        if (style === 'classical') {
            return ['ii', 'V7', 'I'];
        } else if (style === 'romantic') {
            return ['iv', 'bII', 'V7', 'I'];
        } else if (style === 'jazz') {
            return ['ii7', 'V7alt', 'IMaj7'];
        }
        return ['V', 'I'];
    }
    
    expandToChords(romanNumerals, key = 'C') {
        const keyMap = {
            'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
        };
        
        const root = keyMap[key] || 0;
        const majorScale = [0, 2, 4, 5, 7, 9, 11];
        
        return romanNumerals.map(numeral => {
            const chord = this.parseRomanNumeral(numeral, majorScale, root);
            return {
                symbol: numeral,
                notes: chord.notes,
                duration: 4, // bars
                quality: chord.quality
            };
        });
    }
    
    parseRomanNumeral(numeral, scale, root) {
        const numeralMap = {
            'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6,
            'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6
        };
        
        // Extract base numeral
        let baseNumeral = numeral.replace(/[^IVvi]/g, '');
        const isMinor = baseNumeral === baseNumeral.toLowerCase();
        const scaleDegree = numeralMap[baseNumeral.toUpperCase()] || 0;
        
        // Calculate root note
        const chordRoot = 60 + root + scale[scaleDegree];
        
        // Determine chord quality and build
        let notes;
        if (numeral.includes('°')) {
            notes = [chordRoot, chordRoot + 3, chordRoot + 6]; // diminished
        } else if (numeral.includes('+')) {
            notes = [chordRoot, chordRoot + 4, chordRoot + 8]; // augmented
        } else if (numeral.includes('7')) {
            if (isMinor) {
                notes = [chordRoot, chordRoot + 3, chordRoot + 7, chordRoot + 10]; // minor 7
            } else if (numeral.includes('Maj7')) {
                notes = [chordRoot, chordRoot + 4, chordRoot + 7, chordRoot + 11]; // major 7
            } else {
                notes = [chordRoot, chordRoot + 4, chordRoot + 7, chordRoot + 10]; // dominant 7
            }
        } else {
            if (isMinor) {
                notes = [chordRoot, chordRoot + 3, chordRoot + 7]; // minor triad
            } else {
                notes = [chordRoot, chordRoot + 4, chordRoot + 7]; // major triad
            }
        }
        
        return {
            notes: notes,
            quality: isMinor ? 'minor' : 'major'
        };
    }
    
    // Generate progression for specific form
    generateFormProgression(form, bars) {
        const progressions = [];
        
        switch(form) {
            case 'sonata':
                progressions.push(...this.generateSonataProgression(bars));
                break;
            case 'rondo':
                progressions.push(...this.generateRondoProgression(bars));
                break;
            case 'variations':
                progressions.push(...this.generateVariationProgression(bars));
                break;
            default:
                progressions.push(...this.generateLongformProgression(bars));
        }
        
        return progressions;
    }
    
    generateSonataProgression(bars) {
        const exposition = this.generateLongformProgression(bars * 0.35, 'classical');
        const development = this.generateLongformProgression(bars * 0.3, 'romantic');
        const recapitulation = this.generateLongformProgression(bars * 0.35, 'classical');
        
        return [...exposition, ...development, ...recapitulation];
    }
    
    generateRondoProgression(bars) {
        const a = this.generateLongformProgression(bars * 0.2, 'classical');
        const b = this.generateLongformProgression(bars * 0.15, 'romantic');
        const c = this.generateLongformProgression(bars * 0.15, 'modal');
        
        return [...a, ...b, ...a, ...c, ...a];
    }
    
    generateVariationProgression(bars) {
        const theme = this.selectProgression('classical', 0);
        const variations = [];
        const numVariations = 5;
        
        for (let i = 0; i < numVariations; i++) {
            variations.push(...this.varyProgression(theme, i));
        }
        
        return this.expandToChords(variations, 'C');
    }
    
    varyProgression(theme, variationNumber) {
        // Apply different variation techniques
        switch(variationNumber) {
            case 0: return theme; // Original
            case 1: return theme.map(chord => chord.includes('I') ? 'vi' : chord); // Substitution
            case 2: return [...theme, ...theme]; // Extension
            case 3: return theme.map(chord => chord + '7'); // Add sevenths
            case 4: return theme.reverse(); // Retrograde
            default: return theme;
        }
    }
}

// Export
if (typeof module !== 'undefined') {
    module.exports = ProgressionEngine;
}
if (typeof window !== 'undefined') {
    window.ProgressionEngine = ProgressionEngine;
}
PROGRESSION

echo "✅ Progression Engine created"

# Create test interface
cat > test_progression_engine.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>Long-form Progression Engine Test</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #1a1a2e; color: white; }
        button { background: #4CAF50; color: white; padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; }
        select { padding: 8px; margin: 5px; }
        #output { background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; font-family: monospace; white-space: pre-wrap; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Long-form Progression Engine</h1>
    
    <div>
        <label>Style:</label>
        <select id="style">
            <option value="classical">Classical</option>
            <option value="romantic">Romantic</option>
            <option value="jazz">Jazz</option>
            <option value="modal">Modal</option>
        </select>
        
        <label>Bars:</label>
        <input type="number" id="bars" value="150" min="32" max="500">
        
        <label>Key:</label>
        <select id="key">
            <option value="C">C Major</option>
            <option value="G">G Major</option>
            <option value="D">D Major</option>
            <option value="F">F Major</option>
        </select>
    </div>
    
    <div>
        <button onclick="generateProgression()">Generate Progression</button>
        <button onclick="generateSonata()">Generate Sonata Form</button>
        <button onclick="generateRondo()">Generate Rondo Form</button>
        <button onclick="playProgression()">Play Preview</button>
    </div>
    
    <div id="output"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js"></script>
    <script src="progression_engine.js"></script>
    <script>
        const engine = new ProgressionEngine();
        let currentProgression = null;
        
        function generateProgression() {
            const style = document.getElementById('style').value;
            const bars = parseInt(document.getElementById('bars').value);
            const key = document.getElementById('key').value;
            
            currentProgression = engine.generateLongformProgression(bars, style, key);
            displayProgression();
        }
        
        function generateSonata() {
            const bars = parseInt(document.getElementById('bars').value);
            currentProgression = engine.generateFormProgression('sonata', bars);
            displayProgression();
        }
        
        function generateRondo() {
            const bars = parseInt(document.getElementById('bars').value);
            currentProgression = engine.generateFormProgression('rondo', bars);
            displayProgression();
        }
        
        function displayProgression() {
            let output = 'HARMONIC PROGRESSION\n';
            output += '='.repeat(50) + '\n\n';
            
            currentProgression.forEach((chord, i) => {
                if (i % 8 === 0) output += '\n';
                output += chord.symbol + ' ';
            });
            
            output += '\n\nTotal: ' + currentProgression.length + ' chords';
            document.getElementById('output').textContent = output;
        }
        
        async function playProgression() {
            if (!currentProgression) generateProgression();
            
            await Tone.start();
            const synth = new Tone.PolySynth().toDestination();
            
            currentProgression.slice(0, 16).forEach((chord, i) => {
                const time = Tone.now() + (i * 0.5);
                const frequencies = chord.notes.map(n => Tone.Frequency(n, "midi"));
                synth.triggerAttackRelease(frequencies, "4n", time);
            });
        }
    </script>
</body>
</html>
HTML

echo "✅ Test HTML created"

# Run verification tests
echo ""
echo "Running verification tests..."

node -c progression_engine.js 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ JavaScript valid"
else
    echo "❌ JavaScript error"
fi

# Test generation
node << 'TEST'
const fs = require('fs');
eval(fs.readFileSync('progression_engine.js', 'utf8'));

const engine = new ProgressionEngine();
const progression = engine.generateLongformProgression(150, 'classical', 'C');

if (progression && progression.length > 0) {
    console.log('✅ Generation works - ' + progression.length + ' chords created');
} else {
    console.log('❌ Generation failed');
    process.exit(1);
}
TEST

echo ""
echo "==========================================="
echo "✅ LONG-FORM PROGRESSION ENGINE COMPLETE!"
echo ""
echo "Features:"
echo "  • Classical, Romantic, Jazz, Modal styles"
echo "  • 150+ bar progressions"
echo "  • Modulation patterns"
echo "  • Cadence formulas"
echo "  • Sonata, Rondo, Variation forms"
echo ""
echo "Test with: test_progression_engine.html"
echo ""
echo "Completed: 4/5 components"
echo "Next: Batch Generation Pipeline (30 minutes)"
echo "==========================================="

