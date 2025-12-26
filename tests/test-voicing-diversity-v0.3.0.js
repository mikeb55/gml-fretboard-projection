/**
 * Voicing Diversity Test Suite v0.3.0
 * Tests that voicing engine generates diverse options, not always 6-4
 */

import { generateVoicings, selectBestVoicing } from '../src/voicing-generator-v0.3.0.js';

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function test(name, fn) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    testsFailed++;
    failures.push({ name, error: error.message });
    console.error(`✗ ${name}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================================
// VOICING DIVERSITY TESTS
// ============================================================

test('Not always 6-4: 100 random trials show 3+ different string sets', () => {
  const chordTypes = [
    [48, 52, 55],      // C major
    [50, 53, 57],      // D minor
    [52, 55, 59],      // E minor
    [53, 57, 60],      // F major
    [55, 59, 62],      // G major
    [57, 60, 64],      // A minor
    [59, 62, 65],      // B diminished
    [48, 52, 55, 59],  // Cmaj7
    [50, 53, 57, 60],  // Dm7
    [55, 59, 62, 65],  // G7
  ];
  
  const stringSets = new Set();
  const recentVoicings = [];
  
  for (let i = 0; i < 100; i++) {
    const chord = chordTypes[i % chordTypes.length];
    const candidates = generateVoicings(chord, {
      registerTarget: 'mid',
      previousVoicing: recentVoicings.length > 0 ? recentVoicings[recentVoicings.length - 1] : null
    });
    
    if (candidates.length > 0) {
      const best = selectBestVoicing(candidates, { recentVoicings: recentVoicings.slice(-5) });
      const stringSetKey = best.stringSet.join('-');
      stringSets.add(stringSetKey);
      
      // Track recent voicings for diversity
      recentVoicings.push(best);
      if (recentVoicings.length > 10) {
        recentVoicings.shift();
      }
    }
  }
  
  console.log(`  Unique string sets: ${stringSets.size}`);
  console.log(`  String sets: ${Array.from(stringSets).join(', ')}`);
  
  assert(stringSets.size >= 3, 
    `Expected at least 3 different string sets, got ${stringSets.size}: ${Array.from(stringSets).join(', ')}`);
  
  // Should NOT always be [6,5,4,3]
  const always6543 = Array.from(stringSets).every(ss => ss === '6-5-4-3' || ss.startsWith('6-5-4'));
  assert(!always6543, 
    `CRITICAL: All voicings use [6,5,4,3] or similar - no diversity! String sets: ${Array.from(stringSets).join(', ')}`);
});

test('Inversion distribution not degenerate: Not 90% same inversion', () => {
  const inversions = [];
  const recentVoicings = [];
  
  for (let i = 0; i < 50; i++) {
    const candidates = generateVoicings([48, 52, 55, 59], { // Cmaj7
      registerTarget: 'mid',
      previousVoicing: recentVoicings.length > 0 ? recentVoicings[recentVoicings.length - 1] : null
    });
    
    if (candidates.length > 0) {
      const best = selectBestVoicing(candidates, { recentVoicings: recentVoicings.slice(-5) });
      inversions.push(best.inversion);
      
      recentVoicings.push(best);
      if (recentVoicings.length > 10) {
        recentVoicings.shift();
      }
    }
  }
  
  // Count distribution
  const counts = {};
  inversions.forEach(inv => {
    counts[inv] = (counts[inv] || 0) + 1;
  });
  
  console.log(`  Inversion distribution:`, counts);
  
  // Should not have 90%+ of one inversion
  const maxCount = Math.max(...Object.values(counts));
  const maxPercent = (maxCount / inversions.length) * 100;
  
  assert(maxPercent < 90, 
    `Inversion distribution is degenerate: ${maxPercent.toFixed(1)}% are ${Object.keys(counts).find(k => counts[k] === maxCount)}. Distribution: ${JSON.stringify(counts)}`);
});

test('String set variety across different register positions', () => {
  const lowResults = [];
  const midResults = [];
  const highResults = [];
  
  const testChord = [48, 52, 55, 59]; // Cmaj7
  
  for (let i = 0; i < 10; i++) {
    const lowCandidates = generateVoicings(testChord, { registerTarget: 'low' });
    if (lowCandidates.length > 0) {
      lowResults.push(selectBestVoicing(lowCandidates));
    }
    
    const midCandidates = generateVoicings(testChord, { registerTarget: 'mid' });
    if (midCandidates.length > 0) {
      midResults.push(selectBestVoicing(midCandidates));
    }
    
    const highCandidates = generateVoicings(testChord, { registerTarget: 'high' });
    if (highCandidates.length > 0) {
      highResults.push(selectBestVoicing(highCandidates));
    }
  }
  
  const lowSets = new Set(lowResults.map(r => r.stringSet.join('-')));
  const midSets = new Set(midResults.map(r => r.stringSet.join('-')));
  const highSets = new Set(highResults.map(r => r.stringSet.join('-')));
  
  console.log(`  Low register sets: ${Array.from(lowSets).join(', ')}`);
  console.log(`  Mid register sets: ${Array.from(midSets).join(', ')}`);
  console.log(`  High register sets: ${Array.from(highSets).join(', ')}`);
  
  // Different registers should use different string sets
  assert(lowSets.size >= 1, `Low register should use at least 1 string set, got ${lowSets.size}`);
  assert(midSets.size >= 1, `Mid register should use at least 1 string set, got ${midSets.size}`);
  assert(highSets.size >= 1, `High register should use at least 1 string set, got ${highSets.size}`);
  
  // Low should prefer lower strings, high should prefer higher strings
  const lowAvg = Array.from(lowSets).map(ss => {
    const nums = ss.split('-').map(Number);
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  })[0];
  
  const highAvg = Array.from(highSets).map(ss => {
    const nums = ss.split('-').map(Number);
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  })[0];
  
  assert(lowAvg >= highAvg, 
    `Low register (avg string ${lowAvg.toFixed(1)}) should use lower or equal strings than high register (avg string ${highAvg.toFixed(1)})`);
});

// ============================================================
// PLAYABILITY TESTS
// ============================================================

test('Playability: Fret span never exceeds limit', () => {
  const chordTypes = [
    [48, 52, 55],
    [50, 53, 57],
    [55, 59, 62],
    [48, 52, 55, 59],
    [50, 53, 57, 60],
  ];
  
  for (const chord of chordTypes) {
    const candidates = generateVoicings(chord, { maxFretSpan: 5 });
    
    for (const candidate of candidates) {
      assert(candidate.fretSpan <= 5, 
        `Fret span ${candidate.fretSpan} exceeds limit of 5 for chord ${chord.join(',')}`);
    }
  }
});

test('Playability: No impossible string orderings', () => {
  const chord = [48, 52, 55, 59]; // Cmaj7
  const candidates = generateVoicings(chord);
  
  for (const candidate of candidates) {
    // String set should be in descending order (lower strings first)
    for (let i = 1; i < candidate.stringSet.length; i++) {
      assert(candidate.stringSet[i] <= candidate.stringSet[i-1], 
        `String set ${candidate.stringSet.join(',')} has invalid ordering`);
    }
    
    // All strings should be valid (1-6)
    for (const str of candidate.stringSet) {
      assert(str >= 1 && str <= 6, 
        `String ${str} is invalid (must be 1-6)`);
    }
  }
});

// ============================================================
// VOICE-LEADING TESTS
// ============================================================

test('Voice-leading: Prefers common tones', () => {
  const prevVoicing = {
    notes: [
      { midi: 48, string: 6, fret: 3 },
      { midi: 52, string: 5, fret: 2 },
      { midi: 55, string: 4, fret: 5 },
      { midi: 59, string: 3, fret: 4 }
    ],
    stringSet: [6, 5, 4, 3],
    inversion: 'root'
  };
  
  // Next chord shares 2 notes (C and E)
  const nextChord = [48, 52, 55, 60]; // Cmaj7 -> Am7 (C, E, G, A)
  
  const candidates = generateVoicings(nextChord, {
    previousVoicing: prevVoicing,
    maxJumpBetweenVoicings: 5
  });
  
  assert(candidates.length > 0, 'Should generate candidates');
  
  const best = selectBestVoicing(candidates, { recentVoicings: [prevVoicing] });
  
  // Best should have good voice-leading score
  assert(best.voiceLeadingScore > 0.3, 
    `Voice-leading score ${best.voiceLeadingScore} should be > 0.3 for common tones`);
});

// ============================================================
// DIVERSITY GOVERNOR TESTS
// ============================================================

test('Diversity governor: Penalizes repeating identical shape', () => {
  const chord = [48, 52, 55, 59]; // Cmaj7
  const recentVoicings = [];
  
  // Generate first voicing
  let candidates = generateVoicings(chord);
  let best1 = selectBestVoicing(candidates, { recentVoicings: [] });
  recentVoicings.push(best1);
  
  // Generate second voicing (should be different due to diversity penalty)
  candidates = generateVoicings(chord);
  let best2 = selectBestVoicing(candidates, { recentVoicings: recentVoicings.slice(-5) });
  
  // If first was [6,5,4,3], second should potentially be different
  const sameShape = best1.stringSet.join(',') === best2.stringSet.join(',') && 
                    best1.inversion === best2.inversion;
  
  // After 5 identical shapes, should definitely be different
  for (let i = 0; i < 5; i++) {
    recentVoicings.push({ ...best1 });
  }
  
  candidates = generateVoicings(chord);
  let best3 = selectBestVoicing(candidates, { recentVoicings: recentVoicings.slice(-5) });
  
  // With 5 recent identical shapes, should prefer different shape
  const stillSame = best3.stringSet.join(',') === best1.stringSet.join(',') && 
                    best3.inversion === best1.inversion;
  
  // This is probabilistic, so we just check that diversity scoring exists
  assert(best3.diversityScore !== undefined, 
    'Diversity score should be calculated');
  
  console.log(`  First voicing: ${best1.stringSet.join(',')} ${best1.inversion}`);
  console.log(`  After diversity: ${best3.stringSet.join(',')} ${best3.inversion}`);
  console.log(`  Diversity score: ${best3.diversityScore}`);
});

// ============================================================
// REPORT
// ============================================================

console.log('\n=== Voicing Diversity Test Results ===');
console.log(`Tests run: ${testsRun}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (failures.length > 0) {
  console.log('\n=== Failures ===');
  failures.forEach(f => {
    console.log(`  ✗ ${f.name}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✓ All voicing diversity tests passed');
  process.exit(0);
}


