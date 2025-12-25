/**
 * Quartal Engine Core - Generation Logic
 * Supports all string sets, 3-note and 4-note quartals
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const TUNING = [40, 45, 50, 55, 59, 64]; // EADGBE

// Scale degree mappings
const SCALE_DEGREES = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
};

function getPitchClass(noteName) {
  const sharpIdx = NOTE_NAMES.indexOf(noteName);
  if (sharpIdx >= 0) return sharpIdx;
  return FLAT_NAMES.indexOf(noteName);
}

function getNoteName(pitchClass, useFlats = false) {
  return useFlats ? FLAT_NAMES[pitchClass] : NOTE_NAMES[pitchClass];
}

function getScalePitchClasses(scale, root) {
  const modeMap = {
    'major': 'ionian',
    'minor': 'aeolian',
    'dorian': 'dorian',
    'mixolydian': 'mixolydian',
    'lydian': 'lydian',
    'phrygian': 'phrygian',
    'locrian': 'locrian'
  };
  
  const mode = modeMap[scale.toLowerCase()] || 'ionian';
  const degrees = SCALE_DEGREES[mode];
  const rootPc = getPitchClass(root);
  
  if (rootPc < 0) {
    throw new Error(`Invalid root note: ${root}. Must be a valid note name (C, C#, Db, D, etc.)`);
  }
  
  return degrees.map(deg => (rootPc + deg) % 12);
}

function generateQuartalStack(scalePcs, stackRootIndex, stackType) {
  const n = stackRootIndex;
  const n3 = (n + 3) % 7;
  const n6 = (n + 6) % 7;
  const n9 = (n + 9) % 7;
  
  if (stackType === '3-note') {
    return [scalePcs[n], scalePcs[n3], scalePcs[n6]];
  } else {
    return [scalePcs[n], scalePcs[n3], scalePcs[n6], scalePcs[n9]];
  }
}

/**
 * Find all possible guitar positions for a pitch class on a given string
 * Returns array of { fret, midiNote, stringIndex }
 */
function findAllPositions(pitchClass, stringIndex, minFret = 0, maxFret = 24) {
  const positions = [];
  const openNote = TUNING[stringIndex] % 12;
  
  for (let fret = minFret; fret <= maxFret; fret++) {
    const note = (openNote + fret) % 12;
    if (note === pitchClass) {
      positions.push({
        fret,
        midiNote: TUNING[stringIndex] + fret,
        stringIndex
      });
    }
  }
  
  return positions;
}

/**
 * Find best compact position for a quartal stack on given string set
 * With voice-leading: minimizes leaps from previous positions
 * Returns array of { fret, midiNote, stringIndex, pitchClass } for each voice
 */
