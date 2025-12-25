/**
 * Test actual file output for the 3 hard commands
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

console.log('Testing actual file generation...\n');

commands.forEach((cmd, idx) => {
  console.log(`\n${idx + 1}. Testing: ${cmd.substring(0, 70)}...`);
  
  try {
    const params = parseCommand(cmd);
    console.log(`   Parsed: ${params.bars} bars, ${params.stackType}, ${params.noteValue}, ${params.tempo} bpm`);
    
    const xml = generateMusicXML(params);
    
    // Count measures and notes in XML string
    const measureMatches = xml.match(/<measure number=/g) || [];
    const noteMatches = xml.match(/<note>/g) || [];
    console.log(`   XML string: ${measureMatches.length} measures, ${noteMatches.length} notes`);
    
    // Parse XML and verify structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    // Check for parsing errors
    const parseErrors = doc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      console.log(`   ✗ XML Parse Error: ${parseErrors[0].textContent}`);
      return;
    }
    
    const measures = doc.getElementsByTagName('measure');
    console.log(`   Parsed XML: ${measures.length} measures found`);
    
    // Count notes in each measure
    let totalNotes = 0;
    for (let i = 0; i < measures.length; i++) {
      const measure = measures[i];
      const notes = measure.getElementsByTagName('note');
      const noteCount = notes.length;
      totalNotes += noteCount;
      if (i < 3) {
        console.log(`     Measure ${i + 1}: ${noteCount} notes`);
      }
    }
    console.log(`   Total notes in all measures: ${totalNotes}`);
    
    // Save file
    const outputDir = path.join(__dirname, 'output', 'test-actual');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filename = `test-${idx + 1}-${params.tempo}bpm.musicxml`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, xml, 'utf8');
    console.log(`   ✓ Saved to: ${filepath}`);
    
    // Verify file size
    const stats = fs.statSync(filepath);
    console.log(`   File size: ${stats.size} bytes`);
    
    if (measures.length !== params.bars) {
      console.log(`   ✗ ERROR: Expected ${params.bars} measures, got ${measures.length}`);
    } else {
      console.log(`   ✓ Correct number of measures`);
    }
    
    const expectedNotes = params.bars * (params.stackType === '3-note' ? 3 : 4);
    if (totalNotes !== expectedNotes) {
      console.log(`   ✗ ERROR: Expected ${expectedNotes} notes, got ${totalNotes}`);
    } else {
      console.log(`   ✓ Correct number of notes`);
    }
    
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }
});

console.log('\n✅ Testing complete!');

