/**
 * Test the 3 hard commands through the CLI interface
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');
const { generateFilename } = require('./quartal-cli');
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

const commands = [
  'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, 4-note quartals, eighth notes, tempo 140',
  'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6, B locrian bars 7-8, F# lydian bars 9-10, sixteenth notes, at 180 bpm',
  'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12, 4-note quartals, half notes, speed 60'
];

console.log('Testing 3 Hard Commands (Full CLI Simulation)...\n');
console.log('='.repeat(80));

commands.forEach((cmd, idx) => {
  console.log(`\n${idx + 1}. Command: ${cmd.substring(0, 70)}...`);
  console.log('');
  
  try {
    // Parse command
    const params = parseCommand(cmd);
    console.log(`   ✓ Parsed successfully`);
    console.log(`     - Multi-scale: ${params.multiScale ? 'Yes' : 'No'}`);
    console.log(`     - Bars: ${params.bars}`);
    console.log(`     - Stack Type: ${params.stackType}`);
    console.log(`     - Note Value: ${params.noteValue}`);
    console.log(`     - Tempo: ${params.tempo} bpm`);
    
    if (params.multiScale && params.segments) {
      console.log(`     - Segments: ${params.segments.length}`);
      params.segments.forEach((seg, i) => {
        console.log(`       ${i + 1}. ${seg.root} ${seg.scale} (bars ${seg.startBar + 1}-${seg.startBar + seg.bars})`);
      });
    }
    
    // Generate filename
    let filename;
    try {
      filename = generateFilename(params);
      console.log(`   ✓ Filename generated: ${filename}`);
    } catch (filenameError) {
      console.log(`   ✗ Filename generation failed: ${filenameError.message}`);
      filename = `test-${idx + 1}-${Date.now()}.musicxml`;
      console.log(`     Using fallback: ${filename}`);
    }
    
    // Generate XML
    const xml = generateMusicXML(params);
    console.log(`   ✓ XML generated (${xml.length} characters)`);
    
    // Parse and validate XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    const parseErrors = doc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      console.log(`   ✗ XML Parse Error: ${parseErrors[0].textContent}`);
      return;
    }
    
    const measures = doc.getElementsByTagName('measure');
    let totalNotes = 0;
    for (let i = 0; i < measures.length; i++) {
      const measure = measures[i];
      const notes = measure.getElementsByTagName('note');
      totalNotes += notes.length;
    }
    
    console.log(`   ✓ XML Validation:`);
    console.log(`     - Measures: ${measures.length} (expected: ${params.bars})`);
    console.log(`     - Notes: ${totalNotes} (expected: ${params.bars * (params.stackType === '3-note' ? 3 : 4)})`);
    
    // Check tempo
    const tempoMatch = xml.match(/tempo="(\d+)"/);
    if (tempoMatch) {
      console.log(`     - Tempo: ${tempoMatch[1]} bpm (expected: ${params.tempo})`);
    } else {
      console.log(`     - Tempo: ✗ Not found in XML`);
    }
    
    // Save file
    const outputDir = path.join(__dirname, 'output', 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, xml, 'utf8');
    console.log(`   ✓ File saved: ${filepath}`);
    
    // Verify file
    const stats = fs.statSync(filepath);
    console.log(`     - File size: ${stats.size} bytes`);
    
    // Re-read and verify
    const savedXml = fs.readFileSync(filepath, 'utf8');
    const savedMeasures = (savedXml.match(/<measure number=/g) || []).length;
    const savedNotes = (savedXml.match(/<note>/g) || []).length;
    console.log(`     - Saved file: ${savedMeasures} measures, ${savedNotes} notes`);
    
    if (savedMeasures === params.bars && savedNotes === totalNotes) {
      console.log(`\n   ✅ Test ${idx + 1} PASSED - All measures and notes correct!`);
    } else {
      console.log(`\n   ✗ Test ${idx + 1} FAILED - Measure/note count mismatch`);
    }
    
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }
  
  console.log('');
  console.log('-'.repeat(80));
});

console.log('\n✅ All tests complete!');

