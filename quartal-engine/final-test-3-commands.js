/**
 * FINAL TEST - Generate the 3 hard commands and verify they're complete
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

const commands = [
  'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, 4-note quartals, eighth notes, tempo 140',
  'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6, B locrian bars 7-8, F# lydian bars 9-10, sixteenth notes, at 180 bpm',
  'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12, 4-note quartals, half notes, speed 60'
];

console.log('FINAL TEST - 3 Hard Commands\n');
console.log('='.repeat(80));

const outputDir = path.join(__dirname, 'output', 'generated');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let allPassed = true;
const generatedFiles = [];

commands.forEach((cmd, idx) => {
  console.log(`\n${idx + 1}. Testing: ${cmd.substring(0, 60)}...`);
  
  try {
    // Parse
    const params = parseCommand(cmd);
    
    // Generate
    const xml = generateMusicXML(params);
    
    // Parse XML to verify structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    // Check for parse errors
    const parseErrors = doc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      console.log(`   ✗ XML Parse Error: ${parseErrors[0].textContent}`);
      allPassed = false;
      return;
    }
    
    // Count measures and notes
    const measures = doc.getElementsByTagName('measure');
    let totalNotes = 0;
    const notesPerMeasure = [];
    
    for (let i = 0; i < measures.length; i++) {
      const measure = measures[i];
      const notes = measure.getElementsByTagName('note');
      const count = notes.length;
      notesPerMeasure.push(count);
      totalNotes += count;
    }
    
    const expectedNotes = params.bars * (params.stackType === '3-note' ? 3 : 4);
    
    // Generate filename
    let filename;
    if (params.multiScale && params.segments) {
      const first = params.segments[0];
      const last = params.segments[params.segments.length - 1];
      const root = `${first.root}-to-${last.root}`.replace(/#/g, 'sharp').replace(/b/g, 'flat');
      const scale = `${first.scale}-to-${last.scale}`;
      const stackType = params.stackType === '3-note' ? '3note' : '4note';
      filename = `TEST-${idx + 1}-${root}-${scale}-quartal-${stackType}-${params.bars}bars-${params.tempo}bpm.musicxml`;
    } else {
      const root = (params.root || 'C').replace(/#/g, 'sharp').replace(/b/g, 'flat');
      const scale = params.scale || 'major';
      const stackType = params.stackType === '3-note' ? '3note' : '4note';
      filename = `TEST-${idx + 1}-${root}-${scale}-quartal-${stackType}-${params.bars}bars-${params.tempo}bpm.musicxml`;
    }
    
    // Save
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, xml, 'utf8');
    generatedFiles.push(filepath);
    
    // Verify saved file
    const savedXml = fs.readFileSync(filepath, 'utf8');
    const savedDoc = parser.parseFromString(savedXml, 'text/xml');
    const savedMeasures = savedDoc.getElementsByTagName('measure');
    let savedTotalNotes = 0;
    for (let i = 0; i < savedMeasures.length; i++) {
      savedTotalNotes += savedMeasures[i].getElementsByTagName('note').length;
    }
    
    // Results
    console.log(`   Expected: ${params.bars} measures, ${expectedNotes} notes`);
    console.log(`   Generated: ${measures.length} measures, ${totalNotes} notes`);
    console.log(`   Saved file: ${savedMeasures.length} measures, ${savedTotalNotes} notes`);
    console.log(`   File: ${filename}`);
    console.log(`   Size: ${fs.statSync(filepath).size} bytes`);
    console.log(`   Notes per measure: ${notesPerMeasure.slice(0, 5).join(', ')}${notesPerMeasure.length > 5 ? '...' : ''}`);
    
    // Check tempo
    const tempoMatch = xml.match(/tempo="(\d+)"/);
    if (tempoMatch) {
      console.log(`   Tempo: ${tempoMatch[1]} bpm (expected: ${params.tempo})`);
    }
    
    // Validation
    if (measures.length === params.bars && 
        totalNotes === expectedNotes && 
        savedMeasures.length === params.bars &&
        savedTotalNotes === expectedNotes) {
      console.log(`   ✅ PASS - Complete file generated!`);
    } else {
      console.log(`   ✗ FAIL - File incomplete!`);
      allPassed = false;
    }
    
  } catch (error) {
    console.log(`   ✗ ERROR: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(80));
if (allPassed) {
  console.log('✅ ALL TESTS PASSED - All 3 commands generated complete files!');
  console.log('\nGenerated files:');
  generatedFiles.forEach((f, i) => {
    console.log(`   ${i + 1}. ${path.basename(f)}`);
  });
  console.log('\nLocation: quartal-engine/output/generated/');
  console.log('Open these files in Sibelius or Guitar Pro 8 to verify.');
} else {
  console.log('❌ SOME TESTS FAILED!');
}

