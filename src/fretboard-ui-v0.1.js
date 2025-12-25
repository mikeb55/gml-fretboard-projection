/**
 * Fretboard UI v0.1
 * Labyrinth-style Visualiser
 * 
 * This UI:
 * - DOES NOT decide harmony
 * - DOES NOT project voicings
 * - ONLY shows what the projection layer already decided
 */

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
   */
  loadBars(bars) {
    this.bars = bars;
    this.currentBar = 0;
    if (bars.length > 0) {
      this.renderBar(0);
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
    const maxFret = Math.min(20, (positionWindow?.[1] || anchorFret + 5) + 2);
    
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
        
        // Fret number on note
        const fretText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        fretText.setAttribute('x', x);
        fretText.setAttribute('y', y + 4);
        fretText.setAttribute('text-anchor', 'middle');
        fretText.setAttribute('font-size', '11');
        fretText.setAttribute('fill', '#fff');
        fretText.setAttribute('font-weight', 'bold');
        fretText.textContent = fretNum;
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
}




