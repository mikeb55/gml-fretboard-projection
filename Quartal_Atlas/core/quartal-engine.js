/**
 * Quartal Engine - Core quartal harmony calculation logic
 * Handles pitch calculation, quartal voicings, and inversions
 * 
 * Quartal harmonies are built in perfect fourths (or sometimes augmented fourths)
 * Example: C-F-Bb-Eb (perfect fourths: C→F, F→Bb, Bb→Eb)
 */

const QuartalEngine = {
    // Standard guitar tuning (EADGBE) - MIDI note numbers
    // String 6 (low E) = 40, String 5 = 45, String 4 = 50, String 3 = 55, String 2 = 59, String 1 (high E) = 64
    tuning: [40, 45, 50, 55, 59, 64],
    
    // Note names for display
    noteNames: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    
    /**
     * Get MIDI note number for a given string and fret
     * @param {number} stringIndex - 0-5 (5=low E, 0=high E)
     * @param {number} fret - 0-24
     * @returns {number} MIDI note number
     */
    getMidiNote(stringIndex, fret) {
        return this.tuning[stringIndex] + fret;
    },
    
    /**
     * Get note name from MIDI note number
     * @param {number} midiNote - MIDI note number
     * @returns {string} Note name (e.g., "C", "C#", "D")
     */
    getNoteName(midiNote) {
        return this.noteNames[midiNote % 12];
    },
    
    /**
     * Get pitch class (0-11) from MIDI note number
     * @param {number} midiNote - MIDI note number
     * @returns {number} Pitch class (0=C, 1=C#, etc.)
     */
    getPitchClass(midiNote) {
        return midiNote % 12;
    },
    
    /**
     * Get scale degrees for a given scale/mode
     * @param {string} scaleName - "major", "minor", "dorian", "mixolydian", etc.
     * @param {number} rootPitchClass - Root pitch class (0-11)
     * @returns {Array<number>} Array of pitch classes representing the scale
     */
    getScaleDegrees(scaleName, rootPitchClass) {
        const scalePatterns = {
            'major': [0, 2, 4, 5, 7, 9, 11],           // C D E F G A B
            'minor': [0, 2, 3, 5, 7, 8, 10],          // C D Eb F G Ab Bb
            'dorian': [0, 2, 3, 5, 7, 9, 10],         // C D Eb F G A Bb
            'mixolydian': [0, 2, 4, 5, 7, 9, 10],      // C D E F G A Bb
            'lydian': [0, 2, 4, 6, 7, 9, 11],          // C D E F# G A B
            'phrygian': [0, 1, 3, 5, 7, 8, 10],        // C Db Eb F G Ab Bb
            'locrian': [0, 1, 3, 5, 6, 8, 10]          // C Db Eb F Gb Ab Bb
        };
        
        const pattern = scalePatterns[scaleName.toLowerCase()] || scalePatterns['major'];
        return pattern.map(offset => (rootPitchClass + offset) % 12);
    },
    
    /**
     * Calculate quartal voicing tones
     * @param {number} rootPitchClass - Root pitch class (0-11)
     * @param {string} type - "perfect" (all perfect 4ths), "mixed" (perfect + augmented 4th), or "diatonic" (scale-degree based)
     * @param {string} scaleName - Scale/mode name (required for "diatonic" type): "major", "minor", "dorian", etc.
     * @returns {Array<number>} Array of pitch classes [root, fourth, seventh, tenth]
     */
    getQuartalTones(rootPitchClass, type = 'perfect', scaleName = 'major') {
        const root = rootPitchClass;
        
        if (type === 'diatonic') {
            // Diatonic quartal stacking: n, n+3, n+6, n+9 (scale degrees)
            // Example: In C major, if root is scale degree 1 (C), stack: 1, 4, 7, 10
            // Scale degrees: 1=C, 2=D, 3=E, 4=F, 5=G, 6=A, 7=B, 8=C, 9=D, 10=E
            // So: C (1), F (4), B (7), E (10) = C-F-B-E
            // Note: n+9 means 9 scale steps = 2 steps in next octave (10 mod 7 = 3, but we want degree 3 in next octave)
            
            const scaleDegrees = this.getScaleDegrees(scaleName, rootPitchClass);
            
            // Find root's position in scale (0-6)
            const rootScaleIndex = scaleDegrees.indexOf(root);
            if (rootScaleIndex === -1) {
                // Root not in scale, fall back to perfect
                return this.getQuartalTones(rootPitchClass, 'perfect');
            }
            
            // Stack scale degrees: n, n+3, n+6, n+9
            // Scale degree 1 = index 0, degree 2 = index 1, etc.
            // n+3 = 3 scale steps up, n+6 = 6 steps up, n+9 = 9 steps = 2 steps in next octave
            const degree1Index = rootScaleIndex;                    // n (scale degree 1-7, index 0-6)
            const degree4Index = (rootScaleIndex + 3) % 7;         // n+3 (3 scale steps up)
            const degree7Index = (rootScaleIndex + 6) % 7;         // n+6 (6 scale steps up, wraps to n-1)
            const degree10Index = (rootScaleIndex + 2) % 7;        // n+9 = n+2 mod 7 (9 steps = 2 steps in next octave = degree 3)
            
            // Get pitch classes for these scale degrees
            const fourth = scaleDegrees[degree4Index];
            const seventh = scaleDegrees[degree7Index];
            const tenth = scaleDegrees[degree10Index];
            
            return [root, fourth, seventh, tenth];
        } else if (type === 'perfect') {
            // Perfect fourths: C-F-Bb-Eb
            const fourth = (root + 5) % 12;      // Perfect 4th = 5 semitones
            const seventh = (root + 10) % 12;     // Perfect 4th from fourth = 10 semitones from root
            const tenth = (root + 3) % 12;        // Perfect 4th from seventh = 3 semitones from root (octave + 3)
            return [root, fourth, seventh, tenth];
        } else {
            // Mixed: perfect-perfect-augmented (e.g., C-F-Bb-E)
            const fourth = (root + 5) % 12;       // Perfect 4th
            const seventh = (root + 10) % 12;     // Perfect 4th from fourth
            const tenth = (root + 4) % 12;        // Augmented 4th from seventh = 4 semitones from root
            return [root, fourth, seventh, tenth];
        }
    },
    
    /**
     * Apply inversion to quartal voicing tones
     * @param {Array<number>} quartalTones - [root, fourth, seventh, tenth] as pitch classes
     * @param {number} inversion - 0 (root), 1 (1st), 2 (2nd), 3 (3rd)
     * @returns {Array<number>} Inverted quartal tones (pitch classes, may include +12 for octave)
     */
    applyInversion(quartalTones, inversion) {
        if (inversion === 0) {
            // Root position: R, 4, 7, 10
            return [...quartalTones];
        } else if (inversion === 1) {
            // 1st inversion: 4, 7, 10, R+12
            return [quartalTones[1], quartalTones[2], quartalTones[3], quartalTones[0] + 12];
        } else if (inversion === 2) {
            // 2nd inversion: 7, 10, R+12, 4+12
            return [quartalTones[2], quartalTones[3], quartalTones[0] + 12, quartalTones[1] + 12];
        } else { // inversion === 3
            // 3rd inversion: 10, R+12, 4+12, 7+12
            return [quartalTones[3], quartalTones[0] + 12, quartalTones[1] + 12, quartalTones[2] + 12];
        }
    },
    
    /**
     * Get string set indices from string set string (e.g., "6-3" -> [5, 4, 3, 2])
     * Quartal voicings need 4 strings, so we have: 6-3, 5-2, 4-1
     * Position variants: -low (default), -mid, -high
     * @param {string} stringSet - "6-3", "6-3-mid", "6-3-high", "5-2", "5-2-mid", "5-2-high", "4-1", "4-1-mid", "4-1-high"
     * @returns {Array<number>} Array of string indices (0-based, where 5=string 6, 0=string 1)
     */
    getStringSetIndices(stringSet) {
        // Extract base string set (remove position suffix)
        const baseSet = stringSet.replace(/-low$|-mid$|-high$/, '');
        const map = {
            '6-3': [5, 4, 3, 2],  // Strings 6, 5, 4, 3 (indices 5, 4, 3, 2)
            '5-2': [4, 3, 2, 1],  // Strings 5, 4, 3, 2 (indices 4, 3, 2, 1)
            '4-1': [3, 2, 1, 0]   // Strings 4, 3, 2, 1 (indices 3, 2, 1, 0)
        };
        return map[baseSet] || [];
    },
    
    /**
     * Get preferred anchor fret range for a string set position
     * @param {string} stringSet - String set with position (e.g., "6-3-mid")
     * @returns {number} Preferred anchor fret for this position
     */
    getAnchorFretForPosition(stringSet) {
        if (stringSet.includes('-high')) {
            return 15; // High position: frets 12-19
        } else if (stringSet.includes('-mid')) {
            return 8;  // Mid position: frets 5-12
        } else {
            return 2;  // Low position: frets 0-7
        }
    },
    
    /**
     * Determine which tone of the quartal voicing a note represents (R, 4, 7, or 10)
     * @param {number} midiNote - MIDI note number
     * @param {number} rootPitchClass - Root pitch class
     * @param {string} type - "perfect", "mixed", or "diatonic"
     * @param {string} scaleName - Scale/mode name (required for "diatonic" type)
     * @returns {string|null} "root", "fourth", "seventh", "tenth", or null if not part of voicing
     */
    getToneRole(midiNote, rootPitchClass, type, scaleName = 'major') {
        const pitchClass = this.getPitchClass(midiNote);
        const quartalTones = this.getQuartalTones(rootPitchClass, type, scaleName);
        
        if (pitchClass === quartalTones[0]) return 'root';
        if (pitchClass === quartalTones[1]) return 'fourth';
        if (pitchClass === quartalTones[2]) return 'seventh';
        if (pitchClass === quartalTones[3]) return 'tenth';
        
        return null;
    },
    
    /**
     * Get the next inversion in the sequence
     * @param {number} currentInversion - Current inversion (0, 1, 2, or 3)
     * @param {string} direction - "ascending" or "descending"
     * @returns {number} Next inversion (0, 1, 2, or 3)
     */
    getNextInversion(currentInversion, direction) {
        if (direction === 'ascending') {
            return (currentInversion + 1) % 4; // 0 -> 1 -> 2 -> 3 -> 0
        } else {
            return (currentInversion - 1 + 4) % 4; // 0 -> 3 -> 2 -> 1 -> 0
        }
    },
    
    /**
     * Get the previous inversion in the sequence
     * @param {number} currentInversion - Current inversion (0, 1, 2, or 3)
     * @param {string} direction - "ascending" or "descending"
     * @returns {number} Previous inversion (0, 1, 2, or 3)
     */
    getPreviousInversion(currentInversion, direction) {
        if (direction === 'ascending') {
            return (currentInversion - 1 + 4) % 4; // 0 -> 3 -> 2 -> 1 -> 0
        } else {
            return (currentInversion + 1) % 4; // 0 -> 1 -> 2 -> 3 -> 0
        }
    },
    
    /**
     * Identify which note is the top voice (highest pitch) in the current inversion
     * @param {Array<number>} invertedTones - Inverted quartal tones (may include +12)
     * @param {number} inversion - Current inversion (0, 1, 2, or 3)
     * @returns {number} Index of top note in invertedTones array (0, 1, 2, or 3)
     */
    getTopNoteIndex(invertedTones, inversion) {
        // The top note is always the last element in the inverted array
        // Root: [R, 4, 7, 10] -> top is index 3
        // 1st:  [4, 7, 10, R+12] -> top is index 3
        // 2nd:  [7, 10, R+12, 4+12] -> top is index 3
        // 3rd:  [10, R+12, 4+12, 7+12] -> top is index 3
        return 3;
    }
};

