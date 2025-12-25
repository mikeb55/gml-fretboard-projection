/**
 * Verify tempo is correctly included in MusicXML
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');

console.log('Verifying tempo in MusicXML output...\n');

// Test 1: No tempo specified (should default to 108)
const params1 = parseCommand('Generate C major quartals, 4 bars, quarter notes');
const xml1 = generateMusicXML(params1);
console.log('Test 1 (no tempo specified):');
console.log('  Parsed tempo:', params1.tempo);
console.log('  XML contains tempo:', xml1.includes('tempo='));
const match1 = xml1.match(/tempo="(\d+)"/);
console.log('  Tempo in XML:', match1 ? match1[1] : 'not found');
console.log('  Expected: 108');
console.log('  Result:', match1 && match1[1] === '108' ? '✓ PASS' : '✗ FAIL');
console.log('');

// Test 2: Explicit tempo (120 bpm)
const params2 = parseCommand('Generate D dorian quartals, 4 bars, quarter notes, 120 bpm');
const xml2 = generateMusicXML(params2);
console.log('Test 2 (120 bpm specified):');
console.log('  Parsed tempo:', params2.tempo);
console.log('  XML contains tempo:', xml2.includes('tempo='));
const match2 = xml2.match(/tempo="(\d+)"/);
console.log('  Tempo in XML:', match2 ? match2[1] : 'not found');
console.log('  Expected: 120');
console.log('  Result:', match2 && match2[1] === '120' ? '✓ PASS' : '✗ FAIL');
console.log('');

// Test 3: Multi-scale with tempo
const params3 = parseCommand('Generate C major bars 1-4, F lydian bars 5-8, 100 bpm');
const xml3 = generateMusicXML(params3);
console.log('Test 3 (multi-scale with 100 bpm):');
console.log('  Parsed tempo:', params3.tempo);
console.log('  XML contains tempo:', xml3.includes('tempo='));
const match3 = xml3.match(/tempo="(\d+)"/);
console.log('  Tempo in XML:', match3 ? match3[1] : 'not found');
console.log('  Expected: 100');
console.log('  Result:', match3 && match3[1] === '100' ? '✓ PASS' : '✗ FAIL');
console.log('');

// Show XML snippet for verification
console.log('XML snippet (first measure with tempo):');
const lines = xml2.split('\n');
const startIdx = lines.findIndex(l => l.includes('<measure number="1">'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('</measure>'));
if (startIdx >= 0 && endIdx >= 0) {
  console.log(lines.slice(startIdx, endIdx + 1).join('\n'));
}

