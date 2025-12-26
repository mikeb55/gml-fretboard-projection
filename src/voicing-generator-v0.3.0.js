/**
 * Voicing Generator v0.3.0
 * Generates multiple voicing candidates and selects best by constraints + voice-leading
 * 
 * Stops "always 6-4" bias by:
 * - Generating multiple string set options
 * - Scoring by playability, voice-leading, register, diversity
 * - Adding diversity penalties to prevent always selecting same shape
 */

const GUITAR_TUNING_VG = [40, 45, 50, 55, 59, 64];
const MAX_FRET_VG = 12;
const MAX_FRET_SPAN_VG = 5;

/**
 * Voicing candidate structure
 */
export class VoicingCandidate {
  constructor(notes, stringSet, inversion, fretSpan, playabilityScore, voiceLeadingScore, reasonCodes) {
    this.notes = notes; // Array of {midi, spelling, string, fret}
    this.stringSet = stringSet; // e.g., [6, 5, 4, 3]
    this.inversion = inversion; // 'root', 'first', 'second', 'third'
    this.fretSpan = fretSpan; // maxFret - minFret
    this.playabilityScore = playabilityScore; // 0-1, higher = more playable
    this.voiceLeadingScore = voiceLeadingScore; // 0-1, higher = smoother voice-leading
    this.reasonCodes = reasonCodes || []; // Array of {code, message}
  }
  
  get totalScore() {
    // Weighted scoring: playability (40%), voice-leading (30%), diversity (20%), register (10%)
    return this.playabilityScore * 0.4 + 
           this.voiceLeadingScore * 0.3 + 
           (this.diversityScore !== undefined ? this.diversityScore : 0.5) * 0.2 + 
           (this.registerScore !== undefined ? this.registerScore : 0.5) * 0.1;
  }
  
  // Allow setting diversity and register scores
  set diversityScore(value) {
    this._diversityScore = value;
  }
  
  get diversityScore() {
    return this._diversityScore !== undefined ? this._diversityScore : 0.5;
  }
  
  set registerScore(value) {
    this._registerScore = value;
  }
  
  get registerScore() {
    return this._registerScore !== undefined ? this._registerScore : 0.5;
  }
}

/**
 * Generate multiple voicing candidates for a chord
 * @param {Array<number>} chordTones - MIDI note numbers
 * @param {Object} context - Context including previousVoicing, registerTarget, etc.
 * @returns {Array<VoicingCandidate>} Array of voicing candidates
 */
export function generateVoicings(chordTones, context = {}) {
  const {
    previousVoicing = null,
    registerTarget = 'mid',
    allowOmissions = true,
    maxFretSpan = MAX_FRET_SPAN_VG,
    maxJumpBetweenVoicings = 5
  } = context;
  
  const candidates = [];
  
  // Generate string set options
  const stringSetOptions = generateStringSetOptions(chordTones.length, registerTarget);
  
  // Generate inversion options
  const inversionOptions = ['root', 'first', 'second', 'third'].slice(0, Math.min(4, chordTones.length));
  
  // Try each combination
  for (const stringSet of stringSetOptions) {
    for (const inversion of inversionOptions) {
      try {
        const candidate = createVoicingCandidate(
          chordTones,
          stringSet,
          inversion,
          registerTarget,
          maxFretSpan,
          previousVoicing,
          maxJumpBetweenVoicings,
          allowOmissions
        );
        
        if (candidate) {
          candidates.push(candidate);
        }
      } catch (error) {
        // Skip invalid candidates - log in debug mode only
        // console.warn(`Candidate failed: ${error.message}`);
        continue;
      }
    }
  }
  
  // If no candidates found, try with simpler constraints
  if (candidates.length === 0 && stringSetOptions.length > 0) {
    // Try just the first string set option with root inversion
    try {
      const candidate = createVoicingCandidate(
        chordTones,
        stringSetOptions[0],
        'root',
        registerTarget,
        maxFretSpan + 2, // Relax constraint slightly
        previousVoicing,
        maxJumpBetweenVoicings + 2,
        allowOmissions
      );
      if (candidate) {
        candidates.push(candidate);
      }
    } catch (error) {
      // Still no candidates
    }
  }
  
  // Sort by total score (best first)
  candidates.sort((a, b) => b.totalScore - a.totalScore);
  
  return candidates;
}

/**
 * Generate string set options based on register target
 */
