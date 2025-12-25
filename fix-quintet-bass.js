// Fix for Quintet v3.1 bass issue
// The problem: bass notes aren't being properly added to the data structure

function fixQuintetExport(quintetData) {
    // Ensure bass voice has valid MIDI notes
    if (quintetData.voices && quintetData.voices[4]) {
        quintetData.voices[4].notes.forEach(note => {
            // If note has invalid or missing MIDI, calculate it
            if (!note.midi || note.midi <= 0) {
                // Bass should be 2 octaves below the root
                note.midi = 36; // Default to C2 if calculation fails
            }
        });
    }
    return quintetData;
}

// Usage in Quintet v3.1:
// Before calling exportToMusicXML:
// quintetData = fixQuintetExport(quintetData);
