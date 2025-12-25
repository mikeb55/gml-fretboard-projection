/**
 * rhythm-library.js
 * Shared Rhythm Pattern Library for GML Music Ecosystem
 * Version: 1.0.0
 * 
 * A comprehensive collection of rhythm patterns for use across
 * TriadGen, RiffGen, Quartet Engine, and QuintetComposer
 * 
 * Duration values (based on 1024 = whole note):
 * - 1024: whole note
 * - 512: half note
 * - 256: quarter note
 * - 128: eighth note
 * - 64: sixteenth note
 * - 384: dotted quarter
 * - 192: dotted eighth
 * - 768: dotted half
 */

const RhythmLibrary = {
    // Basic note values
    basic: {
        whole: [1024],
        halves: [512, 512],
        quarters: [256, 256, 256, 256],
        eighths: [128, 128, 128, 128, 128, 128, 128, 128],
        sixteenths: [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64],
        mixed_quarters_eighths: [256, 128, 128, 256, 256],
        syncopated_basic: [128, 256, 128, 256, 256],
        dotted_pattern: [384, 128, 256, 256]
    },

    // Time signature specific patterns
    timeBased: {
        three_four: {
            waltz: [384, 128, 128],
            minuet: [256, 128, 128],
            mazurka: [128, 256, 128],
            sarabande: [512, 256]
        },
        four_four: {
            march: [256, 256, 256, 256],
            rock_basic: [256, 256, 128, 128, 256],
            pop_groove: [256, 128, 128, 256, 128, 128],
            ballad: [512, 256, 128, 128]
        },
        six_eight: {
            compound: [192, 192, 192, 192],
            jig: [128, 128, 128, 128, 128, 128],
            tarantella: [128, 64, 64, 128, 128, 128]
        },
        five_four: {
            take_five: [256, 256, 256, 256, 256],
            progressive: [384, 128, 256, 256, 256]
        }
    },

    // Genre-specific patterns
    genres: {
        classical: {
            alberti_bass: [128, 128, 128, 128, 128, 128, 128, 128],
            baroque_continuo: [256, 256, 256, 256],
            romantic_rubato: [384, 128, 256, 128, 128],
            fugal_subject: [256, 256, 128, 128, 256]
        },
        jazz: {
            swing: [341, 171, 341, 171], // Triplet feel (2:1 ratio)
            bebop: [128, 128, 128, 64, 64, 128, 128, 128],
            charleston: [384, 128, 256, 256],
            bossa_nova: [384, 128, 128, 384],
            latin_clave: [384, 384, 256]
        },
        rock: {
            straight_eighths: [128, 128, 128, 128, 128, 128, 128, 128],
            power_chord: [256, 256, 512],
            punk: [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64],
            ballad: [512, 256, 128, 128],
            shuffle: [341, 171, 341, 171]
        },
        electronic: {
            four_on_floor: [256, 256, 256, 256],
            breakbeat: [256, 128, 128, 128, 256, 128],
            dubstep: [256, 512, 256],
            trance_gate: [64, 64, 64, 64, 128, 128, 128],
            house: [256, 128, 128, 256, 128, 128]
        },
        world: {
            samba: [128, 64, 64, 128, 128, 128, 128],
            reggae: [512, 128, 256, 128],
            afrobeat: [128, 128, 256, 128, 128, 256],
            celtic: [128, 128, 128, 256, 128],
            flamenco: [128, 128, 128, 64, 64, 128, 128]
        }
    },

    // Instrument-specific patterns
    instruments: {
        guitar: {
            strumming: {
                down_up: [256, 128, 128, 256, 128, 128],
                folk_pattern: [256, 128, 128, 128, 128, 256],
                power_strum: [256, 256, 512],
                fingerpicking: [128, 128, 128, 128, 128, 128, 128, 128],
                travis_picking: [256, 128, 128, 256, 128, 128]
            },
            riffs: {
                rock_riff: [256, 256, 128, 128, 256],
                blues_riff: [384, 128, 256, 256],
                metal_riff: [128, 128, 256, 128, 128, 256],
                funk_riff: [128, 128, 256, 128, 64, 64, 256]
            }
        },
        strings: {
            legato: [512, 512],
            staccato: [128, 128, 128, 128, 128, 128, 128, 128],
            pizzicato: [256, 256, 256, 256],
            tremolo: [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64],
            spiccato: [128, 128, 128, 128, 128, 128, 128, 128]
        },
        piano: {
            chordal: [256, 256, 256, 256],
            arpeggio: [128, 128, 128, 128, 128, 128, 128, 128],
            alberti: [128, 128, 128, 128, 128, 128, 128, 128],
            block_chords: [512, 512],
            ragtime: [128, 256, 128, 256, 256]
        },
        drums: {
            basic_beat: [256, 256, 256, 256],
            fill: [128, 128, 128, 128, 64, 64, 64, 64],
            snare_pattern: [512, 256, 256],
            hi_hat: [128, 128, 128, 128, 128, 128, 128, 128],
            kick_pattern: [256, 512, 256]
        }
    },

    // Texture-specific patterns (for Quartet/Quintet)
    textures: {
        homophonic: {
            melody: [256, 128, 128, 256, 256],
            harmony: [512, 512],
            bass: [256, 256, 256, 256]
        },
        polyphonic: {
            voice1: [256, 256, 128, 128, 256],
            voice2: [128, 128, 256, 256, 256],
            voice3: [256, 128, 128, 256, 128, 128],
            voice4: [512, 256, 256]
        },
        fugal: {
            subject: [256, 256, 128, 128, 256],
            answer: [128, 128, 256, 256, 256],
            countersubject: [128, 128, 128, 128, 512]
        },
        chorale: {
            soprano: [512, 256, 256],
            alto: [256, 256, 512],
            tenor: [256, 512, 256],
            bass: [1024]
        }
    },

    // Dynamic patterns (for expression)
    dynamics: {
        crescendo: {
            gradual: [128, 128, 192, 192, 256, 256],
            sudden: [128, 128, 128, 128, 512]
        },
        diminuendo: {
            gradual: [256, 256, 192, 192, 128, 128],
            sudden: [512, 128, 128, 128, 128]
        },
        accent_patterns: {
            strong_weak: [384, 128, 384, 128],
            syncopated: [128, 384, 128, 384],
            sforzando: [512, 128, 128, 256]
        }
    },

    // Utility functions
    utils: {
        /**
         * Combine two rhythm patterns
         * @param {Array} pattern1 - First rhythm pattern
         * @param {Array} pattern2 - Second rhythm pattern
         * @returns {Array} Combined pattern
         */
        combine: function(pattern1, pattern2) {
            return [...pattern1, ...pattern2];
        },

        /**
         * Repeat a pattern n times
         * @param {Array} pattern - Rhythm pattern to repeat
         * @param {number} times - Number of repetitions
         * @returns {Array} Repeated pattern
         */
        repeat: function(pattern, times) {
            let result = [];
            for (let i = 0; i < times; i++) {
                result = result.concat(pattern);
            }
            return result;
        },

        /**
         * Scale pattern durations by a factor
         * @param {Array} pattern - Rhythm pattern
         * @param {number} factor - Scaling factor (2 = double time, 0.5 = half time)
         * @returns {Array} Scaled pattern
         */
        scale: function(pattern, factor) {
            return pattern.map(duration => Math.round(duration * factor));
        },

        /**
         * Reverse a rhythm pattern
         * @param {Array} pattern - Rhythm pattern
         * @returns {Array} Reversed pattern
         */
        reverse: function(pattern) {
            return [...pattern].reverse();
        },

        /**
         * Create a random rhythm pattern
         * @param {number} beats - Number of beats to fill
         * @param {Array} allowedValues - Allowed note durations
         * @returns {Array} Random pattern
         */
        randomize: function(beats = 4, allowedValues = [256, 128, 128, 64]) {
            const targetDuration = beats * 256; // Assuming quarter note = 1 beat
            let pattern = [];
            let currentDuration = 0;
            
            while (currentDuration < targetDuration) {
                const remaining = targetDuration - currentDuration;
                const validValues = allowedValues.filter(v => v <= remaining);
                if (validValues.length === 0) break;
                
                const value = validValues[Math.floor(Math.random() * validValues.length)];
                pattern.push(value);
                currentDuration += value;
            }
            
            return pattern;
        },

        /**
         * Fit pattern to specific measure length
         * @param {Array} pattern - Rhythm pattern
         * @param {number} measureLength - Target measure length (1024 = 4/4 bar)
         * @returns {Array} Fitted pattern
         */
        fitToMeasure: function(pattern, measureLength = 1024) {
            let fitted = [];
            let currentLength = 0;
            let patternIndex = 0;
            
            while (currentLength < measureLength) {
                const duration = pattern[patternIndex % pattern.length];
                const remaining = measureLength - currentLength;
                
                if (duration <= remaining) {
                    fitted.push(duration);
                    currentLength += duration;
                } else {
                    fitted.push(remaining);
                    currentLength = measureLength;
                }
                
                patternIndex++;
            }
            
            return fitted;
        },

        /**
         * Get pattern for specific guitar role (QuintetComposer)
         * @param {string} role - 'accompaniment', 'riff', or 'melody'
         * @param {string} style - Style within the role
         * @returns {Array} Rhythm pattern
         */
        getGuitarPattern: function(role, style = 'default') {
            const patterns = {
                accompaniment: {
                    default: [256, 128, 128, 256, 256],
                    strumming: RhythmLibrary.instruments.guitar.strumming.down_up,
                    fingerpicking: RhythmLibrary.instruments.guitar.strumming.fingerpicking,
                    arpeggios: [128, 128, 128, 128, 128, 128, 128, 128]
                },
                riff: {
                    default: [256, 256, 128, 128, 256],
                    rock: RhythmLibrary.instruments.guitar.riffs.rock_riff,
                    blues: RhythmLibrary.instruments.guitar.riffs.blues_riff,
                    funk: RhythmLibrary.instruments.guitar.riffs.funk_riff
                },
                melody: {
                    default: [256, 128, 128, 256, 128, 128],
                    lyrical: [512, 256, 128, 128],
                    virtuosic: [128, 64, 64, 128, 128, 64, 64, 128],
                    sustained: [512, 512]
                }
            };
            
            return patterns[role]?.[style] || patterns[role]?.default || [256, 256, 256, 256];
        }
    }
};

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RhythmLibrary;
} else if (typeof window !== 'undefined') {
    window.RhythmLibrary = RhythmLibrary;
}