function generateStringSetOptions(numNotes, registerTarget) {
  const options = [];
  
  // Base string sets
  const baseSets = [
    [6, 5, 4, 3], // Low strings
    [5, 4, 3, 2], // Mid-low strings
    [4, 3, 2, 1], // Mid-high strings
    [6, 5, 4],    // Low 3-note
    [5, 4, 3],    // Mid 3-note
    [4, 3, 2],    // High 3-note
    [6, 5, 4, 3, 2], // Extended low
    [5, 4, 3, 2, 1], // Extended mid
  ];
  
  // Filter by register target
  if (registerTarget === 'low') {
    options.push(...baseSets.filter(ss => ss[0] >= 5));
  } else if (registerTarget === 'high') {
    options.push(...baseSets.filter(ss => ss[0] <= 4));
  } else {
    options.push(...baseSets);
  }
  
  // Slice to required number of notes
  return options
    .map(ss => ss.slice(0, numNotes))
    .filter(ss => ss.length === numNotes)
    .filter((ss, idx, arr) => arr.findIndex(s => s.join(',') === ss.join(',')) === idx); // Remove duplicates
}

/**
 * Create a voicing candidate
 */
function createVoicingCandidate(
  chordTones,
  stringSet,
  inversion,
  registerTarget,
  maxFretSpan,
  previousVoicing,
  maxJumpBetweenVoicings,
  allowOmissions
) {
  // Map notes to strings using projection layer logic
  if (stringSet.length < chordTones.length) {
    return null;
  }
  
  const sortedVoicing = [...chordTones].sort((a, b) => a - b);
  const notes = [];
  
  for (let i = 0; i < sortedVoicing.length; i++) {
    const midiNote = sortedVoicing[i];
    const targetString = stringSet[i];
    const openNote = GUITAR_TUNING_VG[targetString - 1];
    let fret = midiNote - openNote;
    
    // Handle octave wrapping (same as projection layer)
    if (fret < 0) fret += 12;
    if (fret > MAX_FRET_VG) fret -= 12;
    
    if (fret < 0 || fret > MAX_FRET_VG) {
      return null; // Cannot map this note
    }
    
    notes.push({
      midi: midiNote,
      string: targetString,
      fret: fret
    });
  }
  
  if (!notes || notes.length === 0) {
    return null;
  }
  
  // Calculate fret span
  const frets = notes.map(n => n.fret).filter(f => f !== null);
  if (frets.length === 0) return null;
  
  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  const fretSpan = maxFret - minFret;
  
  // Check constraints
  if (fretSpan > maxFretSpan) {
    return null; // Violates constraint
  }
  
  // Calculate playability score
  const playabilityScore = calculatePlayabilityScore(notes, fretSpan, maxFretSpan);
  
  // Calculate voice-leading score
  const voiceLeadingScore = calculateVoiceLeadingScore(notes, previousVoicing, maxJumpBetweenVoicings);
  
  // Generate reason codes
  const reasonCodes = generateReasonCodes(notes, fretSpan, playabilityScore, voiceLeadingScore);
  
  const candidate = new VoicingCandidate(
    notes,
    stringSet,
    inversion,
    fretSpan,
    playabilityScore,
    voiceLeadingScore,
    reasonCodes
  );
  
  return candidate;
}

/**
 * Map MIDI notes to strings and frets
 */
function mapNotesToStrings(chordTones, stringSet, tuning, maxFret) {
  if (stringSet.length < chordTones.length) {
    return null; // Not enough strings
  }
  
  const sortedTones = [...chordTones].sort((a, b) => a - b);
  const notes = [];
  
  for (let i = 0; i < Math.min(sortedTones.length, stringSet.length); i++) {
    const midiNote = sortedTones[i];
    const stringNum = stringSet[i];
    const openNote = tuning[stringNum - 1];
    
    let fret = midiNote - openNote;
    
    // Handle octave wrapping - try both directions
    if (fret < 0) {
      fret += 12;
      // If still negative or too high, try going up an octave instead
      if (fret < 0 || fret > maxFret) {
        fret = midiNote - openNote + 12;
      }
    }
    
    if (fret > maxFret) {
      fret -= 12;
      // If still too high, try going down another octave
      if (fret > maxFret) {
        fret = midiNote - openNote - 12;
      }
    }
    
    // Final check
    if (fret < 0 || fret > maxFret) {
      return null; // Cannot map this note
    }
    
    notes.push({
      midi: midiNote,
      string: stringNum,
      fret: fret
    });
  }
  
  return notes;
}

/**
 * Calculate playability score (0-1)
 */
