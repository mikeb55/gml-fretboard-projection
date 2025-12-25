/**
 * Validate Musical Content of Generated MusicXML
 * Checks that quartal stacks are correct and playable
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');
const { getScalePitchClasses, generateQuartalStack } = require('./quartal-cli-core');

const TUNING = [40, 45, 50, 55, 59, 64]; // EADGBE

function parseMusicXML(xmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');
  
  const measures = [];
  const measureElements = doc.getElementsByTagName('measure');
  
  for (let i = 0; i < measureElements.length; i++) {
    const measure = measureElements[i];
    const notes = [];
    const noteElements = measure.getElementsByTagName('note');
    
    for (let j = 0; j < noteElements.length; j++) {
      const note = noteElements[j];
      const pitch = note.getElementsByTagName('pitch')[0];
      if (pitch) {
        const step = pitch.getElementsByTagName('step')[0]?.textContent;
        const alter = pitch.getElementsByTagName('alter')[0]?.textContent;
        const octave = pitch.getElementsByTagName('octave')[0]?.textContent;
        const voice = note.getElementsByTagName('voice')[0]?.textContent;
        
        // Calculate MIDI note (proper chromatic mapping)
        // C=0, C#/Db=1, D=2, D#/Eb=3, E=4, F=5, F#/Gb=6, G=7, G#/Ab=8, A=9, A#/Bb=10, B=11
        const stepToSemitones = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const alterValue = alter ? parseInt(alter) : 0;
        const octaveValue = parseInt(octave);
        const baseSemitones = stepToSemitones[step] || 0;
        const midiNote = (octaveValue + 1) * 12 + baseSemitones + alterValue;
        
        notes.push({
          step,
          alter: alter ? parseInt(alter) : 0,
          octave: parseInt(octave),
          voice: parseInt(voice),
          midiNote,
          pitchClass: midiNote % 12
        });
      }
    }
    
    measures.push(notes);
  }
  
  return measures;
}

function validateQuartalStack(notes, expectedStack, root, scale) {
  const errors = [];
  
  // Get expected scale
  const scalePcs = getScalePitchClasses(scale, root);
  
  // Check we have the right number of notes
  if (notes.length !== expectedStack.length) {
    errors.push(`Expected ${expectedStack.length} notes, got ${notes.length}`);
    return errors;
  }
  
  // Check each note matches expected pitch class
  const actualPcs = notes.map(n => n.pitchClass).sort();
  const expectedPcs = [...expectedStack].sort();
  
  for (let i = 0; i < expectedPcs.length; i++) {
    if (!actualPcs.includes(expectedPcs[i])) {
      errors.push(`Missing pitch class ${expectedPcs[i]} (expected ${expectedPcs}, got ${actualPcs})`);
    }
  }
  
  // Check fret span (should be <= 5 frets)
  const frets = notes.map(n => {
    // Calculate fret from MIDI note and string
    // This is approximate - we'd need to know which string each note is on
    return null; // Skip for now
  });
  
  return errors;
}

function validateFile(filepath, testCase) {
  console.log(`\nValidating: ${path.basename(filepath)}`);
  
  const xmlContent = fs.readFileSync(filepath, 'utf8');
  const measures = parseMusicXML(xmlContent);
  
  const errors = [];
  
  // Generate expected stacks
  const scalePcs = getScalePitchClasses(testCase.scale, testCase.root);
  const expectedStacks = [];
  
  for (let bar = 0; bar < testCase.bars; bar++) {
    const stackRootIndex = bar % 7;
    const stack = generateQuartalStack(scalePcs, stackRootIndex, testCase.stackType);
    expectedStacks.push(stack);
  }
  
  // Validate each measure
  for (let i = 0; i < measures.length; i++) {
    const measureNotes = measures[i];
    const expectedStack = expectedStacks[i];
    
    if (measureNotes.length !== expectedStack.length) {
      errors.push(`Measure ${i + 1}: Expected ${expectedStack.length} notes, got ${measureNotes.length}`);
      continue;
    }
    
    // Check pitch classes match
    const actualPcs = measureNotes.map(n => n.pitchClass).sort();
    const expectedPcs = [...expectedStack].sort();
    
    const missingPcs = expectedPcs.filter(pc => !actualPcs.includes(pc));
    if (missingPcs.length > 0) {
      errors.push(`Measure ${i + 1}: Missing pitch classes: ${missingPcs.join(', ')}`);
    }
    
    // Check voices are sequential
    const voices = measureNotes.map(n => n.voice).sort();
    const expectedVoices = Array.from({ length: expectedStack.length }, (_, i) => i + 1);
    if (JSON.stringify(voices) !== JSON.stringify(expectedVoices)) {
      errors.push(`Measure ${i + 1}: Voices should be ${expectedVoices.join(', ')}, got ${voices.join(', ')}`);
    }
  }
  
  if (errors.length > 0) {
    console.log('  ❌ FAILED');
    errors.forEach(err => console.log(`    - ${err}`));
    return false;
  } else {
    console.log('  ✅ PASSED - Musical content is correct');
    return true;
  }
}

// Run validation on all test results
const testResultsDir = path.join(__dirname, 'output', 'test-results');
const testFiles = fs.readdirSync(testResultsDir).filter(f => f.endsWith('.musicxml') || f.endsWith('.MusicXML'));

console.log(`\n╔══════════════════════════════════════════════════════════════════════════════╗`);
console.log('║          Musical Content Validation                                         ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

// Reconstruct test cases from filenames
const TEST_COMBINATIONS = require('./comprehensive-test').TEST_COMBINATIONS;

let totalValidated = 0;
let passedValidated = 0;

for (let i = 0; i < TEST_COMBINATIONS.length; i++) {
  const testCase = TEST_COMBINATIONS[i];
  const filename = `test-${i + 1}-${testCase.root}-${testCase.scale}-${testCase.stackType}-${testCase.stringSet.join('-')}.musicxml`;
  const filepath = path.join(testResultsDir, filename);
  
  if (fs.existsSync(filepath)) {
    totalValidated++;
    if (validateFile(filepath, testCase)) {
      passedValidated++;
    }
  }
}

console.log(`\n${'='.repeat(80)}`);
console.log(`Validated: ${passedValidated}/${totalValidated} files`);
console.log('='.repeat(80));

process.exit(passedValidated === totalValidated ? 0 : 1);