function findBestPosition(stack, stringSet, anchorFret = 5, previousPositions = null) {
  const MAX_FRET_SPAN = 5;
  const minFret = Math.max(0, anchorFret - Math.floor(MAX_FRET_SPAN / 2));
  const maxFret = Math.min(24, anchorFret + Math.ceil(MAX_FRET_SPAN / 2));
  
  // Find all possible positions for each pitch class on its assigned string
  const allPositions = stack.map((pitchClass, voiceIndex) => {
    const stringIndex = stringSet[voiceIndex];
    return findAllPositions(pitchClass, stringIndex, minFret, maxFret);
  });
  
  // If any voice has no positions, try expanding the range
  if (allPositions.some(positions => positions.length === 0)) {
    // Expand search range
    const expandedMinFret = Math.max(0, anchorFret - MAX_FRET_SPAN);
    const expandedMaxFret = Math.min(24, anchorFret + MAX_FRET_SPAN);
    
    for (let i = 0; i < allPositions.length; i++) {
      if (allPositions[i].length === 0) {
        const stringIndex = stringSet[i];
        allPositions[i] = findAllPositions(stack[i], stringIndex, expandedMinFret, expandedMaxFret);
      }
    }
  }
  
  // Find the best combination that fits within MAX_FRET_SPAN
  let bestCombination = null;
  let bestScore = Infinity;
  
  // Try all combinations (brute force for small sets)
  function tryCombinations(voiceIndex, currentCombination) {
    if (voiceIndex >= stack.length) {
      // Check if this combination fits within MAX_FRET_SPAN
      const frets = currentCombination.map(p => p.fret);
      const minF = Math.min(...frets);
      const maxF = Math.max(...frets);
      const span = maxF - minF;
      
      if (span <= MAX_FRET_SPAN) {
        // Calculate base score (prefer positions closer to anchorFret)
        const avgDistance = frets.reduce((sum, f) => sum + Math.abs(f - anchorFret), 0) / frets.length;
        let score = span * 100 + avgDistance; // Prioritize smaller span, then closer to anchor
        
        // Voice-leading: minimize leaps from previous positions
        if (previousPositions && previousPositions.length === currentCombination.length) {
          let totalLeap = 0;
          let largeLeaps = 0;
          let commonTones = 0;
          
          // Match voices by position in stack (top to bottom)
          for (let i = 0; i < currentCombination.length; i++) {
            const prevPos = previousPositions[i];
            const currPos = currentCombination[i];
            
            if (prevPos && currPos) {
              // Calculate fret distance (considering string changes)
              const fretDistance = Math.abs(currPos.fret - prevPos.fret);
              
              // Bonus for same string (smooth voice-leading)
              if (currPos.stringIndex === prevPos.stringIndex) {
                score -= 5; // Small bonus for staying on same string
              }
              
              // Bonus for common tones (same pitch class)
              if (currPos.pitchClass === prevPos.pitchClass) {
                commonTones++;
                score -= 20; // Strong bonus for common tones
              }
              
              totalLeap += fretDistance;
              
              // Penalize large leaps (> 5 frets)
              if (fretDistance > 5) {
                largeLeaps++;
                score += fretDistance * 10; // Heavy penalty for large leaps
              } else {
                // Small penalty for any movement (prefer minimal motion)
                score += fretDistance * 0.5;
              }
            }
          }
          
          // Additional penalty for too many large leaps
          if (largeLeaps > 0) {
            score += largeLeaps * 50;
          }
        }
        
        if (score < bestScore) {
          bestScore = score;
          bestCombination = [...currentCombination];
        }
      }
      return;
    }
    
    // Try each position for this voice
    for (const position of allPositions[voiceIndex]) {
      currentCombination.push({
        ...position,
        pitchClass: stack[voiceIndex] // Always set pitchClass from stack
      });
      tryCombinations(voiceIndex + 1, currentCombination);
      currentCombination.pop();
    }
  }
  
  tryCombinations(0, []);
  
  // If no combination found, use the closest positions to anchorFret
  if (!bestCombination) {
    bestCombination = allPositions.map((positions, voiceIndex) => {
      if (positions.length === 0) {
        // Fallback: find position on any string
        const pitchClass = stack[voiceIndex];
        for (let s = 0; s < 6; s++) {
          const pos = findAllPositions(pitchClass, s, 0, 24);
          if (pos.length > 0) {
            // Find closest to anchorFret
            pos.sort((a, b) => Math.abs(a.fret - anchorFret) - Math.abs(b.fret - anchorFret));
            return { ...pos[0], stringIndex: s, pitchClass };
          }
        }
        // CRITICAL: If still no position found, create a fallback position
        // This should never happen, but ensures we always return a position
        return { fret: anchorFret, midiNote: TUNING[stringSet[voiceIndex]] + anchorFret, stringIndex: stringSet[voiceIndex], pitchClass };
      }
      
      // Find closest to anchorFret
      positions.sort((a, b) => Math.abs(a.fret - anchorFret) - Math.abs(b.fret - anchorFret));
      const pos = positions[0];
      return { ...pos, pitchClass: stack[voiceIndex] }; // Always set pitchClass from stack
    });
  }
  
  // CRITICAL FIX: Ensure we always return exactly stack.length positions
  if (!bestCombination || bestCombination.length < stack.length) {
    // Rebuild to ensure we have all positions
    const guaranteedPositions = [];
    for (let i = 0; i < stack.length; i++) {
      const pitchClass = stack[i];
      const stringIndex = stringSet[i];
      const pos = findAllPositions(pitchClass, stringIndex, 0, 24);
      if (pos.length > 0) {
        pos.sort((a, b) => Math.abs(a.fret - anchorFret) - Math.abs(b.fret - anchorFret));
        guaranteedPositions.push({ ...pos[0], pitchClass });
      } else {
        // Find on any string
        for (let s = 0; s < 6; s++) {
          const pos = findAllPositions(pitchClass, s, 0, 24);
          if (pos.length > 0) {
            pos.sort((a, b) => Math.abs(a.fret - anchorFret) - Math.abs(b.fret - anchorFret));
            guaranteedPositions.push({ ...pos[0], stringIndex: s, pitchClass });
            break;
          }
        }
      }
    }
    return guaranteedPositions;
  }
  
  return bestCombination;
}

