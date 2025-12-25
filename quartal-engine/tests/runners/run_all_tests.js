/**
 * Quartal Engine Test Runner
 * Validates MusicXML outputs against specifications
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_DIR = path.join(__dirname, '..');
const FIXTURES_DIR = path.join(TEST_DIR, 'fixtures');
const EXPECTED_DIR = path.join(TEST_DIR, 'expected');
const OUTPUT_DIR = path.join(__dirname, '../../output');

// Scale degree mappings
const SCALE_DEGREES = {
  ionian: [0, 2, 4, 5, 7, 9, 11],      // C, D, E, F, G, A, B
  dorian: [0, 2, 3, 5, 7, 9, 10],      // C, D, Eb, F, G, A, Bb
  phrygian: [0, 1, 3, 5, 7, 8, 10],    // C, Db, Eb, F, G, Ab, Bb
  lydian: [0, 2, 4, 6, 7, 9, 11],      // C, D, E, F#, G, A, B
  mixolydian: [0, 2, 4, 5, 7, 9, 10],  // C, D, E, F, G, A, Bb
  aeolian: [0, 2, 3, 5, 7, 8, 10],     // C, D, Eb, F, G, Ab, Bb
  locrian: [0, 1, 3, 5, 6, 8, 10]      // C, Db, Eb, F, Gb, Ab, Bb
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get pitch class from note name
 */
function getPitchClass(noteName) {
  return NOTE_NAMES.indexOf(noteName);
}

/**
 * Get scale degrees for a mode
 */
function getScaleDegrees(mode) {
  return SCALE_DEGREES[mode] || SCALE_DEGREES.ionian;
}

/**
 * Parse MusicXML and extract pitches
 */
function parseMusicXML(xmlContent) {
  const pitches = [];
  const noteMatches = xmlContent.matchAll(/<note>[\s\S]*?<\/note>/g);
  
  for (const noteMatch of noteMatches) {
    const noteXml = noteMatch[0];
    const stepMatch = noteXml.match(/<step>([A-G])<\/step>/);
    const alterMatch = noteXml.match(/<alter>(-?\d+)<\/alter>/);
    const octaveMatch = noteXml.match(/<octave>(\d+)<\/octave>/);
    
    if (stepMatch && octaveMatch) {
      const step = stepMatch[1];
      const alter = alterMatch ? parseInt(alterMatch[1]) : 0;
      const octave = parseInt(octaveMatch[1]);
      
      let noteName = step;
      if (alter === 1) noteName = step + '#';
      if (alter === -1) noteName = step + 'b';
      
      const pitchClass = getPitchClass(noteName);
      pitches.push({
        step,
        alter,
        octave,
        pitchClass,
        midiNote: (octave + 1) * 12 + pitchClass
      });
    }
  }
  
  return pitches;
}

/**
 * Validate MusicXML structure
 */
function validateMusicXMLStructure(xmlContent) {
  const errors = [];
  
  // Check for required elements
  if (!xmlContent.includes('<score-partwise')) {
    errors.push('Missing <score-partwise> root element');
  }
  if (!xmlContent.includes('<part-list')) {
    errors.push('Missing <part-list> element');
  }
  if (!xmlContent.includes('<part')) {
    errors.push('Missing <part> element');
  }
  if (!xmlContent.includes('<measure')) {
    errors.push('Missing <measure> element');
  }
  
  // Check for well-formed XML (basic check)
  const openTags = (xmlContent.match(/<[^/!?][^>]*>/g) || []).length;
  const closeTags = (xmlContent.match(/<\/[^>]+>/g) || []).length;
  if (openTags !== closeTags) {
    errors.push(`XML structure issue: ${openTags} open tags vs ${closeTags} close tags`);
  }
  
  return errors;
}

/**
 * Validate v1.0: All pitches diatonic to scale
 */
