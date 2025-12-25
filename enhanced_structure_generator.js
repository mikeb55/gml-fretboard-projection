// BULLETPROOF Enhanced Structure Generator with Complete Historical Forms
class EnhancedStructureGenerator {
    constructor() {
        this.forms = {
            // Classical Forms
            CLASSICAL_STANDARD: ['allegro_sonata', 'slow_movement', 'minuet_trio', 'finale_rondo'],
            CLASSICAL_VARIANT: ['allegro_sonata', 'minuet_trio', 'slow_movement', 'finale_presto'],
            HAYDN_OP20: ['moderato', 'minuet', 'adagio', 'fugue'],
            MOZART_PRUSSIAN: ['allegretto', 'andante_variations', 'allegro'],
            
            // Early Romantic
            BEETHOVEN_LATE: ['maestoso', 'vivace_scherzo', 'lento_variations', 'grave_allegro'],
            SCHUBERT_DEATH: ['allegro', 'andante_con_moto', 'scherzo_presto', 'presto_tarantella'],
            
            // Late Romantic
            BRAHMS: ['allegro_non_troppo', 'andante_moderato', 'quasi_minuetto', 'rondo_alla_zingarese'],
            DVORAK_AMERICAN: ['allegro_ma_non_troppo', 'lento', 'molto_vivace', 'finale_vivace'],
            
            // Early Modern
            DEBUSSY_IMPRESSIONIST: ['anime_et_tres_decide', 'assez_vif', 'andantino', 'tres_modere'],
            RAVEL: ['allegro_moderato', 'assez_vif_tres_rythme', 'tres_lent', 'vif_et_agite'],
            BARTOK_ARCH: ['allegro', 'prestissimo', 'non_troppo_lento', 'prestissimo_mirror', 'allegro_molto'],
            
            // 20th Century
            SHOSTAKOVICH: ['allegretto', 'moderato_con_moto', 'allegro_non_troppo', 'allegretto', 'largo'],
            GLASS_MINIMALIST: ['movement1', 'movement2', 'movement3', 'movement4', 'movement5'],
            
            // Contemporary/Experimental
            OPEN_MODULAR: ['module_a', 'module_b', 'module_c', 'module_d'],
            SPECTRAL: ['resonance1', 'interference', 'resonance2', 'transformation']
        };
        
        this.sectionTemplates = {
            allegro_sonata: { bars: 120, tempo: 'allegro', form: 'sonata' },
            slow_movement: { bars: 64, tempo: 'andante', form: 'ternary' },
            minuet_trio: { bars: 48, tempo: 'moderato', form: 'compound_ternary' },
            finale_rondo: { bars: 108, tempo: 'presto', form: 'rondo' },
            fugue: { bars: 96, tempo: 'moderato', form: 'fugue' },
            variations: { bars: 128, tempo: 'andante', form: 'theme_variations' },
            scherzo_presto: { bars: 96, tempo: 'presto', form: 'scherzo_trio' },
            module_a: { bars: 40, tempo: 'variable', form: 'open' },
            module_b: { bars: 40, tempo: 'variable', form: 'open' },
            module_c: { bars: 40, tempo: 'variable', form: 'open' },
            module_d: { bars: 40, tempo: 'variable', form: 'open' }
        };
        
        // Default template for any unknown movement
        this.defaultTemplate = { bars: 60, tempo: 'moderato', form: 'free' };
    }
    
    generateStructure(targetMinutes = 5, style = 'CLASSICAL_STANDARD') {
        const form = this.forms[style];
        if (!form) {
            console.log('Unknown style, using CLASSICAL_STANDARD');
            return this.generateStructure(targetMinutes, 'CLASSICAL_STANDARD');
        }
        
        const targetBars = targetMinutes * 30;
        const structure = [];
        
        form.forEach(movementName => {
            const template = this.sectionTemplates[movementName] || this.defaultTemplate;
            
            structure.push({
                name: movementName,
                bars: template.bars,
                tempo: template.tempo,
                form: template.form,
                key: this.selectKey(movementName),
                dynamics: 'mf',
                texture: 'homophonic',
                techniques: ['legato', 'staccato']
            });
        });
        
        // Scale to target length
        const totalBars = structure.reduce((sum, s) => sum + s.bars, 0);
        const scale = targetBars / totalBars;
        
        structure.forEach(s => {
            s.bars = Math.round(s.bars * scale);
            s.duration = Math.round((s.bars * 2)) + ' seconds';
        });
        
        return structure;
    }
    
    selectKey(movement) {
        if (movement.includes('slow')) return 'subdominant';
        if (movement.includes('minuet')) return 'tonic';
        if (movement.includes('finale')) return 'tonic';
        return 'tonic';
    }
    
    getAvailableStyles() {
        return Object.keys(this.forms);
    }
}

// Export
if (typeof module !== 'undefined') {
    module.exports = EnhancedStructureGenerator;
}
if (typeof window !== 'undefined') {
    window.EnhancedStructureGenerator = EnhancedStructureGenerator;
}