/**
 * Calculate note duration parameters and chords per bar
 * Returns: { divisions, noteDuration, noteType, chordsPerBar }
 */
function calculateNoteDurationParams(noteValue) {
  let divisions, noteDuration, noteType, chordsPerBar;
  
  if (noteValue === 'whole') {
    divisions = 1;
    noteDuration = 4; // Whole note = 4 quarter notes = 4 divisions
    noteType = 'whole';
    chordsPerBar = 1; // 1 whole note per bar
  } else if (noteValue === 'half') {
    divisions = 1;
    noteDuration = 2; // Half note = 2 quarter notes = 2 divisions
    noteType = 'half';
    chordsPerBar = 2; // 2 half notes per bar
  } else if (noteValue === 'quarter') {
    divisions = 1;
    noteDuration = 1; // Quarter note = 1 division
    noteType = 'quarter';
    chordsPerBar = 4; // 4 quarter notes per bar
  } else if (noteValue === 'eighth') {
    divisions = 2; // 2 divisions per quarter note (for eighth notes)
    noteDuration = 1; // Eighth note = 1 division (when divisions=2)
    noteType = 'eighth';
    chordsPerBar = 8; // 8 eighth notes per bar
  } else if (noteValue === 'sixteenth' || noteValue === '16th') {
    divisions = 4; // 4 divisions per quarter note (for sixteenth notes)
    noteDuration = 1; // Sixteenth note = 1 division (when divisions=4)
    noteType = '16th';
    chordsPerBar = 16; // 16 sixteenth notes per bar
  } else {
    // Default to quarter
    divisions = 1;
    noteDuration = 1;
    noteType = 'quarter';
    chordsPerBar = 4;
  }
  
  return { divisions, noteDuration, noteType, chordsPerBar };
}

/**
 * Generate MusicXML for multi-scale progression
 */