function validateV1_0(xmlContent, fixture) {
  const errors = [];
  const warnings = [];
  
  // Parse XML
  const pitches = parseMusicXML(xmlContent);
  if (pitches.length === 0) {
    errors.push('No pitches found in MusicXML');
    return { errors, warnings };
  }
  
  // Get scale information
  const scale = fixture.input.scale;
  const root = fixture.input.root;
  const rootPitchClass = getPitchClass(root);
  
  // Map scale name to mode
  const modeMap = {
    'major': 'ionian',
    'minor': 'aeolian',
    'dorian': 'dorian',
    'mixolydian': 'mixolydian',
    'lydian': 'lydian',
    'phrygian': 'phrygian',
    'locrian': 'locrian'
  };
  
  const mode = modeMap[scale] || 'ionian';
  const scaleDegrees = getScaleDegrees(mode);
  const scalePitchClasses = scaleDegrees.map(deg => (rootPitchClass + deg) % 12);
  
  // Check all pitches are diatonic
  for (const pitch of pitches) {
    if (!scalePitchClasses.includes(pitch.pitchClass)) {
      errors.push(`Non-diatonic pitch found: ${NOTE_NAMES[pitch.pitchClass]} (not in ${scale} scale)`);
    }
  }
  
  // Check for quartal intervals (basic check - would need more sophisticated analysis)
  // This is a simplified check - full quartal validation would require chord analysis
  
  return { errors, warnings };
}

/**
 * Validate v1.1: Melody unchanged, harmony added
 */
function validateV1_1(xmlContent, fixture, originalMelody) {
  const errors = [];
  const warnings = [];
  
  // Parse XML
  const pitches = parseMusicXML(xmlContent);
  if (pitches.length === 0) {
    errors.push('No pitches found in MusicXML');
    return { errors, warnings };
  }
  
  // Parse original melody
  const originalPitches = parseMusicXML(originalMelody);
  
  // Check melody is present and unchanged (simplified - would need voice assignment analysis)
  // For now, check that original melody pitches are present
  const originalPitchClasses = originalPitches.map(p => p.pitchClass);
  const outputPitchClasses = pitches.map(p => p.pitchClass);
  
  // All original pitches should be in output
  for (const pc of originalPitchClasses) {
    if (!outputPitchClasses.includes(pc)) {
      errors.push(`Melody pitch missing in output: ${NOTE_NAMES[pc]}`);
    }
  }
  
  // Check harmony pitches are diatonic
  const scale = fixture.input.governingScale;
  const root = fixture.input.root;
  const rootPitchClass = getPitchClass(root);
  
  const modeMap = {
    'major': 'ionian',
    'minor': 'aeolian',
    'dorian': 'dorian',
    'mixolydian': 'mixolydian',
    'lydian': 'lydian',
    'phrygian': 'phrygian',
    'locrian': 'locrian'
  };
  
  const mode = modeMap[scale] || 'ionian';
  const scaleDegrees = getScaleDegrees(mode);
  const scalePitchClasses = scaleDegrees.map(deg => (rootPitchClass + deg) % 12);
  
  // Check all pitches are diatonic (melody + harmony)
  for (const pitch of pitches) {
    if (!scalePitchClasses.includes(pitch.pitchClass)) {
      errors.push(`Non-diatonic pitch found: ${NOTE_NAMES[pitch.pitchClass]} (not in ${scale} scale)`);
    }
  }
  
  return { errors, warnings };
}

/**
 * Run test for a fixture
 */
