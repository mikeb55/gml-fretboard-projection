/**
 * Fretboard UI v0.1
 * Labyrinth-style Visualiser
 * 
 * This UI:
 * - DOES NOT decide harmony
 * - DOES NOT project voicings
 * - ONLY shows what the projection layer already decided
 */

import { spellChord } from './chord-spelling.js';

export class FretboardUI {
  constructor(containerElement, options = {}) {
    this.version = '0.1';
    this.container = containerElement;
    this.options = {
      showBarNumber: options.showBarNumber || false,
      showMovementType: options.showMovementType || false,
      showReasonCodes: options.showReasonCodes || false,
      ...options
    };
    
    // State
    this.currentBar = 0;
    this.bars = []; // Array of projection outputs
    this.svg = null;
    this.currentMapping = null;
    
    // Visual constants
    this.STRING_SPACING = 30;
    this.FRET_WIDTH = 40;
    this.NUT_WIDTH = 8;
    this.STRING_LABEL_WIDTH = 40;
    this.FRET_LABEL_HEIGHT = 30;
    this.NOTE_RADIUS = 12;
    this.WINDOW_ALPHA = 0.3; // Fade for frets outside window
    
    // Guitar tuning (EADGBE) - MIDI note numbers for open strings
    this.GUITAR_TUNING = [40, 45, 50, 55, 59, 64];
    
    this.init();
  }

