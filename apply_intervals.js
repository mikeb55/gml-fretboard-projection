// Quick interval application for generators
window.applyProfileIntervals = function() {
    const profile = JSON.parse(localStorage.getItem('currentComposerProfile') || '{}');
    if (!profile.intervals) return [0, 2, 4, 5, 7]; // Default if no profile
    
    // Use first 5-10 intervals from profile
    return profile.intervals.slice(0, Math.min(10, profile.intervals.length));
};

// Override TriadGen generation
if (window.location.pathname.includes('triadgen')) {
    const oldGenerate = window.generate || window.generateTriads;
    window.generateTriads = window.generate = function() {
        const intervals = window.applyProfileIntervals();
        console.log('Using profile intervals:', intervals);
        
        // Apply intervals to generation
        const root = parseInt(document.getElementById('root1').value) || 60;
        window.triad1 = [root, root + intervals[0], root + intervals[1]];
        
        // Continue with original generation
        if (oldGenerate) return oldGenerate.apply(this, arguments);
    };
}
