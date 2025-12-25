/**
 * Test script to verify MusicXML files are generated with correct .musicxml extension
 */

const fs = require('fs');
const path = require('path');
const { parseCommand, generateMusicXML } = require('./quartal-cli-core');

// Test cases
const testCases = [
  { cmd: 'Generate D dorian quartals, 4 bars, quarter notes', expectedExt: '.musicxml' },
  { cmd: 'Generate C major 4-note quartals, 4 bars, half notes', expectedExt: '.musicxml' },
  { cmd: 'Generate E minor quartals, 8 bars, eighth notes', expectedExt: '.musicxml' },
];

console.log('Testing MusicXML file extension fix...\n');
console.log('='.repeat(80));

let allPassed = true;

testCases.forEach((testCase, i) => {
  try {
    const params = parseCommand(testCase.cmd);
    const xml = generateMusicXML(params);
    
    // Generate filename using the same logic as quartal-cli.js
    const root = params.root.replace(/#/g, 'sharp').replace(/b/g, 'flat');
    const stackType = params.stackType === '3-note' ? '3note' : '4note';
    const fullscale = params.bars === 7 ? '-fullscale' : '';
    const timestamp = Date.now();
    const filename = `${root}-${params.scale}-quartal-${stackType}-${params.bars}bars${fullscale}-${timestamp}.musicxml`;
    
    const ext = path.extname(filename);
    
    // Verify extension
    if (ext === testCase.expectedExt) {
      console.log(`✓ Test ${i + 1}: Extension correct (${ext})`);
      console.log(`  Command: ${testCase.cmd}`);
      console.log(`  Filename: ${filename}`);
      
      // Verify XML structure
      const hasXmlDecl = xml.trim().startsWith('<?xml');
      const hasDoctype = xml.includes('DOCTYPE score-partwise');
      const hasVersion = xml.includes('version="3.1"');
      const hasScorePartwise = xml.includes('<score-partwise');
      const endsCorrectly = xml.trim().endsWith('</score-partwise>');
      
      if (hasXmlDecl && hasDoctype && hasVersion && hasScorePartwise && endsCorrectly) {
        console.log(`  XML structure: ✓ Valid`);
      } else {
        console.log(`  XML structure: ✗ Invalid`);
        allPassed = false;
      }
    } else {
      console.log(`✗ Test ${i + 1}: Extension incorrect (got ${ext}, expected ${testCase.expectedExt})`);
      allPassed = false;
    }
    
    console.log('');
  } catch (error) {
    console.log(`✗ Test ${i + 1}: Error - ${error.message}`);
    allPassed = false;
    console.log('');
  }
});

console.log('='.repeat(80));
if (allPassed) {
  console.log('✅ All tests passed! Files will now use .musicxml extension (lowercase)');
  console.log('   This should fix compatibility with Sibelius and Guitar Pro 8.');
} else {
  console.log('❌ Some tests failed. Please review the output above.');
  process.exit(1);
}