function runTest(fixtureFile, version) {
  const fixturePath = path.join(FIXTURES_DIR, fixtureFile);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  
  console.log(`\nTesting: ${fixture.name}`);
  console.log(`Version: ${version}`);
  
  // Get output file path
  const outputFileName = fixtureFile.replace('.json', '.musicxml').replace('fixture_', 'output_');
  const outputPath = path.join(OUTPUT_DIR, `v${version}`, outputFileName);
  
  // Check if output exists
  if (!fs.existsSync(outputPath)) {
    console.log(`  ❌ FAIL: Output file not found: ${outputPath}`);
    return { passed: false, errors: ['Output file not found'] };
  }
  
  const xmlContent = fs.readFileSync(outputPath, 'utf8');
  
  // Validate XML structure
  const structureErrors = validateMusicXMLStructure(xmlContent);
  if (structureErrors.length > 0) {
    console.log(`  ❌ FAIL: XML structure errors:`);
    structureErrors.forEach(err => console.log(`    - ${err}`));
    return { passed: false, errors: structureErrors };
  }
  
  // Version-specific validation
  let validation;
  if (version === '1.0') {
    validation = validateV1_0(xmlContent, fixture);
  } else if (version === '1.1' || version === '1.2') {
    // Load original melody if needed
    const melodyFile = fixture.input.melodyFile;
    const melodyPath = path.join(FIXTURES_DIR, melodyFile);
    if (fs.existsSync(melodyPath)) {
      const originalMelody = fs.readFileSync(melodyPath, 'utf8');
      validation = validateV1_1(xmlContent, fixture, originalMelody);
      
      // v1.2 additional checks
      if (version === '1.2') {
        // Check density if specified
        if (fixture.input.density) {
          const pitches = parseMusicXML(xmlContent);
          const voices = new Set(pitches.map(p => {
            // Extract voice from XML (simplified - would need proper parsing)
            return 1; // Placeholder
          }));
          // Basic check: should have melody + harmony voices
        }
      }
    } else {
      validation = { errors: [`Melody file not found: ${melodyFile}`], warnings: [] };
    }
  } else {
    validation = { errors: [`Unknown version: ${version}`], warnings: [] };
  }
  
  if (validation.errors.length > 0) {
    console.log(`  ❌ FAIL: Validation errors:`);
    validation.errors.forEach(err => console.log(`    - ${err}`));
    return { passed: false, errors: validation.errors, warnings: validation.warnings };
  }
  
  if (validation.warnings.length > 0) {
    console.log(`  ⚠️  WARNINGS:`);
    validation.warnings.forEach(warn => console.log(`    - ${warn}`));
  }
  
  console.log(`  ✅ PASS`);
  return { passed: true, errors: [], warnings: validation.warnings };
}

/**
 * Main test runner
 */
function main() {
  console.log('Quartal Engine Test Runner');
  console.log('==========================\n');
  
  const results = {
    v1_0: [],
    v1_1: [],
    v1_2: []
  };
  
  // Run v1.0 tests
  console.log('VERSION 1.0 TESTS');
  console.log('------------------');
  
  const v1_0Fixtures = ['fixture_a_v1.0.json', 'fixture_b_v1.0.json'];
  for (const fixtureFile of v1_0Fixtures) {
    const result = runTest(fixtureFile, '1.0');
    results.v1_0.push({ fixture: fixtureFile, ...result });
  }
  
  // Run v1.1 tests
  console.log('\nVERSION 1.1 TESTS');
  console.log('------------------');
  
  const v1_1Fixtures = ['fixture_c_v1.1.json', 'fixture_d_v1.1.json'];
  for (const fixtureFile of v1_1Fixtures) {
    const result = runTest(fixtureFile, '1.1');
    results.v1_1.push({ fixture: fixtureFile, ...result });
  }
  
  // Run v1.2 tests
  console.log('\nVERSION 1.2 TESTS');
  console.log('------------------');
  
  const v1_2Fixtures = ['fixture_e_v1.2.json', 'fixture_f_v1.2.json'];
  for (const fixtureFile of v1_2Fixtures) {
    const result = runTest(fixtureFile, '1.2');
    results.v1_2.push({ fixture: fixtureFile, ...result });
  }
  
  // Summary
  console.log('\nTEST SUMMARY');
  console.log('============');
  
  const v1_0Passed = results.v1_0.filter(r => r.passed).length;
  const v1_0Total = results.v1_0.length;
  console.log(`v1.0: ${v1_0Passed}/${v1_0Total} passed`);
  
  const v1_1Passed = results.v1_1.filter(r => r.passed).length;
  const v1_1Total = results.v1_1.length;
  console.log(`v1.1: ${v1_1Passed}/${v1_1Total} passed`);
  
  const v1_2Passed = results.v1_2.filter(r => r.passed).length;
  const v1_2Total = results.v1_2.length;
  console.log(`v1.2: ${v1_2Passed}/${v1_2Total} passed`);
  
  const allPassed = v1_0Passed === v1_0Total && v1_1Passed === v1_1Total && v1_2Passed === v1_2Total;
  
  if (allPassed) {
    console.log('\n✅ ALL TESTS PASSED');
    process.exit(0);
  } else {
    console.log('\n❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

// Run tests
main();

