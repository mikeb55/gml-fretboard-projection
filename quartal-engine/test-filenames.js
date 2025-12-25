/**
 * Test filename generation
 */

function generateFilename(params) {
  // Sanitize root note (replace # with sharp, b with flat for filename safety)
  const root = params.root.replace(/#/g, 'sharp').replace(/b/g, 'flat');
  
  // Get scale name
  const scale = params.scale;
  
  // Get stack type (3note or 4note)
  const stackType = params.stackType === '3-note' ? '3note' : '4note';
  
  // Get bar count
  const bars = params.bars;
  
  // Add "fullscale" indicator if it's a full 7-bar harmonization
  const fullscale = bars === 7 ? '-fullscale' : '';
  
  // Get timestamp for uniqueness
  const timestamp = Date.now();
  
  // Build filename
  const filename = `${root}-${scale}-quartal-${stackType}-${bars}bars${fullscale}-${timestamp}.musicxml`;
  
  return filename;
}

const examples = [
  { root: 'C', scale: 'major', stackType: '3-note', bars: 7 },
  { root: 'D', scale: 'dorian', stackType: '3-note', bars: 4 },
  { root: 'F#', scale: 'lydian', stackType: '4-note', bars: 1 },
  { root: 'A', scale: 'minor', stackType: '3-note', bars: 8 },
  { root: 'G', scale: 'mixolydian', stackType: '4-note', bars: 7 },
  { root: 'Bb', scale: 'major', stackType: '3-note', bars: 4 },
  { root: 'C#', scale: 'locrian', stackType: '3-note', bars: 7 },
  { root: 'Eb', scale: 'phrygian', stackType: '4-note', bars: 2 }
];

console.log('Example filenames with new descriptive format:\n');
examples.forEach((params, i) => {
  const filename = generateFilename(params);
  console.log(`${i + 1}. ${params.root} ${params.scale}, ${params.stackType}, ${params.bars} bars`);
  console.log(`   → ${filename}\n`);
});

console.log('\nFilename format: {root}-{scale}-quartal-{stackType}-{bars}bars{fullscale}-{timestamp}.musicxml');
console.log('Benefits:');
console.log('  - Clear indication of root note and scale');
console.log('  - Shows stack type (3note or 4note)');
console.log('  - Shows number of bars');
console.log('  - Indicates full scale harmonization (7 bars)');
console.log('  - Timestamp ensures uniqueness');


