// Extract and apply rhythm patterns from MIDI
window.extractRhythmPatterns = function(profile) {
    if (!profile || !profile.notes) return [1, 1, 1, 1]; // Default quarter notes
    
    // Calculate time deltas between notes
    const rhythms = [];
    for (let i = 1; i < profile.notes.length; i++) {
        const delta = profile.notes[i].time - profile.notes[i-1].time;
        rhythms.push(delta);
    }
    return rhythms;
};

// Apply to generation
window.applyRhythm = function(notes, profile) {
    const rhythms = extractRhythmPatterns(profile);
    return notes.map((note, i) => ({
        pitch: note,
        duration: rhythms[i % rhythms.length]
    }));
};