  /**
   * Initialize the UI
   */
  init() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'fretboard-svg');
    this.svg.style.width = '100%';
    this.svg.style.height = 'auto';
    this.container.appendChild(this.svg);
    
    // Create controls
    this.createControls();
    
    // Create overlay container
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.className = 'fretboard-overlays';
    this.container.appendChild(this.overlayContainer);
  }

  /**
   * Create navigation controls
   */
  createControls() {
    const controls = document.createElement('div');
    controls.className = 'fretboard-controls';
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.addEventListener('click', () => this.previousBar());
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.addEventListener('click', () => this.nextBar());
    
    const barDisplay = document.createElement('span');
    barDisplay.className = 'bar-display';
    barDisplay.textContent = 'Bar 0';
    this.barDisplay = barDisplay;
    
    controls.appendChild(prevBtn);
    controls.appendChild(barDisplay);
    controls.appendChild(nextBtn);
    
    this.container.insertBefore(controls, this.svg);
  }

  /**
   * Load bars (projection outputs)
   * CRITICAL: This function must NEVER limit bars to 4 - it accepts any number of bars
   */
  loadBars(bars) {
    if (!bars || !Array.isArray(bars)) {
      console.error('ERROR: loadBars called with invalid input:', bars);
      this.bars = [];
      return;
    }
    
    // CRITICAL VERIFICATION: Log if we're getting exactly 4 bars (may indicate a bug upstream)
    if (bars.length === 4) {
      console.warn('⚠️ WARNING: loadBars received exactly 4 bars. This may indicate a bug if more bars were expected.');
    }
    
    // NO LIMITS - Store all bars as provided
    this.bars = bars;
    this.currentBar = 0;
    
    console.log(`✓ FretboardUI.loadBars: Loaded ${this.bars.length} bars (NO LIMIT APPLIED)`);
    
    if (bars.length > 0) {
      this.renderBar(0);
    } else {
      console.warn('⚠️ WARNING: loadBars called with empty array');
    }
  }

  /**
   * Render a specific bar
   */
  renderBar(barIndex) {
    if (barIndex < 0 || barIndex >= this.bars.length) {
      return;
    }
    
    this.currentBar = barIndex;
    this.currentMapping = this.bars[barIndex];
    
    // Clear SVG
    this.svg.innerHTML = '';
    
    // Draw fretboard
    this.drawFretboard();
    
    // Draw notes
    this.drawNotes();
    
    // Update controls
    this.barDisplay.textContent = `Bar ${barIndex + 1} / ${this.bars.length}`;
    
    // Update overlays
    this.updateOverlays();
  }

  /**
   * Draw the fretboard (strings and frets)
   */
  drawFretboard() {
    if (!this.currentMapping) return;
    
    const { positionWindow, anchorFret } = this.currentMapping;
    
    // Determine fret range (positionWindow ± 2 for context)
    const minFret = Math.max(0, (positionWindow?.[0] || anchorFret) - 2);
    const maxFret = Math.min(12, (positionWindow?.[1] || anchorFret + 5) + 2);
    
    const fretRange = maxFret - minFret + 1;
    const width = this.STRING_LABEL_WIDTH + (fretRange * this.FRET_WIDTH) + (minFret === 0 ? this.NUT_WIDTH : 0);
    const height = (6 * this.STRING_SPACING) + this.FRET_LABEL_HEIGHT;
    
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    
    // Draw nut if fret 0 is visible
    if (minFret === 0) {
      const nut = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      nut.setAttribute('x', this.STRING_LABEL_WIDTH);
      nut.setAttribute('y', 0);
      nut.setAttribute('width', this.NUT_WIDTH);
      nut.setAttribute('height', 6 * this.STRING_SPACING);
      nut.setAttribute('fill', '#333');
      this.svg.appendChild(nut);
    }
    
    // Draw strings (6 horizontal lines)
    for (let i = 0; i < 6; i++) {
      const string = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const y = (i * this.STRING_SPACING) + (this.STRING_SPACING / 2);
      const startX = this.STRING_LABEL_WIDTH + (minFret === 0 ? this.NUT_WIDTH : 0);
      const endX = width;
      
      string.setAttribute('x1', startX);
      string.setAttribute('y1', y);
      string.setAttribute('x2', endX);
      string.setAttribute('y2', y);
      string.setAttribute('stroke', '#666');
      string.setAttribute('stroke-width', '1');
      this.svg.appendChild(string);
      
      // String label (E, A, D, G, B, e)
      const labels = ['E', 'A', 'D', 'G', 'B', 'e'];
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', this.STRING_LABEL_WIDTH / 2);
      label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '14');
      label.setAttribute('fill', '#333');
      label.textContent = labels[i];
      this.svg.appendChild(label);
    }
    
    // Draw frets
    const positionWindowStart = positionWindow?.[0] || anchorFret;
    const positionWindowEnd = positionWindow?.[1] || anchorFret + 5;
    
    for (let fret = minFret; fret <= maxFret; fret++) {
      const fretNum = fret;
      const x = this.STRING_LABEL_WIDTH + (minFret === 0 ? this.NUT_WIDTH : 0) + ((fretNum - minFret) * this.FRET_WIDTH);
      
      // Determine if fret is in position window
      const inWindow = fretNum >= positionWindowStart && fretNum <= positionWindowEnd;
      const opacity = inWindow ? 1.0 : this.WINDOW_ALPHA;
      
      // Draw fret line
      const fretLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      fretLine.setAttribute('x1', x);
      fretLine.setAttribute('y1', 0);
      fretLine.setAttribute('x2', x);
      fretLine.setAttribute('y2', 6 * this.STRING_SPACING);
      fretLine.setAttribute('stroke', '#999');
      fretLine.setAttribute('stroke-width', '1');
      fretLine.setAttribute('opacity', opacity);
      this.svg.appendChild(fretLine);
      
      // Fret number
      const fretLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      fretLabel.setAttribute('x', x);
      fretLabel.setAttribute('y', (6 * this.STRING_SPACING) + 20);
      fretLabel.setAttribute('text-anchor', 'middle');
      fretLabel.setAttribute('font-size', '12');
      fretLabel.setAttribute('fill', '#666');
      fretLabel.setAttribute('opacity', opacity);
      fretLabel.textContent = fretNum;
      this.svg.appendChild(fretLabel);
    }
    
    // Highlight position window
    if (positionWindow) {
      const windowRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const windowStartX = this.STRING_LABEL_WIDTH + (minFret === 0 ? this.NUT_WIDTH : 0) + ((positionWindowStart - minFret) * this.FRET_WIDTH);
      const windowEndX = this.STRING_LABEL_WIDTH + (minFret === 0 ? this.NUT_WIDTH : 0) + ((positionWindowEnd - minFret + 1) * this.FRET_WIDTH);
      
      windowRect.setAttribute('x', windowStartX);
      windowRect.setAttribute('y', 0);
      windowRect.setAttribute('width', windowEndX - windowStartX);
      windowRect.setAttribute('height', 6 * this.STRING_SPACING);
      windowRect.setAttribute('fill', '#e8f4f8');
      windowRect.setAttribute('opacity', '0.3');
      windowRect.setAttribute('class', 'position-window');
      this.svg.insertBefore(windowRect, this.svg.firstChild);
    }
  }

  /**
   * Draw notes on the fretboard
   */
  drawNotes() {
    if (!this.currentMapping) return;
    
    const { frets, stringSet, movementType } = this.currentMapping;
    const positionWindow = this.currentMapping.positionWindow || [this.currentMapping.anchorFret, this.currentMapping.anchorFret + 5];
    const minFret = Math.max(0, positionWindow[0] - 2);
    
    // Determine note color based on movement type
    let noteColor = '#4a90e2'; // Default blue
    if (movementType === 'HOLD') {
      noteColor = '#2c5aa0'; // Darker blue (still)
    } else if (movementType === 'STEP') {
      noteColor = '#4a90e2'; // Standard blue
    } else if (movementType === 'RESET') {
      noteColor = '#e24a4a'; // Red (jump)
    }
    
    // Draw each note
    for (let i = 0; i < frets.length; i++) {
      if (frets[i] !== null && stringSet.includes(i + 1)) {
        const stringNum = i + 1; // 1-6
        const fretNum = frets[i];
        
        const y = ((stringNum - 1) * this.STRING_SPACING) + (this.STRING_SPACING / 2);
        const x = this.STRING_LABEL_WIDTH + (minFret === 0 ? this.NUT_WIDTH : 0) + ((fretNum - minFret) * this.FRET_WIDTH) + (this.FRET_WIDTH / 2);
        
        // Draw note circle
        const note = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        note.setAttribute('cx', x);
        note.setAttribute('cy', y);
        note.setAttribute('r', this.NOTE_RADIUS);
        note.setAttribute('fill', noteColor);
        note.setAttribute('stroke', '#fff');
        note.setAttribute('stroke-width', '2');
        note.setAttribute('class', `note note-${movementType.toLowerCase()}`);
        this.svg.appendChild(note);
        
        // Note name on note (use MIDI note from projection if available, otherwise calculate)
        let noteMidi;
        if (this.currentMapping.midiNotes && this.currentMapping.midiNotes[i] !== null) {
          noteMidi = this.currentMapping.midiNotes[i];
        } else {
          // Fallback: calculate from string and fret
          const openNoteMidi = this.GUITAR_TUNING[stringNum - 1];
          noteMidi = openNoteMidi + fretNum;
        }
        
        // Get all MIDI notes in current chord for context-aware accidental selection
        let contextMidiNotes = null;
        if (this.currentMapping.midiNotes) {
          contextMidiNotes = this.currentMapping.midiNotes.filter(n => n !== null && n !== undefined);
          // Ensure we have at least 2 notes for context (chord detection needs multiple notes)
          if (contextMidiNotes.length < 2) {
            contextMidiNotes = null;
          }
        } else {
          // Fallback: calculate MIDI notes from frets for context
          // This helps when demo data or old projection outputs don't include midiNotes
          const calculatedMidiNotes = [];
          for (let j = 0; j < this.currentMapping.frets.length; j++) {
            if (this.currentMapping.frets[j] !== null && this.currentMapping.stringSet.includes(j + 1)) {
              const openNoteMidi = this.GUITAR_TUNING[j];
              const calculatedMidi = openNoteMidi + this.currentMapping.frets[j];
              calculatedMidiNotes.push(calculatedMidi);
            }
          }
          if (calculatedMidiNotes.length >= 2) {
            contextMidiNotes = calculatedMidiNotes;
          }
        }
        const noteName = this.midiToNoteName(noteMidi, contextMidiNotes);
        
        const fretText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        fretText.setAttribute('x', x);
        fretText.setAttribute('y', y + 4);
        fretText.setAttribute('text-anchor', 'middle');
        fretText.setAttribute('font-size', '11');
        fretText.setAttribute('fill', '#fff');
        fretText.setAttribute('font-weight', 'bold');
        fretText.textContent = noteName;
        this.svg.appendChild(fretText);
      }
    }
  }

  /**
   * Update optional overlays
   */
  updateOverlays() {
    if (!this.currentMapping) return;
    
    this.overlayContainer.innerHTML = '';
    
    if (this.options.showBarNumber) {
      const barOverlay = document.createElement('div');
      barOverlay.className = 'overlay-bar-number';
      barOverlay.textContent = `Bar ${this.currentBar + 1}`;
      this.overlayContainer.appendChild(barOverlay);
    }
    
    if (this.options.showMovementType) {
      const movementOverlay = document.createElement('div');
      movementOverlay.className = 'overlay-movement-type';
      movementOverlay.textContent = this.currentMapping.movementType;
      movementOverlay.classList.add(`movement-${this.currentMapping.movementType.toLowerCase()}`);
      this.overlayContainer.appendChild(movementOverlay);
    }
    
    if (this.options.showReasonCodes && this.currentMapping.reasonCodes) {
      const reasonOverlay = document.createElement('div');
      reasonOverlay.className = 'overlay-reason-codes';
      const reasons = this.currentMapping.reasonCodes.map(rc => rc.message || rc.code).join(', ');
      reasonOverlay.textContent = reasons;
      this.overlayContainer.appendChild(reasonOverlay);
    }
  }

  /**
   * Navigate to next bar
   */
  nextBar() {
    if (this.currentBar < this.bars.length - 1) {
      this.renderBar(this.currentBar + 1);
    }
  }

  /**
   * Navigate to previous bar
   */
  previousBar() {
    if (this.currentBar > 0) {
      this.renderBar(this.currentBar - 1);
    }
  }

  /**
   * Get current bar index
   */
  getCurrentBar() {
    return this.currentBar;
  }

  /**
   * Update options
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    if (this.currentMapping) {
      this.updateOverlays();
    }
  }

  /**
   * Convert MIDI note number to note name with intelligent accidental choice
   * @param {number} midiNote - MIDI note number (0-127)
   * @param {Array<number>} contextMidiNotes - Optional: all MIDI notes in current chord for context
   * @returns {string} Note name (e.g., "C", "C#", "Eb", "F#")
   */
  midiToNoteName(midiNote, contextMidiNotes = null) {
    const noteIndex = midiNote % 12;
    
    // If we have context (all notes in the chord), use intelligent accidental selection
    if (contextMidiNotes && contextMidiNotes.length > 0) {
      return this.midiToNoteNameWithContext(midiNote, contextMidiNotes);
    }
    
    // Default: use sharps
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteNames[noteIndex];
  }

  /**
   * Convert MIDI note number to note name with context-aware accidental selection
   * Uses the root note and chord structure to determine accidental style
   */
  /**
   * Convert MIDI note to note name with context-aware enharmonic spelling.
   * 
   * Current approach: Heuristic-based with pattern matching for rare keys.
   * 
   * Limitations:
   * - Only handles specific rare keys that have been explicitly coded
   * - Cannot distinguish enharmonic equivalents (C# vs Db) without additional context
   * - Not algorithmic: doesn't build chords from first principles
   * 
   * Future improvements (see docs/ENHARMONIC_SPELLING.md):
   * - Algorithmic chord construction from root + chord type
   * - Letter-name integrity checks (ensure different letter names)
   * - Support for diminished, augmented, and seventh chords
   * - Consider integrating libraries like teoria.js or Tonal.js
   * 
   * @param {number} midiNote - MIDI note number (0-127)
   * @param {number[]} contextMidiNotes - All MIDI notes in the chord for context
   * @returns {string} Note name with proper enharmonic spelling (e.g., "C♯", "E♯", "B𝄫")
   */
  /**
   * Infer root name and chord type from MIDI notes, then use deterministic spelling
   * @param {number[]} contextMidiNotes - All MIDI notes in the chord
   * @returns {{rootName: string, chordType: string} | null} - Inferred root and type, or null if can't determine
   */
  inferChordFromMidi(contextMidiNotes) {
    if (contextMidiNotes.length < 2) return null;
    
    const rootMidi = Math.min(...contextMidiNotes);
    const rootIndex = rootMidi % 12;
    const sortedNotes = [...contextMidiNotes].sort((a, b) => a - b);
    
    // Check intervals from root
    const intervals = sortedNotes.map(note => (note - rootMidi) % 12);
    const hasMinorThird = intervals.includes(3);
    const hasMajorThird = intervals.includes(4);
    const hasPerfectFifth = intervals.includes(7);
    const hasDiminishedFifth = intervals.includes(6);
    const hasAugmentedFifth = intervals.includes(8);
    const hasMinorSeventh = intervals.includes(10);
    const hasMajorSeventh = intervals.includes(11);
    const hasDiminishedSeventh = intervals.includes(9);
    
    // Determine chord type
    let chordType = null;
    if (contextMidiNotes.length === 3) {
      if (hasMinorThird && hasDiminishedFifth) chordType = 'diminished';
      else if (hasMajorThird && hasAugmentedFifth) chordType = 'augmented';
      else if (hasMinorThird) chordType = 'minor';
      else if (hasMajorThird) chordType = 'major';
    } else if (contextMidiNotes.length === 4) {
      if (hasMinorThird && hasDiminishedFifth && hasDiminishedSeventh) chordType = 'dim7';
      else if (hasMinorThird && hasPerfectFifth && hasMinorSeventh) chordType = 'm7';
      else if (hasMajorThird && hasPerfectFifth && hasMinorSeventh) chordType = '7';
      else if (hasMajorThird && hasPerfectFifth && hasMajorSeventh) chordType = 'maj7';
      else if (hasMajorThird && hasAugmentedFifth && hasMajorSeventh) chordType = 'augmaj7';
    }
    
    if (!chordType) return null;
    
    // Infer root name from root index and chord structure
    // This is a simplified inference - in practice, we'd need more context
    const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const flatNames = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
    
    // Use heuristics to determine if root should be sharp or flat
    let useFlats = false;
    if (rootIndex === 0) useFlats = hasMinorThird;
    else if (rootIndex === 1) useFlats = false; // C# default
    else if (rootIndex === 2) useFlats = false;
    else if (rootIndex === 3) useFlats = true; // Eb default
    else if (rootIndex === 4) useFlats = false;
    else if (rootIndex === 5) useFlats = true;
    else if (rootIndex === 6) useFlats = false; // F# default
    else if (rootIndex === 7) useFlats = hasMinorThird;
    else if (rootIndex === 8) useFlats = true; // Ab default
    else if (rootIndex === 9) useFlats = false;
    else if (rootIndex === 10) useFlats = true; // Bb default
    else if (rootIndex === 11) useFlats = false;
    
    const rootName = useFlats ? flatNames[rootIndex] : noteNames[rootIndex];
    
    return { rootName, chordType };
  }

  midiToNoteNameWithContext(midiNote, contextMidiNotes) {
    const noteIndex = midiNote % 12;
    
    // Try to use deterministic chord spelling first
    const inferred = this.inferChordFromMidi(contextMidiNotes);
    if (inferred) {
      try {
        const spelledChord = spellChord(inferred.rootName, inferred.chordType);
        const rootMidi = Math.min(...contextMidiNotes);
        const sortedContext = [...contextMidiNotes].sort((a, b) => a - b);
        const notePosition = sortedContext.indexOf(midiNote);
        
        if (notePosition >= 0 && notePosition < spelledChord.length) {
          return spelledChord[notePosition];
        }
      } catch (error) {
        // Fall through to heuristic approach if spelling fails
      }
    }
    
    // Fallback to heuristic approach for chords we can't spell deterministically
    // Find root note (lowest MIDI note in chord)
    // Note: This assumes the lowest note is the root, which may not always be true
    // for inverted chords. A more robust system would accept the root explicitly.
    const rootMidi = Math.min(...contextMidiNotes);
    const rootIndex = rootMidi % 12;
    
    // Check if chord is minor (has minor third = 3 semitones from root)
    const sortedNotes = [...contextMidiNotes].sort((a, b) => a - b);
    const hasMinorThird = sortedNotes.some(note => (note - rootMidi) % 12 === 3);
    
    // First, detect rare keys with double accidentals by chord structure
    // Cb major: B (11), Eb (3), Gb (6)
    const isCbMajor = rootIndex === 11 && !hasMinorThird && 
                      contextMidiNotes.some(n => (n % 12) === 3) && 
                      contextMidiNotes.some(n => (n % 12) === 6) &&
                      contextMidiNotes.length === 3;
    // G# major: Ab (8), C (0), Eb (3)  
    const isGbMajor = rootIndex === 8 && !hasMinorThird &&
                      contextMidiNotes.some(n => (n % 12) === 0) && 
                      contextMidiNotes.some(n => (n % 12) === 3) &&
                      contextMidiNotes.length === 3;
    // Fb minor: E (4), G (7), B (11)
    const isFbMinor = rootIndex === 4 && hasMinorThird &&
                      contextMidiNotes.some(n => (n % 12) === 7) && 
                      contextMidiNotes.some(n => (n % 12) === 11) &&
                      contextMidiNotes.length === 3;
    // D# minor: Eb (3), Gb (6), Bb (10)
    const isDSharpMinor = rootIndex === 3 && hasMinorThird &&
                          contextMidiNotes.some(n => (n % 12) === 6) && 
                          contextMidiNotes.some(n => (n % 12) === 10) &&
                          contextMidiNotes.length === 3;
    // A# major: A# (10), C## (2), E# (5)
    const isASharpMajor = rootIndex === 10 && !hasMinorThird &&
                          contextMidiNotes.some(n => (n % 12) === 2) && 
                          contextMidiNotes.some(n => (n % 12) === 5) &&
                          contextMidiNotes.length === 3;
    // Gb minor (theoretical): Gb (6), B𝄫 (9), Db (1)
    const isGbMinor = rootIndex === 6 && hasMinorThird &&
                      contextMidiNotes.some(n => (n % 12) === 9) && 
                      contextMidiNotes.some(n => (n % 12) === 1) &&
                      contextMidiNotes.length === 3;
    // B𝄫 major (theoretical): B𝄫 (10), D𝄫 (0), F♭ (4)
    const isBDoubleFlatMajor = rootIndex === 10 && !hasMinorThird &&
                                contextMidiNotes.some(n => (n % 12) === 0) && 
                                contextMidiNotes.some(n => (n % 12) === 4) &&
                                contextMidiNotes.length === 3;
    
    // Determine if we should use flats based on root note and chord type
    // Key signatures:
    // Sharp keys: G(7), D(2), A(9), E(4), B(11), F#(6), C#(1)
    // Flat keys: F(5), Bb(10), Eb(3), Ab(8), Db(1), Gb(6), Cb(11)
    
    // For enharmonic equivalents, use music theory conventions:
    // C# vs Db: C# is more common (sharp key with 7 sharps)
    // D# vs Eb: Eb is more common (flat key with 3 flats) - D# is very rare
    // F# vs Gb: F# is more common (sharp key with 6 sharps)
    // G# vs Ab: Ab is more common (flat key with 4 flats) - G# is very rare
    // A# vs Bb: Bb is more common (flat key with 2 flats) - A# is very rare
    
    let useFlats = false;
    
    // Determine key signature style based on root note
    // Sharp keys: C#(7#), F#(6#), B(5#), E(4#), A(3#), D(2#), G(1#)
    // Flat keys: Cb(7b), Gb(6b), Db(5b), Ab(4b), Eb(3b), Bb(2b), F(1b)
    
    // Handle each root note with proper key signature detection
    // First, try to detect the key signature from the chord structure
    // Count how many notes would be "sharp" vs "flat" in each interpretation
    
    if (rootIndex === 0) { // C
      // C major: no accidentals, C minor: uses Eb (flat)
      useFlats = hasMinorThird;
    } else if (rootIndex === 1) { // C# or Db
      // C# major: C#, E# (F), G# (all sharps or E#)
      // Db major: Db, F, Ab (all flats)
      // Both have same MIDI notes - cannot distinguish reliably
      // Default to C# (more common in practice)
      // Note: This means Db will display as C# - this is a limitation of MIDI-only representation
      useFlats = false; // Default to C# (sharps)
    } else if (rootIndex === 2) { // D
      // D major: sharps, D minor: no accidentals
      useFlats = false;
    } else if (rootIndex === 3) { // D# or Eb
      if (isDSharpMinor) {
        useFlats = false; // D# minor uses sharps
      } else if (hasMinorThird) {
        useFlats = true; // Ebm uses flats
      } else {
        useFlats = true; // Eb major uses flats
      }
    } else if (rootIndex === 4) { // E
      // E major: sharps, E minor: no accidentals
      useFlats = false;
    } else if (rootIndex === 5) { // F
      // F major: flat, F minor: flats
      useFlats = true;
    } else if (rootIndex === 6) { // F# or Gb
      if (isGbMinor) {
        useFlats = true; // Gb minor uses flats
      } else if (!hasMinorThird) {
        useFlats = false; // F# major uses sharps
      } else {
        useFlats = false; // F# minor uses sharps
      }
    } else if (rootIndex === 7) { // G
      // G major: sharps, G minor: flats (Bb)
      useFlats = hasMinorThird;
    } else if (rootIndex === 8) { // G# or Ab
      if (isGbMajor) {
        useFlats = false; // G# major uses sharps
      } else if (!hasMinorThird) {
        useFlats = true; // Ab major uses flats
      } else {
        useFlats = true; // Ab minor uses flats
      }
    } else if (rootIndex === 9) { // A
      // A major: sharps, A minor: no accidentals
      useFlats = false;
    } else if (rootIndex === 10) { // A# or Bb or B𝄫
      if (isASharpMajor) {
        useFlats = false; // A# major uses sharps
      } else if (isBDoubleFlatMajor) {
        useFlats = true; // B𝄫 major uses flats
      } else {
        useFlats = true; // Bb uses flats
      }
    } else if (rootIndex === 11) { // B or Cb
      if (isCbMajor) {
        useFlats = true; // Cb major uses flats
      } else if (!hasMinorThird) {
        useFlats = false; // B major uses sharps
      } else {
        useFlats = false; // B minor uses sharps
      }
    } else if (rootIndex === 4) { // E or Fb
      if (isFbMinor) {
        useFlats = true; // Fb minor uses flats
      } else if (hasMinorThird) {
        useFlats = false; // E minor uses sharps
      } else {
        useFlats = false; // E major uses sharps
      }
    }
    
    const sharpNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const flatNames = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
    
    let result = useFlats ? flatNames[noteIndex] : sharpNames[noteIndex];
    
    // Handle enharmonic spellings and double accidentals for rare keys
    if (!useFlats) {
      // Sharp keys: need to spell notes correctly
      if (rootIndex === 1) { // C# key
        if (noteIndex === 5) result = 'E♯'; // F should be E# in C# major
        if (noteIndex === 0) result = 'B♯'; // C should be B# in C# major (if present)
        if (noteIndex === 8) result = 'G♯'; // Ab should be G# in C# major
      } else if (isGbMajor) { // G# major (detected)
        if (noteIndex === 0) result = 'B♯'; // C should be B# in G# major
        if (noteIndex === 3) result = 'D♯'; // Eb should be D# in G# major
        if (noteIndex === 8) result = 'G♯'; // Ab should be G# in G# major
      } else if (isDSharpMinor) { // D# minor (detected)
        if (noteIndex === 3) result = 'D♯'; // Eb should be D# in D# minor
        if (noteIndex === 6) result = 'F♯'; // Gb should be F# in D# minor
        if (noteIndex === 10) result = 'A♯'; // Bb should be A# in D# minor
      } else if (isASharpMajor) { // A# major (detected)
        if (noteIndex === 2) result = 'C𝄪'; // D should be C## in A# major
        if (noteIndex === 5) result = 'E♯'; // F should be E# in A# major
        if (noteIndex === 10) result = 'A♯'; // A# is already correct
      } else if (rootIndex === 6) { // F# key
        // F# major: F#, A#, C# - all already sharps
        // No special handling needed
      } else if (rootIndex === 11) { // B key
        // B major: B, D#, F# - all already sharps
        // No special handling needed
      } else if (rootIndex === 4) { // E key
        // E major: E, G#, B - all already sharps
        // No special handling needed
      } else if (rootIndex === 9) { // A key
        // A major: A, C#, E - all already sharps
        // No special handling needed
      } else if (rootIndex === 2) { // D key
        // D major: D, F#, A - all already sharps
        // No special handling needed
      } else if (rootIndex === 7) { // G key
        // G major: G, B, D - F# is already sharp
        // No special handling needed
      }
    } else {
      // Flat keys: handle double flats for rare keys
      if (isCbMajor) { // Cb major (detected)
        if (noteIndex === 11) result = 'C♭'; // B should be Cb in Cb major
        if (noteIndex === 3) result = 'E♭'; // D# should be Eb in Cb major
        if (noteIndex === 6) result = 'G♭'; // F# should be Gb in Cb major
      } else if (isFbMinor) { // Fb minor (detected)
        if (noteIndex === 4) result = 'F♭'; // E should be Fb in Fb minor
        if (noteIndex === 7) result = 'A♭♭'; // G should be Abb in Fb minor
        if (noteIndex === 11) result = 'C♭'; // B should be Cb in Fb minor
      } else if (isGbMinor) { // Gb minor (detected)
        if (noteIndex === 6) result = 'G♭'; // F# should be Gb in Gb minor
        if (noteIndex === 9) result = 'B𝄫'; // A should be B𝄫 in Gb minor
        if (noteIndex === 1) result = 'D♭'; // C# should be Db in Gb minor
      } else if (isBDoubleFlatMajor) { // B𝄫 major (detected)
        if (noteIndex === 10) result = 'B𝄫'; // Bb should be B𝄫 in B𝄫 major
        if (noteIndex === 0) result = 'D𝄫'; // C should be D𝄫 in B𝄫 major
        if (noteIndex === 4) result = 'F♭'; // E should be F♭ in B𝄫 major
      }
    }
    
    return result;
  }
}




