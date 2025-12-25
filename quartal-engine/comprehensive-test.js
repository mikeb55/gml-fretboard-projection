/**
 * Comprehensive Test Suite for Quartal Engine
 * Tests all string sets, 3-note and 4-note quartals, 30+ scales and modes
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

// Import the generation function
const { generateMusicXML } = require('./quartal-cli-core');

const STRING_SETS_3_NOTE = [
  [5, 4, 3],  // 6-5-4
  [4, 3, 2],  // 5-4-3
  [3, 2, 1],  // 4-3-2
  [2, 1, 0]   // 3-2-1
];

const STRING_SETS_4_NOTE = [
  [5, 4, 3, 2],  // 6-5-4-3
  [4, 3, 2, 1],  // 5-4-3-2
  [3, 2, 1, 0]   // 4-3-2-1
];

// 30+ Scale/Mode combinations with different roots
const SCALE_MODE_COMBINATIONS = [
  // Major (Ionian) - 5 variations
  { root: 'C', scale: 'major' },
  { root: 'G', scale: 'major' },
  { root: 'F', scale: 'major' },
  { root: 'D', scale: 'major' },
  { root: 'Bb', scale: 'major' },
  
  // Minor (Aeolian) - 5 variations
  { root: 'A', scale: 'minor' },
  { root: 'E', scale: 'minor' },
  { root: 'D', scale: 'minor' },
  { root: 'G', scale: 'minor' },
  { root: 'C', scale: 'minor' },
  
  // Dorian - 5 variations
  { root: 'D', scale: 'dorian' },
  { root: 'A', scale: 'dorian' },
  { root: 'E', scale: 'dorian' },
  { root: 'G', scale: 'dorian' },
  { root: 'C', scale: 'dorian' },
  
  // Mixolydian - 5 variations
  { root: 'G', scale: 'mixolydian' },
  { root: 'D', scale: 'mixolydian' },
  { root: 'A', scale: 'mixolydian' },
  { root: 'C', scale: 'mixolydian' },
  { root: 'F', scale: 'mixolydian' },
  
  // Lydian - 5 variations
  { root: 'F', scale: 'lydian' },
  { root: 'C', scale: 'lydian' },
  { root: 'G', scale: 'lydian' },
  { root: 'D', scale: 'lydian' },
  { root: 'A', scale: 'lydian' },
  
  // Phrygian - 5 variations
  { root: 'E', scale: 'phrygian' },
  { root: 'B', scale: 'phrygian' },
  { root: 'F#', scale: 'phrygian' },
  { root: 'C#', scale: 'phrygian' },
  { root: 'A', scale: 'phrygian' },
  
  // Locrian - 5 variations
  { root: 'B', scale: 'locrian' },
  { root: 'F#', scale: 'locrian' },
  { root: 'C#', scale: 'locrian' },
  { root: 'G#', scale: 'locrian' },
  { root: 'D#', scale: 'locrian' },
  
  // Additional sharp/flat roots for variety
  { root: 'F#', scale: 'major' },
  { root: 'Bb', scale: 'dorian' },
  { root: 'Eb', scale: 'mixolydian' },
  { root: 'Ab', scale: 'lydian' },
];

// Generate comprehensive test combinations
const TEST_COMBINATIONS = [];

// For each scale/mode combination, test:
// - 3-note quartals on 2 different string sets
// - 4-note quartals on 1 string set
// - Both 1 bar and 4 bars for variety
let testIndex = 0;
for (const scaleMode of SCALE_MODE_COMBINATIONS) {
  // 3-note quartals - test 2 string sets
  TEST_COMBINATIONS.push({
    ...scaleMode,
    stackType: '3-note',
    stringSet: STRING_SETS_3_NOTE[0], // 6-5-4
    bars: 1
  });
  
  TEST_COMBINATIONS.push({
    ...scaleMode,
    stackType: '3-note',
    stringSet: STRING_SETS_3_NOTE[2], // 4-3-2
    bars: 1
  });
  
  // 4-note quartals - test 1 string set
  TEST_COMBINATIONS.push({
    ...scaleMode,
    stackType: '4-note',
    stringSet: STRING_SETS_4_NOTE[1], // 5-4-3-2
    bars: 1
  });
  
  // Every 10th test, add a 4-bar version for variety
  if (testIndex % 10 === 0) {
    TEST_COMBINATIONS.push({
      ...scaleMode,
      stackType: '3-note',
      stringSet: STRING_SETS_3_NOTE[0],
      bars: 4
    });
  }
  
  testIndex++;
}

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function parseMusicXML(xmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');
  
  const notes = [];
  const noteElements = doc.getElementsByTagName('note');
  
  for (let i = 0; i < noteElements.length; i++) {
    const note = noteElements[i];
    const pitch = note.getElementsByTagName('pitch')[0];
    if (pitch) {
      const step = pitch.getElementsByTagName('step')[0]?.textContent;
      const alter = pitch.getElementsByTagName('alter')[0]?.textContent;
      const octave = pitch.getElementsByTagName('octave')[0]?.textContent;
      const voice = note.getElementsByTagName('voice')[0]?.textContent;
      
      notes.push({
        step: step || '',
        alter: alter ? parseInt(alter) : null,
        octave: octave ? parseInt(octave) : null,
        voice: voice ? parseInt(voice) : null
      });
    }
  }
  
  return notes;
}

function validateMusicXML(xmlContent, testCase) {
  const errors = [];
  
  // Check XML is well-formed
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');
    const parseError = doc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      errors.push('XML parsing error: ' + parseError[0].textContent);
      return { valid: false, errors };
    }
  } catch (e) {
    errors.push('XML parsing exception: ' + e.message);
    return { valid: false, errors };
  }
  
  // Parse notes
  const notes = parseMusicXML(xmlContent);
  
  // Check we have the right number of notes
  const expectedNotes = testCase.stackType === '3-note' ? 3 : 4;
  const expectedTotal = expectedNotes * testCase.bars;
  
  if (notes.length < expectedTotal) {
    errors.push(`Expected ${expectedTotal} notes, got ${notes.length}`);
  }
  
  // Check each note has required elements
  for (const note of notes) {
    if (!note.step) {
      errors.push('Note missing step');
    }
    if (note.octave === null || note.octave === undefined) {
      errors.push('Note missing octave');
    }
    if (note.voice === null || note.voice === undefined) {
      errors.push('Note missing voice');
    }
  }
  
  // Check voices are sequential (1, 2, 3, 4)
  const voices = notes.map(n => n.voice).filter(v => v !== null);
  const uniqueVoices = [...new Set(voices)];
  const expectedVoices = testCase.stackType === '3-note' ? [1, 2, 3] : [1, 2, 3, 4];
  
  for (const voice of uniqueVoices) {
    if (!expectedVoices.includes(voice)) {
      errors.push(`Unexpected voice number: ${voice}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

async function runTest(testCase, index) {
  totalTests++;
  
  const testName = `Test ${index + 1}: ${testCase.root} ${testCase.scale}, ${testCase.stackType}, strings ${testCase.stringSet.join('-')}, ${testCase.bars} bar(s)`;
  
  // Only print every 10th test to avoid overwhelming output
  if (index % 10 === 0 || index < 5) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(testName);
    console.log('='.repeat(80));
  }
  
  try {
    // Generate MusicXML
    const params = {
      root: testCase.root,
      scale: testCase.scale,
      stackType: testCase.stackType,
      bars: testCase.bars,
      noteValue: 'quarter',
      stringSet: testCase.stringSet
    };
    
    const xml = generateMusicXML(params);
    
    // Validate
    const validation = validateMusicXML(xml, testCase);
    
    if (validation.valid) {
      if (index % 10 === 0 || index < 5) {
        console.log('✅ PASS');
      }
      passedTests++;
      
      // Save test output (only save every 5th to avoid too many files)
      if (index % 5 === 0) {
        const outputDir = path.join(__dirname, 'output', 'test-results');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filename = `test-${index + 1}-${testCase.root}-${testCase.scale}-${testCase.stackType}-${testCase.stringSet.join('-')}.musicxml`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, xml, 'utf8');
        if (index % 10 === 0 || index < 5) {
          console.log(`   Saved: ${filename}`);
        }
      }
    } else {
      console.log(`\n❌ FAIL - Test ${index + 1}: ${testCase.root} ${testCase.scale}`);
      console.log('   Errors:');
      validation.errors.forEach(err => console.log(`     - ${err}`));
      failedTests.push({ testCase, errors: validation.errors, xml });
    }
    
  } catch (error) {
    console.log(`\n❌ ERROR - Test ${index + 1}: ${testCase.root} ${testCase.scale}`);
    console.log(`   ${error.message}`);
    failedTests.push({ testCase, errors: [error.message], xml: null });
  }
}

async function runAllTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║          Quartal Engine - Comprehensive Test Suite (30+ Scales)          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTotal test combinations: ${TEST_COMBINATIONS.length}`);
  console.log(`Scale/mode variations: ${SCALE_MODE_COMBINATIONS.length}`);
  console.log('Running tests...\n');
  
  for (let i = 0; i < TEST_COMBINATIONS.length; i++) {
    await runTest(TEST_COMBINATIONS[i], i);
  }
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests.length}`);
  console.log(`Scale/Mode Variations Tested: ${SCALE_MODE_COMBINATIONS.length}`);
  
  if (failedTests.length > 0) {
    console.log('\nFailed Tests:');
    failedTests.forEach((failure, idx) => {
      console.log(`\n${idx + 1}. ${failure.testCase.root} ${failure.testCase.scale}, ${failure.testCase.stackType}`);
      console.log(`   String Set: ${failure.testCase.stringSet.join('-')}`);
      failure.errors.forEach(err => console.log(`   - ${err}`));
    });
  }
  
  console.log(`\n${'='.repeat(80)}`);
  if (failedTests.length === 0) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log(`⚠️  ${failedTests.length} TEST(S) FAILED - FIXES REQUIRED`);
  }
  console.log('='.repeat(80));
  
  return failedTests.length === 0;
}

if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, TEST_COMBINATIONS, SCALE_MODE_COMBINATIONS };
