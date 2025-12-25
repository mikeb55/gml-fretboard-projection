/**
 * Fix and test the 3 hard commands
 * This script will generate all 3 files and verify they're complete
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');
const fs = require('fs');
const path = require('path');

const commands = [
  'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, 4-note quartals, eighth notes, tempo 140',
  'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6, B locrian bars 7-8, F# lydian bars 9-10, sixteenth notes, at 180 bpm',
  'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12, 4-note quartals, half notes, speed 60'
];

console.log('Fixing and Testing 3 Hard Commands...\n');
console.log('='.repeat(80));

const outputDir = path.join(__dirname, 'output', 'generated');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let allPassed = true;

commands.forEach((cmd, idx) => {
  console.log(`\n${idx + 1}. ${cmd.substring(0, 70)}...`);
  
  try {
    // Parse
    const params = parseCommand(cmd);
    console.log(`   Parsed: ${params.bars} bars, ${params.stackType}, ${params.noteValue}, ${params.tempo} bpm`);
    
    // Generate XML
    const xml = generateMusicXML(params);
    
    // Verify before saving
    const measureCount = (xml.match(/<measure number=/g) || []).length;
    const noteCount = (xml.match(/<note>/g) || []).length;
    const expectedNotes = params.bars * (params.stackType === '3-note' ? 3 : 4);
    
    console.log(`   Generated: ${measureCount} measures, ${noteCount} notes`);
    
    if (measureCount !== params.bars || noteCount !== expectedNotes) {
      console.log(`   ✗ ERROR: Expected ${params.bars} measures, ${expectedNotes} notes`);
      console.log(`   Got: ${measureCount} measures, ${noteCount} notes`);
      allPassed = false;
      return;
    }
    
    // Generate filename
    let filename;
    if (params.multiScale && params.segments) {
      const first = params.segments[0];
      const last = params.segments[params.segments.length - 1];
      const root = `${first.root}-to-${last.root}`.replace(/#/g, 'sharp').replace(/b/g, 'flat');
      const scale = `${first.scale}-to-${last.scale}`;
      const stackType = params.stackType === '3-note' ? '3note' : '4note';
      filename = `${root}-${scale}-quartal-${stackType}-${params.bars}bars-${params.tempo}bpm-${Date.now()}.musicxml`;
    } else {
      const root = (params.root || 'C').replace(/#/g, 'sharp').replace(/b/g, 'flat');
      const scale = params.scale || 'major';
      const stackType = params.stackType === '3-note' ? '3note' : '4note';
      filename = `${root}-${scale}-quartal-${stackType}-${params.bars}bars-${params.tempo}bpm-${Date.now()}.musicxml`;
    }
    
    // Save file
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, xml, 'utf8');
    console.log(`   ✓ Saved: ${filename}`);
    
    // Verify saved file
    const savedXml = fs.readFileSync(filepath, 'utf8');
    const savedMeasures = (savedXml.match(/<measure number=/g) || []).length;
    const savedNotes = (savedXml.match(/<note>/g) || []).length;
    
    console.log(`   Verified: ${savedMeasures} measures, ${savedNotes} notes in saved file`);
    
    if (savedMeasures === params.bars && savedNotes === expectedNotes) {
      console.log(`   ✅ PASS`);
    } else {
      console.log(`   ✗ FAIL - File verification failed`);
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
  console.log('✅ All 3 commands generated complete files!');
  console.log('\nFiles are in: quartal-engine/output/generated/');
  console.log('Open them in Sibelius or Guitar Pro 8 to verify.');
} else {
  console.log('❌ Some commands failed!');
}

