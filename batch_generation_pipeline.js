// BULLETPROOF Batch Generation Pipeline for Rapid Composition
class BatchGenerationPipeline {
    constructor() {
        this.generators = {
            structure: null,
            progression: null,
            voiceLeading: null,
            profiles: null
        };
        
        this.batchSize = 10; // Generate 10 variations per section
        this.autoSelect = true; // Auto-select best options
        this.targetDuration = 5; // minutes
    }
    
    async initialize() {
        // Load all required generators
        try {
            if (typeof EnhancedStructureGenerator !== 'undefined') {
                this.generators.structure = new EnhancedStructureGenerator();
            }
            if (typeof ProgressionEngine !== 'undefined') {
                this.generators.progression = new ProgressionEngine();
            }
            if (typeof ExtendedVoiceLeading !== 'undefined') {
                this.generators.voiceLeading = new ExtendedVoiceLeading();
            }
            
            // Load profile if available
            const savedProfile = localStorage.getItem('currentComposerProfile');
            if (savedProfile) {
                this.generators.profiles = JSON.parse(savedProfile);
            }
            
            return true;
        } catch (e) {
            console.error('Initialization error:', e);
            return false;
        }
    }
    
    generateBatch(style = 'CLASSICAL_STANDARD', duration = 5) {
        const batch = {
            timestamp: Date.now(),
            style: style,
            duration: duration,
            variations: [],
            selected: null
        };
        
        // Generate multiple variations
        for (let i = 0; i < this.batchSize; i++) {
            const variation = this.generateSingleVariation(style, duration, i);
            batch.variations.push(variation);
        }
        
        // Auto-select best if enabled
        if (this.autoSelect) {
            batch.selected = this.selectBest(batch.variations);
        }
        
        return batch;
    }
    
    generateSingleVariation(style, duration, seed) {
        const variation = {
            id: seed,
            structure: null,
            progression: null,
            voiceParts: null,
            score: 0
        };
        
        // Generate structure
        if (this.generators.structure) {
            variation.structure = this.generators.structure.generateStructure(duration, style);
        }
        
        // Generate progression
        if (this.generators.progression) {
            const totalBars = variation.structure ? 
                variation.structure.reduce((sum, s) => sum + s.bars, 0) : 
                duration * 30;
            
            variation.progression = this.generators.progression.generateLongformProgression(
                totalBars,
                this.mapStyleToProgressionStyle(style)
            );
        }
        
        // Apply voice leading
        if (this.generators.voiceLeading && variation.progression) {
            const chords = variation.progression.map(p => p.notes);
            variation.voiceParts = this.generators.voiceLeading.generateProgression(chords);
        }
        
        // Apply profile modifications if available
        if (this.generators.profiles) {
            variation = this.applyProfile(variation);
        }
        
        // Score the variation
        variation.score = this.scoreVariation(variation);
        
        return variation;
    }
    
    mapStyleToProgressionStyle(structureStyle) {
        if (structureStyle.includes('CLASSICAL')) return 'classical';
        if (structureStyle.includes('ROMANTIC') || structureStyle.includes('BRAHMS')) return 'romantic';
        if (structureStyle.includes('MODERN') || structureStyle.includes('BARTOK')) return 'modal';
        if (structureStyle.includes('GLASS') || structureStyle.includes('MINIMAL')) return 'modal';
        return 'classical';
    }
    
    applyProfile(variation) {
        if (!this.generators.profiles) return variation;
        
        const profile = this.generators.profiles;
        
        // Apply tempo from profile
        if (profile.tempo && variation.structure) {
            variation.structure.forEach(section => {
                section.originalTempo = section.tempo;
                section.adjustedTempo = profile.tempo;
            });
        }
        
        // Apply intervals from profile
        if (profile.intervals && variation.progression) {
            // Transpose progressions based on profile intervals
            const intervalPattern = profile.intervals.slice(0, 4);
            // Implementation would modify progression based on intervals
        }
        
        return variation;
    }
    
