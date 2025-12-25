// FINAL 3% - Chord Progressions, Velocity, and Phrases

// 1. Chord Progression Analysis
window.analyzeChordProgressions = function(profile) {
    if (!profile.chords || profile.chords.length === 0) return [];
    
    const progressions = [];
    profile.chords.forEach(chord => {
        // Simple Roman numeral detection based on root
        const root = Math.min(...chord) % 12;
        const type = chord.length === 3 ? 'triad' : 'seventh';
        const quality = (chord[1] - chord[0]) === 4 ? 'major' : 'minor';
        
        progressions.push({
            root: root,
            type: type,
            quality: quality,
            notes: chord
        });
    });
    
    return progressions;
};

// 2. Velocity Dynamics Extraction
window.extractVelocityPattern = function(profile) {
    if (!profile.notes) return [80, 80, 80, 80]; // Default mezzo-forte
    
    const velocities = profile.notes.map(n => n.velocity || 80);
    
    // Create dynamic curve
    const curve = {
        min: Math.min(...velocities),
        max: Math.max(...velocities),
        average: Math.round(velocities.reduce((a,b) => a+b, 0) / velocities.length),
        pattern: velocities.slice(0, 16) // First 16 for pattern
    };
    
    return curve;
};

// 3. Phrase Boundary Detection
window.detectPhrases = function(profile) {
    if (!profile.notes) return [4, 4, 4, 4]; // Default 4-bar phrases
    
    const phrases = [];
    let currentPhrase = [];
    
    // Detect phrases by gaps in timing
    for (let i = 1; i < profile.notes.length; i++) {
        const gap = profile.notes[i].time - profile.notes[i-1].time;
        currentPhrase.push(profile.notes[i-1]);
        
        // Large gap = phrase boundary
        if (gap > 960) { // More than 2 beats at 480 ticks
            phrases.push(currentPhrase.length);
            currentPhrase = [];
        }
    }
    
    if (currentPhrase.length > 0) {
        phrases.push(currentPhrase.length);
    }
    
    return phrases.length > 0 ? phrases : [4, 4, 4, 4];
};

// Master Profile Application
window.applyCompleteProfile = function(profile) {
    const result = {
        intervals: profile.intervals || [0, 2, 4],
        rhythms: window.extractRhythmPatterns ? window.extractRhythmPatterns(profile) : [1,1,1,1],
        chords: window.analyzeChordProgressions(profile),
        velocity: window.extractVelocityPattern(profile),
        phrases: window.detectPhrases(profile),
        tempo: profile.tempo || 120
    };
    
    console.log('Complete Profile Applied:', result);
    return result;
};

// Auto-apply on load
if (window.profileLoader && window.profileLoader.currentProfile) {
    window.completeProfile = window.applyCompleteProfile(window.profileLoader.currentProfile);
}