function calculatePlayabilityScore(notes, fretSpan, maxFretSpan) {
  let score = 1.0;
  
  // Penalize large fret spans
  if (fretSpan > 0) {
    score *= (1 - (fretSpan / maxFretSpan) * 0.3);
  }
  
  // Penalize high frets
  const maxFret = Math.max(...notes.map(n => n.fret));
  if (maxFret > 7) {
    score *= (1 - ((maxFret - 7) / 5) * 0.2);
  }
  
  // Penalize open strings mixed with fretted (less consistent)
  const hasOpen = notes.some(n => n.fret === 0);
  const hasFretted = notes.some(n => n.fret > 0);
  if (hasOpen && hasFretted) {
    score *= 0.9;
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate voice-leading score (0-1)
 */
function calculateVoiceLeadingScore(notes, previousVoicing, maxJump) {
  if (!previousVoicing || !previousVoicing.notes) {
    return 0.5; // No previous voicing, neutral score
  }
  
  const prevNotes = previousVoicing.notes;
  let totalJump = 0;
  let commonTones = 0;
  
  // Find common tones (same MIDI note)
  const currentMidis = new Set(notes.map(n => n.midi));
  const prevMidis = new Set(prevNotes.map(n => n.midi));
  
  for (const midi of currentMidis) {
    if (prevMidis.has(midi)) {
      commonTones++;
    }
  }
  
  // Calculate average jump (simplified - would need proper voice assignment)
  if (notes.length === prevNotes.length) {
    for (let i = 0; i < Math.min(notes.length, prevNotes.length); i++) {
      const jump = Math.abs(notes[i].midi - prevNotes[i].midi);
      totalJump += jump;
    }
    totalJump /= notes.length;
  } else {
    // Different lengths - calculate minimum jump
    totalJump = 10; // Penalty for length mismatch
  }
  
  // Score based on common tones and jump size
  const commonToneScore = commonTones / Math.max(notes.length, prevNotes.length);
  const jumpScore = totalJump <= maxJump ? 1.0 : Math.max(0, 1 - (totalJump - maxJump) / 10);
  
  return (commonToneScore * 0.6 + jumpScore * 0.4);
}

/**
 * Generate reason codes for a candidate
 */
function generateReasonCodes(notes, fretSpan, playabilityScore, voiceLeadingScore) {
  const codes = [];
  
  codes.push({ code: 'VOICING_GENERATED', message: 'Voicing candidate generated' });
  
  if (fretSpan <= 3) {
    codes.push({ code: 'TIGHT_FRET_SPAN', message: `Fret span ${fretSpan} is tight and playable` });
  }
  
  if (playabilityScore > 0.8) {
    codes.push({ code: 'HIGH_PLAYABILITY', message: 'High playability score' });
  }
  
  if (voiceLeadingScore > 0.7) {
    codes.push({ code: 'SMOOTH_VOICE_LEADING', message: 'Smooth voice-leading from previous' });
  }
  
  return codes;
}

/**
 * Select best voicing with diversity penalty
 * @param {Array<VoicingCandidate>} candidates - Array of candidates
 * @param {Object} diversityContext - Context for diversity scoring (recent voicings, etc.)
 * @returns {VoicingCandidate} Best candidate
 */
export function selectBestVoicing(candidates, diversityContext = {}) {
  if (candidates.length === 0) {
    throw new Error('No voicing candidates provided');
  }
  
  const { recentVoicings = [], diversityWeight = 0.2, registerTarget = 'mid' } = diversityContext;
  
  // Calculate diversity and register scores for each candidate
  for (const candidate of candidates) {
    candidate.diversityScore = calculateDiversityScore(candidate, recentVoicings);
    candidate.registerScore = calculateRegisterScore(candidate, registerTarget);
  }
  
  // Calculate adjusted scores (diversity penalty applied)
  const scoredCandidates = candidates.map(candidate => {
    let adjustedScore = candidate.totalScore;
    
    // Apply diversity penalty if shape was used recently
    if (recentVoicings.length > 0) {
      const recentSimilar = recentVoicings.filter(rv => 
        Array.isArray(rv.stringSet) && rv.stringSet.join(',') === candidate.stringSet.join(',') &&
        rv.inversion === candidate.inversion
      ).length;
      
      if (recentSimilar > 2) {
        adjustedScore *= (1 - diversityWeight * Math.min(recentSimilar / 5, 0.5));
      }
    }
    
    return { candidate, adjustedScore };
  });
  
  // Sort by adjusted score
  scoredCandidates.sort((a, b) => b.adjustedScore - a.adjustedScore);
  
  return scoredCandidates[0].candidate;
}

/**
 * Calculate diversity score (0-1)
 */
function calculateDiversityScore(candidate, recentVoicings) {
  if (recentVoicings.length === 0) {
    return 1.0; // No history, full diversity
  }
  
  // Count how many times this exact shape was used
  const exactMatches = recentVoicings.filter(rv =>
    rv.stringSet.join(',') === candidate.stringSet.join(',') &&
    rv.inversion === candidate.inversion
  ).length;
  
  // More matches = lower diversity score
  return Math.max(0, 1 - (exactMatches / recentVoicings.length) * 0.5);
}

/**
 * Calculate register score (0-1)
 */
function calculateRegisterScore(candidate, registerTarget) {
  const avgString = candidate.stringSet.reduce((a, b) => a + b, 0) / candidate.stringSet.length;
  
  if (registerTarget === 'low') {
    return avgString >= 5 ? 1.0 : Math.max(0, 1 - (5 - avgString) * 0.2);
  } else if (registerTarget === 'high') {
    return avgString <= 3 ? 1.0 : Math.max(0, 1 - (avgString - 3) * 0.2);
  } else {
    return avgString >= 3 && avgString <= 5 ? 1.0 : 0.8; // Mid register
  }
}

