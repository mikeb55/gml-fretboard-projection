/**
 * Test tempo parsing and MusicXML output
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');

const testCases = [
  { cmd: 'Generate C major quartals, 4 bars, quarter notes', expectedTempo: 108, desc: 'No tempo specified (default 108)' },
  { cmd: 'Generate D dorian quartals, 4 bars, quarter notes, 120 bpm', expectedTempo: 120, desc: 'Tempo with "bpm" suffix' },
  { cmd: 'Generate E minor quartals, 4 bars, tempo 90', expectedTempo: 90, desc: 'Tempo with "tempo" prefix' },
  { cmd: 'Generate F lydian quartals, 4 bars, at 150', expectedTempo: 150, desc: 'Tempo with "at" prefix' },
  { cmd: 'Generate G mixolydian quartals, 4 bars, speed 80', expectedTempo: 80, desc: 'Tempo with "speed" prefix' },
  { cmd: 'Generate A minor quartals, 4 bars, 100 bpm', expectedTempo: 100, desc: 'Number before "bpm"' },
  { cmd: 'Generate C major bars 1-4, F lydian bars 5-8, 100 bpm', expectedTempo: 100, desc: 'Multi-scale with tempo' },
  { cmd: 'Generate D dorian bars 1-4, A minor bars 5-8, tempo 120', expectedTempo: 120, desc: 'Multi-scale with tempo prefix' },
  { cmd: 'Generate C major quartals, 4 bars, quarter notes, 200 bpm', expectedTempo: 200, desc: 'High tempo' },
  { cmd: 'Generate E minor quartals, 4 bars, quarter notes, 60 bpm', expectedTempo: 60, desc: 'Low tempo' },
];

console.log('Testing tempo parsing and MusicXML output...\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((testCase, i) => {
  try {
    const params = parseCommand(testCase.cmd);
    
    // Check parsed tempo
    if (params.tempo !== testCase.expectedTempo) {
      console.log(`✗ Test ${i + 1}: ${testCase.desc}`);
      console.log(`  Expected tempo: ${testCase.expectedTempo}, got: ${params.tempo}`);
      failed++;
      return;
    }
    
    // Check MusicXML output
    const xml = generateMusicXML(params);
    const tempoMatch = xml.match(/tempo="(\d+)"/);
    
    if (!tempoMatch) {
      console.log(`✗ Test ${i + 1}: ${testCase.desc}`);
      console.log(`  Tempo not found in MusicXML`);
      failed++;
      return;
    }
    
    const xmlTempo = parseInt(tempoMatch[1]);
    if (xmlTempo !== testCase.expectedTempo) {
      console.log(`✗ Test ${i + 1}: ${testCase.desc}`);
      console.log(`  Expected tempo in XML: ${testCase.expectedTempo}, got: ${xmlTempo}`);
      failed++;
      return;
    }
    
    passed++;
    if (i < 5 || i % 3 === 0) {
      console.log(`✓ Test ${i + 1}: ${testCase.desc}`);
      console.log(`  Tempo: ${params.tempo} bpm`);
    }
  } catch (error) {
    console.log(`✗ Test ${i + 1}: Error - ${error.message}`);
    console.log(`  Command: ${testCase.cmd.substring(0, 60)}...`);
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log('='.repeat(80));

if (failed === 0) {
  console.log('\n✅ All tempo tests passed!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed`);
  process.exit(1);
}

