/**
 * 3 Hard Example Commands for Testing Tempo
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');
const fs = require('fs');
const path = require('path');

const hardCommands = [
  {
    cmd: 'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, 4-note quartals, eighth notes, tempo 140',
    desc: 'Complex: 3 scales, 4-note stacks, eighth notes, fast tempo (140 bpm)'
  },
  {
    cmd: 'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6, B locrian bars 7-8, F# lydian bars 9-10, sixteenth notes, at 180 bpm',
    desc: 'Complex: 5 scales, 2 bars each, sixteenth notes, very fast tempo (180 bpm)'
  },
  {
    cmd: 'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12, 4-note quartals, half notes, speed 60',
    desc: 'Complex: 3 different keys, 4-note stacks, half notes, slow tempo (60 bpm)'
  }
];

console.log('Testing 3 Hard Example Commands with Tempo...\n');
console.log('='.repeat(80));

hardCommands.forEach((test, i) => {
  console.log(`\n${i + 1}. ${test.desc}`);
  console.log(`   Command: ${test.cmd}`);
  console.log('');
  
  try {
    const params = parseCommand(test.cmd);
    console.log(`   Parsed Parameters:`);
    console.log(`     - Multi-scale: ${params.multiScale ? 'Yes' : 'No'}`);
    if (params.multiScale) {
      console.log(`     - Segments: ${params.segments.length}`);
      params.segments.forEach((seg, idx) => {
        console.log(`       ${idx + 1}. ${seg.root} ${seg.scale} (bars ${seg.startBar + 1}-${seg.startBar + seg.bars})`);
      });
    } else {
      console.log(`     - Root: ${params.root}`);
      console.log(`     - Scale: ${params.scale}`);
    }
    console.log(`     - Bars: ${params.bars}`);
    console.log(`     - Stack Type: ${params.stackType}`);
    console.log(`     - Note Value: ${params.noteValue}`);
    console.log(`     - Tempo: ${params.tempo} bpm`);
    console.log('');
    
    const xml = generateMusicXML(params);
    
    // Verify tempo in XML
    const tempoMatch = xml.match(/tempo="(\d+)"/);
    const hasTempo = tempoMatch !== null;
    const xmlTempo = hasTempo ? parseInt(tempoMatch[1]) : null;
    
    console.log(`   MusicXML Validation:`);
    console.log(`     - Tempo in XML: ${hasTempo ? '✓ Yes' : '✗ No'}`);
    if (hasTempo) {
      console.log(`     - Tempo value: ${xmlTempo} bpm`);
      console.log(`     - Matches parsed: ${xmlTempo === params.tempo ? '✓ Yes' : '✗ No'}`);
    }
    
    // Count measures and notes
    const measures = (xml.match(/<measure number=/g) || []).length;
    const notes = (xml.match(/<note>/g) || []).length;
    const expectedNotes = params.bars * (params.stackType === '3-note' ? 3 : 4);
    
    console.log(`     - Measures: ${measures} (expected: ${params.bars})`);
    console.log(`     - Notes: ${notes} (expected: ${expectedNotes})`);
    console.log(`     - Validation: ${measures === params.bars && notes === expectedNotes ? '✓ PASS' : '✗ FAIL'}`);
    
    // Save file for manual inspection
    const filename = `test-hard-${i + 1}-${params.tempo}bpm-${Date.now()}.musicxml`;
    const filepath = path.join(__dirname, 'output', filename);
    if (!fs.existsSync(path.join(__dirname, 'output'))) {
      fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });
    }
    fs.writeFileSync(filepath, xml, 'utf8');
    console.log(`     - Saved to: ${filepath}`);
    
    console.log(`\n   ✓ Test ${i + 1} completed successfully!`);
    
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }
  
  console.log('');
  console.log('-'.repeat(80));
});

console.log('\n✅ All 3 hard example commands tested!');
console.log('\nYou can now:');
console.log('1. Open the generated .musicxml files in Sibelius or Guitar Pro 8');
console.log('2. Verify the tempo is correctly set');
console.log('3. Check that the note durations match the specified note values');
console.log('4. Verify all scales are correctly applied to their respective bars');