function generateMultiScaleMusicXML(params) {
  const { segments, bars, stackType, noteValue, stringSet, tempo = 108 } = params;
  
  // Calculate divisions and note type
  const { divisions, noteDuration, noteType, chordsPerBar } = calculateNoteDurationParams(noteValue);
  
  // Determine string set
  let finalStringSet;
  if (stringSet && Array.isArray(stringSet)) {
    finalStringSet = stringSet;
  } else {
    if (stackType === '3-note') {
      finalStringSet = [5, 4, 3];
    } else {
      finalStringSet = [5, 4, 3, 2];
    }
  }
  
  // Build scale map: which scale to use for each bar
  const barToScale = [];
  for (const segment of segments) {
    for (let i = 0; i < segment.bars; i++) {
      const barIndex = segment.startBar + i;
      barToScale[barIndex] = {
        root: segment.root,
        scale: segment.scale,
        scalePcs: getScalePitchClasses(segment.scale, segment.root)
      };
    }
  }
  
  // Generate stacks for each bar using its assigned scale
  // We need to generate stacks for each chord position (chordsPerBar * bars)
  const allStacks = [];
  const allScaleInfos = [];
  for (let bar = 0; bar < bars; bar++) {
    const scaleInfo = barToScale[bar];
    if (!scaleInfo) {
      // Fallback to last scale if bar not assigned
      const lastSegment = segments[segments.length - 1];
      scaleInfo = {
        root: lastSegment.root,
        scale: lastSegment.scale,
        scalePcs: getScalePitchClasses(lastSegment.scale, lastSegment.root)
      };
    }
    // Generate chordsPerBar stacks for this bar, cycling through scale degrees
    for (let chordInBar = 0; chordInBar < chordsPerBar; chordInBar++) {
      const stackRootIndex = (bar * chordsPerBar + chordInBar) % 7;
      const stack = generateQuartalStack(scaleInfo.scalePcs, stackRootIndex, stackType);
      allStacks.push(stack);
      allScaleInfos.push(scaleInfo);
    }
  }
  
  // Generate XML (same structure as single-scale)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Guitar</part-name>
    </score-part>
  </part-list>
  <part id="P1">`;
  
  let previousPositions = null;
  let stackIndex = 0;
  
  for (let bar = 0; bar < bars; bar++) {
    xml += `
    <measure number="${bar + 1}">`;
    if (bar === 0) {
      xml += `
      <attributes>
        <divisions>${divisions}</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction>
        <sound tempo="${tempo}"/>
      </direction>`;
    }
    
    // Generate chordsPerBar chords in this measure
    for (let chordInBar = 0; chordInBar < chordsPerBar; chordInBar++) {
      const stack = allStacks[stackIndex];
      const scaleInfo = allScaleInfos[stackIndex];
      
      // Find best position with voice-leading
      const anchorFret = previousPositions 
        ? Math.round(previousPositions.reduce((sum, p) => sum + p.fret, 0) / previousPositions.length)
        : 5 + (bar * 2);
      const positions = findBestPosition(stack, finalStringSet, anchorFret, previousPositions);
      
      if (!positions || positions.length !== stack.length) {
        throw new Error(`findBestPosition returned ${positions ? positions.length : 0} positions, expected ${stack.length}`);
      }
      
      positions.sort((a, b) => b.stringIndex - a.stringIndex);
      
      // Generate notes for this chord
      for (let voice = 0; voice < stack.length; voice++) {
        const position = positions[voice];
        if (position) {
          const midiNote = position.midiNote;
          const octave = Math.floor(midiNote / 12) - 1;
          const pitchClass = (position.pitchClass !== undefined && position.pitchClass >= 0) ? position.pitchClass : stack[voice];
          if (pitchClass < 0 || pitchClass > 11) {
            throw new Error(`Invalid pitchClass ${pitchClass} for voice ${voice}`);
          }
          const noteName = getNoteName(pitchClass, scaleInfo.scale === 'dorian' || scaleInfo.scale === 'minor');
          if (!noteName) {
            throw new Error(`getNoteName returned undefined for pitchClass ${pitchClass}`);
          }
          const step = noteName.replace(/[#b]/, '');
          const alter = noteName.includes('#') ? 1 : (noteName.includes('b') ? -1 : null);
          
          if (voice > 0) {
            xml += `
      <note>
        <chord/>`;
          } else {
            xml += `
      <note>`;
          }
          xml += `
        <pitch>
          <step>${step}</step>`;
          if (alter !== null) {
            xml += `
          <alter>${alter}</alter>`;
          }
          xml += `
          <octave>${octave}</octave>
        </pitch>
        <duration>${noteDuration}</duration>
        <type>${noteType}</type>
        <voice>1</voice>
      </note>`;
        }
      }
      
      // Update previous positions for voice-leading in next chord
      previousPositions = positions.map(p => ({ ...p }));
      stackIndex++;
    }
    
    xml += `
    </measure>`;
  }
  
  xml += `
  </part>
</score-partwise>`;
  
  return xml;
}

function generateMusicXML(params) {
  // Handle multi-scale commands
  if (params.multiScale && params.segments) {
    return generateMultiScaleMusicXML(params);
  }
  
  // Single scale (original logic)
  const { root, scale, stackType, bars, noteValue, stringSet, tempo = 108 } = params;
  const scalePcs = getScalePitchClasses(scale, root);
  
  // Calculate divisions and note type based on note value
  const { divisions, noteDuration, noteType, chordsPerBar } = calculateNoteDurationParams(noteValue);
  
  // Determine string set
  let finalStringSet;
  if (stringSet && Array.isArray(stringSet)) {
    finalStringSet = stringSet;
  } else {
    // Default string sets
    if (stackType === '3-note') {
      finalStringSet = [5, 4, 3]; // 6-5-4
    } else {
      finalStringSet = [5, 4, 3, 2]; // 6-5-4-3
    }
  }
  
  // Generate stacks for all chords (chordsPerBar * bars)
  const allStacks = [];
  for (let bar = 0; bar < bars; bar++) {
    for (let chordInBar = 0; chordInBar < chordsPerBar; chordInBar++) {
      const stackRootIndex = (bar * chordsPerBar + chordInBar) % 7;
      const stack = generateQuartalStack(scalePcs, stackRootIndex, stackType);
      allStacks.push(stack);
    }
  }
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Guitar</part-name>
    </score-part>
  </part-list>
  <part id="P1">`;
  
  // Track previous positions for voice-leading
  let previousPositions = null;
  let stackIndex = 0;
  
  for (let bar = 0; bar < bars; bar++) {
    xml += `
    <measure number="${bar + 1}">`;
    // Attributes only in first measure (or when they change)
    if (bar === 0) {
      xml += `
      <attributes>
        <divisions>${divisions}</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction>
        <sound tempo="${tempo}"/>
      </direction>`;
    }
    
    // Generate chordsPerBar chords in this measure
    for (let chordInBar = 0; chordInBar < chordsPerBar; chordInBar++) {
      const stack = allStacks[stackIndex];
      
      // Find best position for this stack with voice-leading
      // Use previous positions to minimize leaps
      const anchorFret = previousPositions 
        ? Math.round(previousPositions.reduce((sum, p) => sum + p.fret, 0) / previousPositions.length)
        : 5 + (bar * 2); // First chord: slight position shift per bar
      const positions = findBestPosition(stack, finalStringSet, anchorFret, previousPositions);
      
      // CRITICAL: Ensure we have exactly stack.length positions
      if (!positions || positions.length !== stack.length) {
        throw new Error(`findBestPosition returned ${positions ? positions.length : 0} positions, expected ${stack.length}`);
      }
      
      // Sort positions by string index (lowest to highest)
      positions.sort((a, b) => b.stringIndex - a.stringIndex);
      
      // Generate notes for ALL positions - we know positions.length === stack.length
      // CRITICAL: All notes must be in the same voice with <chord/> tags to play simultaneously
      // IMPORTANT: <chord/> must be on the same line as <note> for proper MusicXML parsing
      for (let voice = 0; voice < stack.length; voice++) {
        const position = positions[voice];
        if (position) {
          const midiNote = position.midiNote;
          const octave = Math.floor(midiNote / 12) - 1;
          // Ensure pitchClass is set - use from position or from stack
          const pitchClass = (position.pitchClass !== undefined && position.pitchClass >= 0) ? position.pitchClass : stack[voice];
          if (pitchClass < 0 || pitchClass > 11) {
            throw new Error(`Invalid pitchClass ${pitchClass} for voice ${voice}, stack: ${JSON.stringify(stack)}`);
          }
          const noteName = getNoteName(pitchClass, scale === 'dorian' || scale === 'minor');
          if (!noteName) {
            throw new Error(`getNoteName returned undefined for pitchClass ${pitchClass}`);
          }
          const step = noteName.replace(/[#b]/, '');
          const alter = noteName.includes('#') ? 1 : (noteName.includes('b') ? -1 : null);
          
          // Add <chord/> tag inline for all notes after the first one
          if (voice > 0) {
            xml += `
      <note>
        <chord/>`;
          } else {
            xml += `
      <note>`;
          }
          xml += `
        <pitch>
          <step>${step}</step>`;
          if (alter !== null) {
            xml += `
          <alter>${alter}</alter>`;
          }
          xml += `
          <octave>${octave}</octave>
        </pitch>
        <duration>${noteDuration}</duration>
        <type>${noteType}</type>
        <voice>1</voice>
      </note>`;
        }
      }
      
      // Update previous positions for voice-leading in next chord
      previousPositions = positions.map(p => ({ ...p }));
      stackIndex++;
    }
    
    xml += `
    </measure>`;
  }
  
  xml += `
  </part>
</score-partwise>`;
  
  return xml;
}

function parseCommand(command) {
  const lower = command.toLowerCase();
  
  // Check for multi-scale commands (up to 5 scales)
  // Patterns: "C major bars 1-4, F lydian bars 5-8" or "C major (4 bars), F lydian (4 bars)"
  const multiScalePatterns = [
    // Pattern 1: "X scale bars N-M, Y scale bars N-M"
    /([A-G][#b]?)\s+(major|minor|dorian|mixolydian|lydian|phrygian|locrian|ionian|aeolian)\s+(?:bars?|bar)\s+(\d+)(?:\s*-\s*(\d+))?/gi,
    // Pattern 2: "X scale (N bars)"
    /([A-G][#b]?)\s+(major|minor|dorian|mixolydian|lydian|phrygian|locrian|ionian|aeolian)\s*\((\d+)\s*bars?\)/gi,
    // Pattern 3: "X scale, Y scale, Z scale - N bars each"
    /([A-G][#b]?)\s+(major|minor|dorian|mixolydian|lydian|phrygian|locrian|ionian|aeolian)/gi
  ];
  
  // Try to detect multi-scale command
  let multiScaleSegments = [];
  let totalBars = 0;
  
  // Try pattern 0a: Semicolon-separated commands "Generate X scale N bars; Generate Y scale N bars; ..."
  if (command.includes(';')) {
    const semicolonCommands = command.split(';').map(c => c.trim()).filter(c => c.length > 0);
    if (semicolonCommands.length > 1) {
      // Pattern to match: "Generate X scale, N bars, ..." or "Generate X scale N bars, ..."
      const semicolonPattern = /(?:generate\s+)?([A-G][#b]?)\s+(?:(?:4-note|four\s+note|4\s+note)\s+)?(major|minor|dorian|mixolydian|lydian|phrygian|locrian|ionian|aeolian)\s+(?:quartals?[,\s]+)?(\d+)\s*(?:bars?|bar)/i;
      let currentBar = 0;
      
      for (const subCmd of semicolonCommands) {
        const match = subCmd.match(semicolonPattern);
        if (match) {
          const root = match[1];
          const scale = match[2].toLowerCase();
          const bars = parseInt(match[3]);
          multiScaleSegments.push({ root, scale, bars, startBar: currentBar });
          currentBar += bars;
          totalBars = currentBar;
        }
      }
    }
  }
  
  // Try pattern 0b: "X scale N bars, then Y scale N bars, then..." (handle "then" separator)
  // Match: root, scale, optional "quartals", number, "bars", then...
  if (multiScaleSegments.length === 0 && lower.includes('then')) {
    const thenPattern = /([A-G][#b]?)\s+(?:(?:4-note|four\s+note|4\s+note)\s+)?(major|minor|dorian|mixolydian|lydian|phrygian|locrian|ionian|aeolian)\s+(?:quartals?\s+)?(\d+)\s*(?:bars?|bar)/gi;
    const thenMatches = [];
    let match;
    while ((match = thenPattern.exec(command)) !== null) {
      thenMatches.push(match);
    }
    
    if (thenMatches.length > 1) {
      let currentBar = 0;
      for (const match of thenMatches) {
        const root = match[1];
        const scale = match[2].toLowerCase();
        const bars = parseInt(match[3]);
        multiScaleSegments.push({ root, scale, bars, startBar: currentBar });
        currentBar += bars;
        totalBars = currentBar;
      }
    }
  }
  
  // Try pattern 1: "X scale bars N-M" (handle "4-note" before or after scale)
  // Match: root, scale, optional "4-note", "bars", numbers
  // OR: root, "4-note", scale, "bars", numbers
  if (multiScaleSegments.length === 0) {
    const pattern1Regex = /([A-G][#b]?)\s+(?:(?:4-note|four\s+note|4\s+note)\s+)?(major|minor|dorian|mixolydian|lydian|phrygian|locrian|ionian|aeolian)\s+(?:4-note|four\s+note|4\s+note)?\s*(?:bars?|bar)\s+(\d+)(?:\s*-\s*(\d+))?/gi;
    const pattern1Matches = [];
    let match;
    while ((match = pattern1Regex.exec(command)) !== null) {
      pattern1Matches.push(match);
    }
    
    if (pattern1Matches.length > 1 && pattern1Matches.length <= 5) {
      for (const match of pattern1Matches) {
        const root = match[1];
        const scale = match[2].toLowerCase();
        const startBar = parseInt(match[3]);
        const endBar = match[4] ? parseInt(match[4]) : startBar;
        const bars = endBar - startBar + 1;
        multiScaleSegments.push({ root, scale, bars, startBar: startBar - 1 }); // 0-indexed
        totalBars = Math.max(totalBars, endBar);
      }
    }
  }
  
  // Try pattern 2: "X scale (N bars)" (handle "4-note" before or after scale)
  if (multiScaleSegments.length === 0) {
    const pattern2Regex = /([A-G][#b]?)\s+(?:(?:4-note|four\s+note|4\s+note)\s+)?(major|minor|dorian|mixolydian|lydian|phrygian|locrian|ionian|aeolian)\s+(?:4-note|four\s+note|4\s+note)?\s*\((\d+)\s*bars?\)/gi;
    const pattern2Matches = [];
    let match;
    while ((match = pattern2Regex.exec(command)) !== null) {
      pattern2Matches.push(match);
    }
    
    if (pattern2Matches.length > 1 && pattern2Matches.length <= 5) {
      let currentBar = 0;
      for (const match of pattern2Matches) {
        const root = match[1];
        const scale = match[2].toLowerCase();
        const bars = parseInt(match[3]);
        multiScaleSegments.push({ root, scale, bars, startBar: currentBar });
        currentBar += bars;
        totalBars = currentBar;
      }
    }
  }
  
  // Try pattern 3: "X scale, Y scale, Z scale - N bars each" (handle up to 6 scales gracefully)
  if (multiScaleSegments.length === 0) {
    const pattern3Matches = [...command.matchAll(/([A-G][#b]?)\s+(?:4-note|four\s+note|4\s+note)?\s*(major|minor|dorian|mixolydian|lydian|phrygian|locrian|ionian|aeolian)/gi)];
    const barsEachMatch = command.match(/(\d+)\s*bars?\s*each/i);
    if (pattern3Matches.length > 1 && pattern3Matches.length <= 6 && barsEachMatch) {
      // Limit to 5 scales max, but handle gracefully
      const maxScales = Math.min(pattern3Matches.length, 5);
      const barsEach = parseInt(barsEachMatch[1]);
      let currentBar = 0;
      for (let i = 0; i < maxScales; i++) {
        const match = pattern3Matches[i];
        const root = match[1];
        const scale = match[2].toLowerCase();
        multiScaleSegments.push({ root, scale, bars: barsEach, startBar: currentBar });
        currentBar += barsEach;
        totalBars = currentBar;
      }
    }
  }
  
  // If multi-scale detected, return segments
  if (multiScaleSegments.length > 1) {
    // Extract common parameters
    const scaleKeywords = ['major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'locrian', 'ionian', 'aeolian'];
    const validNotes = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    
    // Extract stack type
    let stackType = '3-note';
    if (lower.includes('4-note') || lower.includes('four note') || lower.includes('4 note')) stackType = '4-note';
    
    // Extract note value
    let noteValue = 'quarter';
    if (lower.includes('sixteenth') || lower.includes('16th')) noteValue = 'sixteenth';
    else if (lower.includes('eighth') || lower.includes('8th')) noteValue = 'eighth';
    else if (lower.includes('half')) noteValue = 'half';
    else if (lower.includes('whole')) noteValue = 'whole';
    else if (lower.includes('quarter')) noteValue = 'quarter';
    
    // Extract string set (if specified)
    let stringSet = null;
    const stringSetMatch = command.match(/\b(?:strings?|string\s*set)\s*([1-6](?:-[1-6])+)/i);
    if (stringSetMatch) {
      const setStr = stringSetMatch[1];
      stringSet = setStr.split('-').map(s => parseInt(s) - 1).reverse();
    }
    
    // Extract tempo (default 108 bpm)
    let tempo = 108;
    const tempoMatch = command.match(/\b(?:tempo|bpm|at|speed)\s*(\d+)\b/i) || command.match(/\b(\d+)\s*(?:bpm|tempo)\b/i);
    if (tempoMatch) {
      const parsedTempo = parseInt(tempoMatch[1]);
      if (parsedTempo > 0 && parsedTempo <= 300) {
        tempo = parsedTempo;
      }
    }
    
    return { 
      multiScale: true, 
      segments: multiScaleSegments, 
      bars: totalBars, 
      stackType, 
      noteValue, 
      stringSet,
      tempo
    };
  }
  
  // Single scale parsing (original logic)
  const scaleKeywords = ['major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'locrian', 'ionian', 'aeolian'];
  const validNotes = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
  let root = null;
  
  // Try to find root note immediately before scale keyword (most reliable)
  for (const keyword of scaleKeywords) {
    const keywordIndex = lower.indexOf(keyword);
    if (keywordIndex > 0) {
      const beforeKeyword = command.substring(0, keywordIndex).trim();
      // Look for note name patterns: C, C#, Db, etc. - but exclude common words like "a", "the"
      // Match pattern: note name that appears right before the scale keyword
      const rootMatch = beforeKeyword.match(/\b([A-G][#b]?)\s+(?:scale|mode|harmon|quartal|stack)/i);
      if (rootMatch) {
        const candidate = rootMatch[1];
        if (validNotes.includes(candidate) || validNotes.includes(candidate.toUpperCase())) {
          root = candidate;
          break;
        }
      }
      // Also try: note name directly before scale keyword
      const directMatch = beforeKeyword.match(/\b([A-G][#b]?)\s*$/i);
      if (directMatch) {
        const candidate = directMatch[1];
        if (validNotes.includes(candidate) || validNotes.includes(candidate.toUpperCase())) {
          root = candidate;
          break;
        }
      }
    }
  }
  
  // If no root found, look for "X scale" or "X major/minor/etc" pattern
  if (!root) {
    const scalePattern = command.match(/\b([A-G][#b]?)\s+(?:major|minor|dorian|mixolydian|lydian|phrygian|locrian|ionian|aeolian|scale)/i);
    if (scalePattern) {
      const candidate = scalePattern[1];
      if (validNotes.includes(candidate) || validNotes.includes(candidate.toUpperCase())) {
        root = candidate;
      }
    }
  }
  
  // Default to C if still not found
  if (!root) {
    root = 'C';
  }
  
  // Extract scale/mode
  let scale = 'major';
  if (lower.includes('minor') || lower.includes('aeolian')) scale = 'minor';
  else if (lower.includes('dorian')) scale = 'dorian';
  else if (lower.includes('mixolydian')) scale = 'mixolydian';
  else if (lower.includes('lydian')) scale = 'lydian';
  else if (lower.includes('phrygian')) scale = 'phrygian';
  else if (lower.includes('locrian')) scale = 'locrian';
  else if (lower.includes('major') || lower.includes('ionian')) scale = 'major';
  
  // Extract stack type
  let stackType = '3-note';
  if (lower.includes('4-note') || lower.includes('four note') || lower.includes('4 note')) stackType = '4-note';
  
  // Extract bars
  const barMatch = command.match(/\b(\d+)\s*(?:bar|bars|measure|measures)\b/i);
  let bars = barMatch ? parseInt(barMatch[1]) : null;
  
  // If "scale harmonised" or "scale harmonized" is mentioned, default to 7 bars (one per scale degree)
  if (bars === null && (lower.includes('scale harmonis') || lower.includes('harmonise') || lower.includes('harmonize'))) {
    bars = 7; // One bar per scale degree
  }
  
  // Default to 1 bar if not specified
  if (bars === null) {
    bars = 1;
  }
  
  // Extract note value
  let noteValue = 'quarter';
  if (lower.includes('sixteenth') || lower.includes('16th')) noteValue = 'sixteenth';
  else if (lower.includes('eighth') || lower.includes('8th')) noteValue = 'eighth';
  else if (lower.includes('half')) noteValue = 'half';
  else if (lower.includes('whole')) noteValue = 'whole';
  else if (lower.includes('quarter')) noteValue = 'quarter';
  
  // Extract string set (if specified)
  let stringSet = null;
  const stringSetMatch = command.match(/\b(?:strings?|string\s*set)\s*([1-6](?:-[1-6])+)/i);
  if (stringSetMatch) {
    const setStr = stringSetMatch[1];
    stringSet = setStr.split('-').map(s => parseInt(s) - 1).reverse(); // Convert to 0-indexed, reverse for low to high
  }
  
  // Extract tempo (default 108 bpm)
  let tempo = 108;
  const tempoMatch = command.match(/\b(?:tempo|bpm|at|speed)\s*(\d+)\b/i) || command.match(/\b(\d+)\s*(?:bpm|tempo)\b/i);
  if (tempoMatch) {
    const parsedTempo = parseInt(tempoMatch[1]);
    if (parsedTempo > 0 && parsedTempo <= 300) {
      tempo = parsedTempo;
    }
  }
  
  return { root, scale, stackType, bars, noteValue, stringSet, tempo };
}

module.exports = {
  generateMusicXML,
  parseCommand,
  getScalePitchClasses,
  generateQuartalStack,
  findAllPositions,
  findBestPosition
};

