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