    scoreVariation(variation) {
        let score = 0;
        
        // Score based on structure coherence
        if (variation.structure) {
            score += variation.structure.length * 10;
            
            // Bonus for balanced sections
            const bars = variation.structure.map(s => s.bars);
            const avgBars = bars.reduce((a, b) => a + b, 0) / bars.length;
            const variance = bars.reduce((sum, b) => sum + Math.abs(b - avgBars), 0) / bars.length;
            score += Math.max(0, 50 - variance);
        }
        
        // Score based on harmonic progression
        if (variation.progression) {
            // Bonus for cadences
            const cadenceCount = variation.progression.filter(p => 
                p.symbol === 'V' || p.symbol === 'I'
            ).length;
            score += cadenceCount * 5;
            
            // Bonus for variety
            const uniqueChords = new Set(variation.progression.map(p => p.symbol)).size;
            score += uniqueChords * 3;
        }
        
        // Score based on voice leading
        if (variation.voiceParts) {
            // Bonus for smooth voice leading (would need to analyze intervals)
            score += variation.voiceParts.length * 2;
        }
        
        return score;
    }
    
    selectBest(variations) {
        if (!variations || variations.length === 0) return null;
        
        // Sort by score
        const sorted = variations.sort((a, b) => b.score - a.score);
        
        // Return top variation
        return sorted[0];
    }
    
    assembleComposition(batch) {
        const selected = batch.selected || batch.variations[0];
        if (!selected) return null;
        
        const composition = {
            title: 'Generated Quintet in ' + batch.style,
            duration: batch.duration + ' minutes',
            style: batch.style,
            movements: selected.structure || [],
            harmonic_progression: selected.progression || [],
            voice_parts: selected.voiceParts || {},
            metadata: {
                generated: new Date().toISOString(),
                score: selected.score,
                batch_size: batch.variations.length
            }
        };
        
        return composition;
    }
    
    exportToMusicXML(composition) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" ';
        xml += '"http://www.musicxml.org/dtds/partwise.dtd">\n';
        xml += '<score-partwise version="3.1">\n';
        xml += '  <work><work-title>' + composition.title + '</work-title></work>\n';
        xml += '  <part-list>\n';
        
        // Add five parts for quintet
        ['Violin I', 'Violin II', 'Viola', 'Cello', 'Bass'].forEach((inst, i) => {
            xml += '    <score-part id="P' + (i+1) + '">\n';
            xml += '      <part-name>' + inst + '</part-name>\n';
            xml += '    </score-part>\n';
        });
        
        xml += '  </part-list>\n';
        
        // Add parts with notes
        ['violin1', 'violin2', 'viola', 'cello', 'bass'].forEach((voice, partNum) => {
            xml += '  <part id="P' + (partNum+1) + '">\n';
            
            if (composition.voice_parts && composition.voice_parts.length > 0) {
                composition.voice_parts.slice(0, 4).forEach((chord, measure) => {
                    xml += '    <measure number="' + (measure+1) + '">\n';
                    
                    if (measure === 0) {
                        xml += '      <attributes>\n';
                        xml += '        <divisions>1</divisions>\n';
                        xml += '        <key><fifths>0</fifths></key>\n';
                        xml += '        <time><beats>4</beats><beat-type>4</beat-type></time>\n';
                        xml += '        <clef><sign>G</sign><line>2</line></clef>\n';
                        xml += '      </attributes>\n';
                    }
                    
                    const note = chord[voice] || 60;
                    xml += '      <note>\n';
                    xml += '        <pitch>\n';
                    xml += '          <step>' + this.midiToStep(note) + '</step>\n';
                    xml += '          <octave>' + Math.floor(note/12 - 1) + '</octave>\n';
                    xml += '        </pitch>\n';
                    xml += '        <duration>4</duration>\n';
                    xml += '        <type>whole</type>\n';
                    xml += '      </note>\n';
                    
                    xml += '    </measure>\n';
                });
            }
            
            xml += '  </part>\n';
        });
        
        xml += '</score-partwise>';
        return xml;
    }
    
    midiToStep(midi) {
        const steps = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
        return steps[midi % 12];
    }
    
    async generateComplete(style, duration) {
        await this.initialize();
        
        console.log('Generating batch...');
        const batch = this.generateBatch(style, duration);
        
        console.log('Assembling composition...');
        const composition = this.assembleComposition(batch);
        
        console.log('Complete! Score:', composition.metadata.score);
        return composition;
    }
}

// Export
if (typeof module !== 'undefined') {
    module.exports = BatchGenerationPipeline;
}
if (typeof window !== 'undefined') {
    window.BatchGenerationPipeline = BatchGenerationPipeline;
}
