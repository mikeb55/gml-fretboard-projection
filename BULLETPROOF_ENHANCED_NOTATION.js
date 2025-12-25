// BULLETPROOF Enhanced Notation - Dynamics, Tempo, Rehearsal Marks, Measure Numbers

class EnhancedNotation {
    constructor() {
        this.dynamics = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];
        this.tempoMarkings = {
            grave: 40, largo: 50, adagio: 66, andante: 76,
            moderato: 108, allegro: 120, vivace: 140, presto: 168,
            prestissimo: 200
        };
        this.rehearsalLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    
    addToMusicXML(xml, measureNum, sectionNum) {
        let enhanced = '';
        
        // Add measure number (every measure)
        enhanced += `    <measure number="${measureNum}">\n`;
        
        // Add rehearsal mark at section starts
        if (this.isNewSection(measureNum)) {
            enhanced += `      <direction placement="above">\n`;
            enhanced += `        <direction-type>\n`;
            enhanced += `          <rehearsal>${this.rehearsalLetters[sectionNum]}</rehearsal>\n`;
            enhanced += `        </direction-type>\n`;
            enhanced += `      </direction>\n`;
        }
        
        // Add tempo change at key points
        const tempoChange = this.getTempoForMeasure(measureNum);
        if (tempoChange) {
            enhanced += `      <direction placement="above">\n`;
            enhanced += `        <direction-type>\n`;
            enhanced += `          <metronome>\n`;
            enhanced += `            <beat-unit>quarter</beat-unit>\n`;
            enhanced += `            <per-minute>${tempoChange.bpm}</per-minute>\n`;
            enhanced += `          </metronome>\n`;
            enhanced += `          <words>${tempoChange.text}</words>\n`;
            enhanced += `        </direction-type>\n`;
            enhanced += `        <sound tempo="${tempoChange.bpm}"/>\n`;
            enhanced += `      </direction>\n`;
        }
        
        // Add dynamics at phrases
        const dynamic = this.getDynamicForMeasure(measureNum);
        if (dynamic) {
            enhanced += `      <direction placement="below">\n`;
            enhanced += `        <direction-type>\n`;
            enhanced += `          <dynamics>\n`;
            enhanced += `            <${dynamic}/>\n`;
            enhanced += `          </dynamics>\n`;
            enhanced += `        </direction-type>\n`;
            enhanced += `      </direction>\n`;
        }
        
        // Add crescendo/diminuendo
        if (this.needsHairpin(measureNum)) {
            enhanced += `      <direction placement="below">\n`;
            enhanced += `        <direction-type>\n`;
            enhanced += `          <wedge type="${measureNum % 16 < 8 ? 'crescendo' : 'diminuendo'}"/>\n`;
            enhanced += `        </direction-type>\n`;
            enhanced += `      </direction>\n`;
        }
        
        return enhanced;
    }
    
    isNewSection(measure) {
        // New sections every 32 measures
        return measure === 1 || measure % 32 === 1;
    }
    
    getTempoForMeasure(measure) {
        const tempoMap = {
            1: { text: 'Allegro moderato', bpm: 120 },
            33: { text: 'Andante', bpm: 76 },
            65: { text: 'Vivace', bpm: 140 },
            97: { text: 'Allegro', bpm: 120 },
            129: { text: 'Presto', bpm: 168 }
        };
        return tempoMap[measure] || null;
    }
    
    getDynamicForMeasure(measure) {
        // Dynamic changes every 8 measures with musical logic
        if (measure === 1) return 'mf';
        if (measure % 32 === 1) return 'f';
        if (measure % 16 === 9) return 'p';
        if (measure % 8 === 1) return 'mp';
        return null;
    }
    
    needsHairpin(measure) {
        // Add hairpins for expression
        return measure % 4 === 2;
    }
    
    addArticulations(noteXML, notePosition) {
        let articulated = noteXML;
        
        // Add staccato, accent, tenuto based on musical context
        if (notePosition % 4 === 0) {
            articulated = articulated.replace('</note>', 
                '        <notations>\n' +
                '          <articulations>\n' +
                '            <accent/>\n' +
                '          </articulations>\n' +
                '        </notations>\n' +
                '      </note>');
        } else if (notePosition % 2 === 1) {
            articulated = articulated.replace('</note>',
                '        <notations>\n' +
                '          <articulations>\n' +
                '            <staccato/>\n' +
                '          </articulations>\n' +
                '        </notations>\n' +
                '      </note>');
        }
        
        return articulated;
    }
    
    enhanceFullScore(basicXML) {
        const lines = basicXML.split('\n');
        const enhanced = [];
        let measureNum = 0;
        let sectionNum = 0;
        
        lines.forEach(line => {
            if (line.includes('<measure')) {
                measureNum++;
                if (this.isNewSection(measureNum)) sectionNum++;
                
                // Add all enhancements for this measure
                const enhancements = this.addToMusicXML('', measureNum, sectionNum);
                enhanced.push(enhancements);
            } else {
                enhanced.push(line);
            }
        });
        
        return enhanced.join('\n');
    }
}

// Export for use
if (typeof module !== 'undefined') module.exports = EnhancedNotation;
if (typeof window !== 'undefined') window.EnhancedNotation = EnhancedNotation;
