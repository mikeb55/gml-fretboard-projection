/**
 * Quartal Atlas UI Controller - Handles UI state and rendering
 * Simplified version for quartal harmony visualization
 */

const UIController = {
    // SVG dimensions
    stringSpacing: 40,
    fretWidth: 50,
    nutWidth: 8,
    startFret: 0,
    endFret: 24,
    numStrings: 6,
    MAX_FRET_SPAN: 4, // Maximum fret span for playable shapes
    
    // State
    state: {
        root: 0,
        type: 'perfect', // 'perfect', 'mixed', or 'diatonic'
        scale: 'major', // Scale/mode for diatonic type
        stringSet: '6-3',
        inversion: 0,
        colorMode: true,
        flowDirection: 'ascending',
        lfvActive: false,
        lfvMinFret: 1,
        lfvMaxFret: 4,
        inversionCycleMode: false,
        showTargetNoteOnly: false,
        hideContextNotes: false,
        viewMode: 'portrait',
        simplePracticeMode: false
    },
    
    /**
     * Initialize the UI
     */
    init() {
        document.body.classList.add('color-mode');
        const flowBtn = document.getElementById('flowDirection');
        if (flowBtn) {
            flowBtn.textContent = `Flow: ${this.state.flowDirection.charAt(0).toUpperCase() + this.state.flowDirection.slice(1)}`;
        }
        
        const savedViewMode = localStorage.getItem('quartalAtlasViewMode');
        if (savedViewMode === 'landscape' || savedViewMode === 'portrait') {
            this.state.viewMode = savedViewMode;
        }
        this.applyViewMode();
        
        this.setupEventListeners();
        
        // Show/hide scale panel based on initial type
        const scalePanel = document.getElementById('scaleSelectionPanel');
        if (scalePanel) {
            scalePanel.style.display = this.state.type === 'diatonic' ? 'block' : 'none';
        }
        
        this.renderFretboard();
        this.updateDisplay();
    },
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const rootSelect = document.getElementById('root');
        if (rootSelect) {
            rootSelect.addEventListener('change', (e) => {
                this.state.root = parseInt(e.target.value);
                this.updateDisplay();
            });
        }
        
        const typeSelect = document.getElementById('type');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.state.type = e.target.value;
                const scalePanel = document.getElementById('scaleSelectionPanel');
                if (scalePanel) {
                    scalePanel.style.display = this.state.type === 'diatonic' ? 'block' : 'none';
                }
                this.updateDisplay();
            });
        }
        
        const scaleSelect = document.getElementById('scale');
        if (scaleSelect) {
            scaleSelect.addEventListener('change', (e) => {
                this.state.scale = e.target.value;
                this.updateDisplay();
            });
        }
        
        const stringSetSelect = document.getElementById('stringSet');
        if (stringSetSelect) {
            stringSetSelect.addEventListener('change', (e) => {
                this.state.stringSet = e.target.value;
                this.updateDisplay();
            });
        }
        
        const inversionSelect = document.getElementById('inversion');
        if (inversionSelect) {
            inversionSelect.addEventListener('change', (e) => {
                this.handleInversionChange(parseInt(e.target.value));
            });
        }
        
        const flowBtn = document.getElementById('flowDirection');
        if (flowBtn) {
            flowBtn.addEventListener('click', () => {
                this.state.flowDirection = this.state.flowDirection === 'ascending' ? 'descending' : 'ascending';
                flowBtn.textContent = `Flow: ${this.state.flowDirection.charAt(0).toUpperCase() + this.state.flowDirection.slice(1)}`;
            });
        }
        
        const colorModeBtn = document.getElementById('colorMode');
        if (colorModeBtn) {
            colorModeBtn.addEventListener('click', () => {
                this.toggleColorMode();
            });
        }
        
        const prevInversionBtn = document.getElementById('prevInversion');
        if (prevInversionBtn) {
            prevInversionBtn.addEventListener('click', () => {
                this.navigateInversion('previous');
            });
        }
        
        const nextInversionBtn = document.getElementById('nextInversion');
        if (nextInversionBtn) {
            nextInversionBtn.addEventListener('click', () => {
                this.navigateInversion('next');
            });
        }
        
        const limitedViewBtn = document.getElementById('limitedView');
        if (limitedViewBtn) {
            limitedViewBtn.addEventListener('click', () => {
                this.toggleLimitedView();
            });
        }
        
        const lfvRangeSelect = document.getElementById('lfvRange');
        if (lfvRangeSelect) {
            lfvRangeSelect.addEventListener('change', (e) => {
                const range = e.target.value.split('-');
                this.state.lfvMinFret = parseInt(range[0]);
                this.state.lfvMaxFret = parseInt(range[1]);
                this.updateDisplay();
            });
        }
        
        const inversionCycleModeBtn = document.getElementById('inversionCycleMode');
        if (inversionCycleModeBtn) {
            inversionCycleModeBtn.addEventListener('click', () => {
                this.toggleInversionCycleMode();
            });
        }
        
        const showTargetNoteOnlyBtn = document.getElementById('showTargetNoteOnly');
        if (showTargetNoteOnlyBtn) {
            showTargetNoteOnlyBtn.addEventListener('click', () => {
                this.toggleShowTargetNoteOnly();
            });
        }
        
        const hideContextNotesBtn = document.getElementById('hideContextNotes');
        if (hideContextNotesBtn) {
            hideContextNotesBtn.addEventListener('click', () => {
                this.toggleHideContextNotes();
            });
        }
        
        const exportPNGBtn = document.getElementById('exportPNG');
        if (exportPNGBtn) {
            exportPNGBtn.addEventListener('click', () => {
                this.exportFretboardPNG();
            });
        }
        
        const viewToggle = document.getElementById('viewToggle');
        if (viewToggle) {
            viewToggle.addEventListener('click', () => {
                this.toggleViewMode();
            });
        }
        
        const simplePracticeModeBtn = document.getElementById('simplePracticeMode');
        if (simplePracticeModeBtn) {
            simplePracticeModeBtn.addEventListener('click', () => {
                this.toggleSimplePracticeMode();
            });
        }
    },
    
    /**
     * Handle inversion change
     */
    handleInversionChange(newInversion) {
        this.state.inversion = newInversion;
        this.updateDisplay();
    },
    
    /**
     * Navigate to next or previous inversion
     */
    navigateInversion(direction) {
        const newInversion = direction === 'next'
            ? QuartalEngine.getNextInversion(this.state.inversion, this.state.flowDirection)
            : QuartalEngine.getPreviousInversion(this.state.inversion, this.state.flowDirection);
        
        const inversionSelect = document.getElementById('inversion');
        if (inversionSelect) {
            inversionSelect.value = newInversion;
            inversionSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    },
    
    /**
     * Toggle color mode
     */
    toggleColorMode() {
        this.state.colorMode = !this.state.colorMode;
        const colorModeBtn = document.getElementById('colorMode');
        if (colorModeBtn) {
            if (this.state.colorMode) {
                document.body.classList.remove('bw-mode');
                document.body.classList.add('color-mode');
                colorModeBtn.textContent = 'Color Mode';
                colorModeBtn.setAttribute('data-mode', 'color');
            } else {
                document.body.classList.remove('color-mode');
                document.body.classList.add('bw-mode');
                colorModeBtn.textContent = 'B&W Mode';
                colorModeBtn.setAttribute('data-mode', 'bw');
            }
        }
    },
    
    /**
     * Toggle limited view
     */
    toggleLimitedView() {
        this.state.lfvActive = !this.state.lfvActive;
        const limitedViewBtn = document.getElementById('limitedView');
        const lfvPanel = document.getElementById('lfvSelectionPanel');
        
        if (limitedViewBtn) {
            if (this.state.lfvActive) {
                limitedViewBtn.setAttribute('data-mode', 'on');
                limitedViewBtn.textContent = 'Limited View: ON';
                if (lfvPanel) lfvPanel.style.display = 'block';
            } else {
                limitedViewBtn.setAttribute('data-mode', 'off');
                limitedViewBtn.textContent = 'Limited View: OFF';
                if (lfvPanel) lfvPanel.style.display = 'none';
            }
        }
        this.updateDisplay();
    },
    
    /**
     * Toggle inversion cycle mode (manual navigation only - no auto-advance)
     */
    toggleInversionCycleMode() {
        this.state.inversionCycleMode = !this.state.inversionCycleMode;
        const btn = document.getElementById('inversionCycleMode');
        if (btn) {
            btn.setAttribute('data-mode', this.state.inversionCycleMode ? 'on' : 'off');
            btn.textContent = `Inversion Cycle Mode: ${this.state.inversionCycleMode ? 'ON' : 'OFF'}`;
        }
        // No auto-advance - just a visual indicator that manual cycling is enabled
        this.updateDisplay();
    },
    
    /**
     * Toggle show target note only
     */
    toggleShowTargetNoteOnly() {
        this.state.showTargetNoteOnly = !this.state.showTargetNoteOnly;
        const btn = document.getElementById('showTargetNoteOnly');
        if (btn) {
            btn.setAttribute('data-mode', this.state.showTargetNoteOnly ? 'on' : 'off');
            btn.textContent = `Show Target Note Only: ${this.state.showTargetNoteOnly ? 'ON' : 'OFF'}`;
        }
        this.updateDisplay();
    },
    
    /**
     * Toggle hide context notes
     */
    toggleHideContextNotes() {
        this.state.hideContextNotes = !this.state.hideContextNotes;
        const btn = document.getElementById('hideContextNotes');
        if (btn) {
            btn.setAttribute('data-mode', this.state.hideContextNotes ? 'on' : 'off');
            btn.textContent = `Hide Context Notes: ${this.state.hideContextNotes ? 'ON' : 'OFF'}`;
        }
        this.updateDisplay();
    },
    
    /**
     * Toggle view mode (portrait/landscape)
     */
    toggleViewMode() {
        this.state.viewMode = this.state.viewMode === 'portrait' ? 'landscape' : 'portrait';
        localStorage.setItem('quartalAtlasViewMode', this.state.viewMode);
        this.applyViewMode();
    },
    
    /**
     * Apply view mode to body
     */
    applyViewMode() {
        if (this.state.viewMode === 'landscape') {
            document.body.classList.add('landscape');
        } else {
            document.body.classList.remove('landscape');
        }
        const viewToggle = document.getElementById('viewToggle');
        if (viewToggle) {
            viewToggle.textContent = `View: ${this.state.viewMode.charAt(0).toUpperCase() + this.state.viewMode.slice(1)}`;
            viewToggle.setAttribute('data-view', this.state.viewMode);
        }
    },
    
    /**
     * Toggle simple practice mode
     */
    toggleSimplePracticeMode() {
        this.state.simplePracticeMode = !this.state.simplePracticeMode;
        const btn = document.getElementById('simplePracticeMode');
        const advancedControls = document.getElementById('advancedControls');
        const practiceControls = document.getElementById('practiceModeControls');
        
        if (btn) {
            btn.setAttribute('data-mode', this.state.simplePracticeMode ? 'on' : 'off');
            btn.textContent = `Practice Mode: ${this.state.simplePracticeMode ? 'ON' : 'OFF'}`;
        }
        
        if (advancedControls) {
            advancedControls.style.display = this.state.simplePracticeMode ? 'none' : 'block';
        }
        
        if (practiceControls) {
            practiceControls.style.display = this.state.simplePracticeMode ? 'block' : 'none';
        }
    },
    
    /**
     * Render the fretboard SVG
     */
    renderFretboard() {
        const fretboardEl = document.getElementById('fretboard');
        if (!fretboardEl) return;
        
        fretboardEl.innerHTML = '';
        
        const stringSetIndices = QuartalEngine.getStringSetIndices(this.state.stringSet);
        const numFrets = this.endFret - this.startFret + 1;
        const width = numFrets * this.fretWidth + this.nutWidth;
        const fretboardHeight = this.numStrings * this.stringSpacing;
        const markerAreaHeight = 40; // Space below fretboard for markers
        const totalHeight = fretboardHeight + markerAreaHeight;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'fretboard-svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', totalHeight);
        svg.setAttribute('viewBox', `0 0 ${width} ${totalHeight}`);
        
        // Draw nut
        const nut = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nut.setAttribute('class', 'nut-line');
        nut.setAttribute('x1', this.nutWidth / 2);
        nut.setAttribute('y1', 0);
        nut.setAttribute('x2', this.nutWidth / 2);
        nut.setAttribute('y2', fretboardHeight);
        svg.appendChild(nut);
        
        // Draw strings
        for (let i = 0; i < this.numStrings; i++) {
            const string = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            string.setAttribute('class', 'string-line');
            string.setAttribute('x1', 0);
            string.setAttribute('y1', i * this.stringSpacing + this.stringSpacing / 2);
            string.setAttribute('x2', width);
            string.setAttribute('y2', i * this.stringSpacing + this.stringSpacing / 2);
            svg.appendChild(string);
            
            // String label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('class', 'string-label');
            label.setAttribute('x', this.nutWidth / 2);
            label.setAttribute('y', i * this.stringSpacing + this.stringSpacing / 2 + 5);
            label.textContent = QuartalEngine.getNoteName(QuartalEngine.tuning[i]);
            svg.appendChild(label);
        }
        
        // Draw frets
        for (let f = 0; f <= numFrets; f++) {
            const fret = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const x = this.nutWidth + f * this.fretWidth;
            const isHidden = this.state.lfvActive && (f + this.startFret < this.state.lfvMinFret || f + this.startFret > this.state.lfvMaxFret);
            
            fret.setAttribute('class', isHidden ? 'fret-line fret-line-hidden' : 'fret-line');
            fret.setAttribute('x1', x);
            fret.setAttribute('y1', 0);
            fret.setAttribute('x2', x);
            fret.setAttribute('y2', fretboardHeight);
            svg.appendChild(fret);
            
            // Fret number
            if (f > 0 && f <= 24) {
                const fretNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                fretNum.setAttribute('class', isHidden ? 'fret-number fret-number-hidden' : 'fret-number');
                fretNum.setAttribute('x', x - this.fretWidth / 2);
                fretNum.setAttribute('y', this.numStrings * this.stringSpacing + 15);
                fretNum.textContent = f + this.startFret;
                svg.appendChild(fretNum);
            }
            
        }
        
        // Draw fret markers below fretboard (standard guitar positions: 3, 5, 7, 9, 12, 15, 17)
        const markerPositions = [3, 5, 7, 9, 12, 15, 17];
        for (const markerFret of markerPositions) {
            if (markerFret >= this.startFret && markerFret <= this.endFret) {
                const markerX = this.nutWidth + (markerFret - this.startFret) * this.fretWidth - this.fretWidth / 2;
                const markerY = fretboardHeight + 20; // Position below fretboard
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                marker.setAttribute('class', 'fret-marker');
                marker.setAttribute('cx', markerX);
                marker.setAttribute('cy', markerY);
                marker.setAttribute('r', 5);
                marker.setAttribute('fill', '#666');
                svg.appendChild(marker);
            }
        }
        
        // Create notes group
        const notesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        notesGroup.setAttribute('id', 'notes-group');
        svg.appendChild(notesGroup);
        
        fretboardEl.appendChild(svg);
    },
    
    /**
     * Update the display with current quartal voicing
     */
    updateDisplay() {
        this.updateNotes();
        this.updateInfo();
    },
    
    /**
     * Place notes for a single inversion
     * Searches ALL positions across the fretboard, then selects the best compact shape
     * @param {Array<number>} invertedTones - Inverted quartal tones
     * @param {Array<number>} stringSetIndices - String set indices
     * @param {number} anchorFret - Anchor fret position (preferred position)
     * @param {number} anchorStringIndex - Anchor string index
     * @param {number} inversionIndex - Inversion index (0-3) for visual distinction
     * @returns {Array} Array of placed note objects
     */
    placeInversionNotes(invertedTones, stringSetIndices, anchorFret, anchorStringIndex, inversionIndex) {
        // CRITICAL: Inversions must map tones to strings in order
        // Tone[0] → String[0] (lowest string), Tone[1] → String[1], etc.
        // This ensures inversions produce visibly different shapes
        
        const placedNotes = [];
        
        // STEP 1: For each tone in the inversion, find positions on its assigned string
        // Map inverted tones to strings: tone[i] goes on stringSetIndices[i]
        for (let i = 0; i < invertedTones.length && i < stringSetIndices.length; i++) {
            const targetPitchClass = invertedTones[i] % 12;
            const assignedStringIndex = stringSetIndices[i];
            const positions = [];
            
            // Find ALL positions of this pitch class on the assigned string
            for (let fret = this.startFret; fret <= this.endFret; fret++) {
                const midiNote = QuartalEngine.getMidiNote(assignedStringIndex, fret);
                const pitchClass = QuartalEngine.getPitchClass(midiNote);
                
                if (pitchClass === targetPitchClass) {
                    positions.push({
                        fret,
                        midiNote,
                        stringIndex: assignedStringIndex,
                        pitchClass: targetPitchClass
                    });
                }
            }
            
            // If no positions found on assigned string, allow fallback to adjacent strings
            if (positions.length === 0) {
                // Try adjacent strings as fallback
                for (const stringIndex of stringSetIndices) {
                    if (stringIndex === assignedStringIndex) continue;
                    for (let fret = this.startFret; fret <= this.endFret; fret++) {
                        const midiNote = QuartalEngine.getMidiNote(stringIndex, fret);
                        const pitchClass = QuartalEngine.getPitchClass(midiNote);
                        if (pitchClass === targetPitchClass) {
                            positions.push({
                                fret,
                                midiNote,
                                stringIndex: stringIndex,
                                pitchClass: targetPitchClass
                            });
                        }
                    }
                }
            }
            
            // Store positions for this tone
            if (positions.length > 0) {
                placedNotes.push({
                    toneIndex: i,
                    positions: positions,
                    assignedString: assignedStringIndex
                });
            }
        }
        
        // STEP 2: Find the best combination of positions that forms a compact shape
        let bestShape = null;
        let bestScore = Infinity;
        
        // Try different combinations of positions for each tone
        // Start with the middle tone (anchor) near anchorFret
        const anchorToneIndex = Math.floor(placedNotes.length / 2);
        if (placedNotes.length === 0) return [];
        
        const anchorTone = placedNotes[anchorToneIndex];
        
        // Try each position of the anchor tone
        for (const anchorPos of anchorTone.positions) {
            const distanceFromAnchor = Math.abs(anchorPos.fret - anchorFret);
            if (distanceFromAnchor > 10) continue; // Skip positions too far from anchor
            
            const shape = [{ ...anchorPos, toneIndex: anchorToneIndex }];
            const usedStrings = new Set([anchorPos.stringIndex]);
            
            // Place remaining tones
            for (let toneIdx = 0; toneIdx < placedNotes.length; toneIdx++) {
                if (toneIdx === anchorToneIndex) continue;
                
                const toneData = placedNotes[toneIdx];
                let bestCandidate = null;
                let bestCandidateScore = Infinity;
                
                for (const candidate of toneData.positions) {
                    // Prefer assigned string
                    const isAssignedString = candidate.stringIndex === toneData.assignedString;
                    const stringBonus = isAssignedString ? 0 : 1000; // Heavy penalty for wrong string
                    
                    // Prefer adjacent strings
                    const stringDistance = Math.min(
                        ...Array.from(usedStrings).map(s => Math.abs(candidate.stringIndex - s))
                    );
                    
                    // Prefer compact shapes
                    const currentFrets = shape.map(p => p.fret);
                    const minFret = currentFrets.length > 0 ? Math.min(...currentFrets) : anchorPos.fret;
                    const maxFret = currentFrets.length > 0 ? Math.max(...currentFrets) : anchorPos.fret;
                    const span = Math.max(maxFret, candidate.fret) - Math.min(minFret, candidate.fret);
                    
                    // Score: prefer assigned string, compact shapes, adjacent strings, near anchor
                    const score = stringBonus + (span > this.MAX_FRET_SPAN ? 1000 : span * 10) + 
                                  stringDistance * 5 + Math.abs(candidate.fret - anchorFret);
                    
                    if (score < bestCandidateScore) {
                        bestCandidateScore = score;
                        bestCandidate = candidate;
                    }
                }
                
                if (bestCandidate) {
                    shape.push({ ...bestCandidate, toneIndex: toneIdx });
                    usedStrings.add(bestCandidate.stringIndex);
                }
            }
            
            // If we placed all tones, evaluate this shape
            if (shape.length === placedNotes.length) {
                const frets = shape.map(p => p.fret);
                const span = Math.max(...frets) - Math.min(...frets);
                const avgDistanceFromAnchor = shape.reduce((sum, p) => sum + Math.abs(p.fret - anchorFret), 0) / shape.length;
                
                // Check if all tones are on their assigned strings
                const allOnAssignedStrings = shape.every(pos => {
                    const toneData = placedNotes[pos.toneIndex];
                    return pos.stringIndex === toneData.assignedString;
                });
                
                // Score: prefer compact shapes, all on assigned strings, close to anchor
                const shapeScore = (span > this.MAX_FRET_SPAN ? 1000 : span * 10) + 
                                  (allOnAssignedStrings ? 0 : 500) + // Penalty if not all on assigned strings
                                  avgDistanceFromAnchor;
                
                if (shapeScore < bestScore) {
                    bestScore = shapeScore;
                    bestShape = shape;
                }
            }
        }
        
        // STEP 3: Convert best shape to placed notes with tone roles
        const finalPlacedNotes = [];
        if (bestShape) {
            for (const pos of bestShape) {
                const toneRole = QuartalEngine.getToneRole(pos.midiNote, this.state.root, this.state.type, this.state.scale);
                finalPlacedNotes.push({
                    stringIndex: pos.stringIndex,
                    fret: pos.fret,
                    midiNote: pos.midiNote,
                    pitchClass: pos.pitchClass,
                    toneRole: toneRole,
                    inversionIndex: inversionIndex
                });
            }
        }
        
        return finalPlacedNotes;
        
        // STEP 4: CLOSED-POSITION CHECK - If shape is too wide, try to compact it
        if (placedNotes.length > 0) {
            const frets = placedNotes.map(n => n.fret);
            const minFret = Math.min(...frets);
            const maxFret = Math.max(...frets);
            const span = maxFret - minFret;
            
            if (span > this.MAX_FRET_SPAN) {
                // Try to find a more compact version
                const avgFret = (minFret + maxFret) / 2;
                const clampedMinFret = Math.max(this.startFret, Math.floor(avgFret) - 2);
                const clampedMaxFret = Math.min(this.endFret, Math.floor(avgFret) + 2);
                
                const repositionedNotes = [];
                
                for (const note of placedNotes) {
                    const targetPitchClass = note.pitchClass;
                    let bestFret = null;
                    let bestMidi = null;
                    let minDistance = Infinity;
                    
                    // Search within clamped range on the same string
                    for (let fret = clampedMinFret; fret <= clampedMaxFret; fret++) {
                        const midiNote = QuartalEngine.getMidiNote(note.stringIndex, fret);
                        const pitchClass = QuartalEngine.getPitchClass(midiNote);
                        
                        if (pitchClass === targetPitchClass) {
                            const distance = Math.abs(fret - avgFret);
                            if (distance < minDistance) {
                                minDistance = distance;
                                bestFret = fret;
                                bestMidi = midiNote;
                            }
                        }
                    }
                    
                    if (bestFret !== null && bestMidi !== null) {
                        const toneRole = QuartalEngine.getToneRole(bestMidi, this.state.root, this.state.type, this.state.scale);
                        repositionedNotes.push({
                            stringIndex: note.stringIndex,
                            fret: bestFret,
                            midiNote: bestMidi,
                            pitchClass: targetPitchClass,
                            toneRole: toneRole,
                            inversionIndex: inversionIndex
                        });
                    } else {
                        // Keep original if no compact position found
                        repositionedNotes.push(note);
                    }
                }
                
                // Only replace if we successfully repositioned all notes
                if (repositionedNotes.length === placedNotes.length) {
                    const newFrets = repositionedNotes.map(n => n.fret);
                    const newSpan = Math.max(...newFrets) - Math.min(...newFrets);
                    if (newSpan <= this.MAX_FRET_SPAN) {
                        placedNotes.length = 0;
                        placedNotes.push(...repositionedNotes);
                    }
                }
            }
        }
        
        return placedNotes;
    },
    
    /**
     * Update note positions on fretboard
     * Uses position-first anchoring with comprehensive position collection (like Triad Atlas)
     */
    updateNotes() {
        const notesGroup = document.getElementById('notes-group');
        if (!notesGroup) return;
        
        // Clear existing notes
        notesGroup.innerHTML = '';
        
        const quartalTones = QuartalEngine.getQuartalTones(this.state.root, this.state.type, this.state.scale);
        const stringSetIndices = QuartalEngine.getStringSetIndices(this.state.stringSet);
        
        // Determine anchor position (position-first anchoring)
        // Use position from string set if specified, otherwise default or LFV
        let anchorFret = QuartalEngine.getAnchorFretForPosition(this.state.stringSet);
        if (this.state.lfvActive) {
            anchorFret = Math.floor((this.state.lfvMinFret + this.state.lfvMaxFret) / 2);
        }
        const anchorStringIndex = stringSetIndices[Math.floor(stringSetIndices.length / 2)];
        
        // Show single inversion (one at a time)
        const invertedTones = QuartalEngine.applyInversion(quartalTones, this.state.inversion);
        const placedNotes = this.placeInversionNotes(invertedTones, stringSetIndices, anchorFret, anchorStringIndex, this.state.inversion);
        
        // Get top note info for current inversion
        const topNoteIndex = QuartalEngine.getTopNoteIndex(invertedTones, this.state.inversion);
        const topNotePitchClass = invertedTones[topNoteIndex] % 12;
        
        // Render all placed notes
        for (const note of placedNotes) {
            const isTopNote = note.pitchClass === topNotePitchClass;
            
            // Visibility filter
            const isVisible = !this.state.showTargetNoteOnly || isTopNote;
            if (!isVisible) continue;
            
            const x = this.nutWidth + note.fret * this.fretWidth;
            const y = note.stringIndex * this.stringSpacing + this.stringSpacing / 2;
            
            // Note circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', `note-marker note-${note.toneRole}`);
            if (isTopNote) {
                circle.classList.add('note-top');
            }
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 12);
            notesGroup.appendChild(circle);
            
            // Top note ring
            if (isTopNote) {
                const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                ring.setAttribute('class', 'note-top-ring');
                ring.setAttribute('cx', x);
                ring.setAttribute('cy', y);
                ring.setAttribute('r', 15);
                ring.setAttribute('fill', 'none');
                notesGroup.appendChild(ring);
            }
            
            // Note label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'note-text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.textContent = QuartalEngine.getNoteName(note.midiNote);
            notesGroup.appendChild(text);
        }
    },
    
    /**
     * Update info panel
     */
    updateInfo() {
        const infoEl = document.getElementById('quartalInfo');
        if (!infoEl) return;
        
        const quartalTones = QuartalEngine.getQuartalTones(this.state.root, this.state.type, this.state.scale);
        const rootName = QuartalEngine.getNoteName(QuartalEngine.tuning[0] + this.state.root);
        const inversionNames = ['Root Position', '1st Inversion', '2nd Inversion', '3rd Inversion'];
        
        let typeLabel = this.state.type;
        if (this.state.type === 'diatonic') {
            typeLabel = `${this.state.type} (${this.state.scale})`;
        }
        
        let info = `<strong>Quartal Voicing:</strong> ${rootName} (${typeLabel})<br>`;
        info += `<strong>Inversion:</strong> ${inversionNames[this.state.inversion]} (${this.state.inversion + 1} of 4)<br>`;
        info += `<strong>String Set:</strong> ${this.state.stringSet}<br>`;
        info += `<strong>Tones:</strong> `;
        
        const toneNames = quartalTones.map(pc => QuartalEngine.getNoteName(QuartalEngine.tuning[0] + pc));
        info += toneNames.join(' - ');
        
        infoEl.innerHTML = info;
        
        // LFV message
        const lfvMessage = document.getElementById('lfvMessage');
        if (lfvMessage) {
            if (this.state.lfvActive) {
                lfvMessage.style.display = 'block';
                lfvMessage.textContent = `Limited View: Frets ${this.state.lfvMinFret}–${this.state.lfvMaxFret} only`;
            } else {
                lfvMessage.style.display = 'none';
            }
        }
    },
    
    /**
     * Export fretboard as PNG
     */
    exportFretboardPNG() {
        const svg = document.querySelector('.fretboard-svg');
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `quartal-atlas-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UIController.init());
} else {
    UIController.init();
}

