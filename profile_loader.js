// Universal Profile Loader for all GML apps
class ProfileLoader {
    constructor() {
        this.currentProfile = null;
        this.loadFromStorage();
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('currentComposerProfile');
            if (stored) {
                this.currentProfile = JSON.parse(stored);
                console.log('Profile loaded:', this.currentProfile.name);
                return true;
            }
        } catch(e) {
            console.error('Profile load error:', e);
        }
        return false;
    }
    
    applyToGenerator(generatorFunction) {
        if (!this.currentProfile) {
            console.log('No profile loaded');
            return generatorFunction;
        }
        
        // Wrap the original generator
        return function(...args) {
            console.log('Applying profile:', this.currentProfile.name);
            
            // Apply tempo if available
            if (this.currentProfile.tempo && window.Tone) {
                Tone.Transport.bpm.value = this.currentProfile.tempo;
            }
            
            // Apply to any tempo input
            const tempoInput = document.getElementById('tempo');
            if (tempoInput && this.currentProfile.tempo) {
                tempoInput.value = this.currentProfile.tempo;
            }
            
            // Apply intervals to generation
            if (window.currentTriads && this.currentProfile.intervals) {
                // Use profile intervals for next note selection
                const intervals = this.currentProfile.intervals.slice(0, 5);
                console.log('Using intervals:', intervals);
            }
            
            // Call original generator
            return generatorFunction.apply(this, args);
        }.bind(this);
    }
    
    displayStatus() {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(0,255,0,0.2);padding:10px;border-radius:5px;z-index:9999';
        div.innerHTML = this.currentProfile ? 
            `Profile: ${this.currentProfile.name}<br>Tempo: ${this.currentProfile.tempo}` : 
            'No profile loaded';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
}

// Auto-initialize
window.profileLoader = new ProfileLoader();

// Auto-apply to common generator functions
window.addEventListener('DOMContentLoaded', () => {
    // Wrap generate functions if they exist
    if (window.generate) {
        window.generate = window.profileLoader.applyToGenerator(window.generate);
    }
    if (window.generateTriads) {
        window.generateTriads = window.profileLoader.applyToGenerator(window.generateTriads);
    }
    
    // Show status
    window.profileLoader.displayStatus();
});
