/**
 * Verify the 3 hard commands generate complete files
 * Run this to test: node verify-3-commands.js
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

console.log('Verifying 3 Hard Commands Generate Complete Files...\n');
console.log('='.repeat(80));

const outputDir = path.join(__dirname, 'output', 'generated');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

commands.forEach((cmd, idx) => {
  console.log(`\n${idx + 1}. ${cmd.substring(0, 70)}...`);
  
  try {
    const params = parseCommand(cmd);
    const xml = generateMusicXML(params);
    
    // Generate descriptive filename
    let filename;
    if (params.multiScale && params.segments) {
      const first = params.segments[0];
      const last = params.segments[params.segments.length - 1];
      const root = `${first.root}-to-${last.root}`.replace(/#/g, 'sharp').replace(/b/g, 'flat');
      const scale = `${first.scale}-to-${last.scale}`;
      filename = `${root}-${scale}-quartal-${params.stackType === '3-note' ? '3note' : '4note'}-${params.bars}bars-${params.tempo}bpm-${Date.now()}.musicxml`;
    } else {
      const root = (params.root || 'C').replace(/#/g, 'sharp').replace(/b/g, 'flat');
      filename = `${root}-${params.scale || 'major'}-quartal-${params.stackType === '3-note' ? '3note' : '4note'}-${params.bars}bars-${params.tempo}bpm-${Date.now()}.musicxml`;
    }
    
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, xml, 'utf8');
    
    // Verify the file
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
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
    
    console.log(`   ✓ File: ${filename}`);
    console.log(`   ✓ Measures: ${measures.length} (expected: ${params.bars})`);
    console.log(`   ✓ Notes: ${totalNotes} (expected: ${expectedNotes})`);
    console.log(`   ✓ Notes per measure: ${notesPerMeasure.slice(0, 5).join(', ')}${notesPerMeasure.length > 5 ? '...' : ''}`);
    console.log(`   ✓ Tempo: ${params.tempo} bpm`);
    console.log(`   ✓ File path: ${filepath}`);
    
    if (measures.length === params.bars && totalNotes === expectedNotes) {
      console.log(`   ✅ PASS - File is complete!`);
    } else {
      console.log(`   ✗ FAIL - File is incomplete!`);
    }
    
  } catch (error) {
    console.log(`   ✗ ERROR: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('✅ Verification complete!');
console.log('\nOpen the generated files in Sibelius or Guitar Pro 8 to verify they display correctly.');

