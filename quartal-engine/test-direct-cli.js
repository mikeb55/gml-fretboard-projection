/**
 * Test the CLI directly with one of the hard commands
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');
const fs = require('fs');
const path = require('path');

const cmd = 'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, 4-note quartals, eighth notes, tempo 140';

console.log('Testing command:', cmd);
console.log('='.repeat(80));

try {
  console.log('\n1. Parsing command...');
  const params = parseCommand(cmd);
  console.log('   ✓ Parsed');
  console.log('   - Multi-scale:', params.multiScale);
  console.log('   - Bars:', params.bars);
  console.log('   - Segments:', params.segments ? params.segments.length : 'none');
  if (params.segments) {
    params.segments.forEach((seg, i) => {
      console.log(`     ${i + 1}. ${seg.root} ${seg.scale} (bars ${seg.startBar + 1}-${seg.startBar + seg.bars})`);
    });
  }
  
  console.log('\n2. Generating XML...');
  let xml;
  try {
    xml = generateMusicXML(params);
    console.log('   ✓ Generated');
    console.log('   - Length:', xml.length, 'characters');
  } catch (genError) {
    console.log('   ✗ Error:', genError.message);
    console.log('   Stack:', genError.stack);
    process.exit(1);
  }
  
  console.log('\n3. Validating XML structure...');
  const measureMatches = xml.match(/<measure number=/g) || [];
  const noteMatches = xml.match(/<note>/g) || [];
  const measureCloseMatches = xml.match(/<\/measure>/g) || [];
  const partCloseMatches = xml.match(/<\/part>/g) || [];
  const scoreCloseMatches = xml.match(/<\/score-partwise>/g) || [];
  
  console.log('   - <measure number= tags:', measureMatches.length);
  console.log('   - </measure> tags:', measureCloseMatches.length);
  console.log('   - <note> tags:', noteMatches.length);
  console.log('   - </part> tags:', partCloseMatches.length);
  console.log('   - </score-partwise> tags:', scoreCloseMatches.length);
  
  if (measureMatches.length !== params.bars) {
    console.log(`   ✗ ERROR: Expected ${params.bars} measures, found ${measureMatches.length}`);
  } else {
    console.log(`   ✓ Correct number of measures`);
  }
  
  const expectedNotes = params.bars * 4;
  if (noteMatches.length !== expectedNotes) {
    console.log(`   ✗ ERROR: Expected ${expectedNotes} notes, found ${noteMatches.length}`);
  } else {
    console.log(`   ✓ Correct number of notes`);
  }
  
  // Check if XML is well-formed
  console.log('\n4. Checking XML structure...');
  const hasOpening = xml.includes('<score-partwise');
  const hasClosing = xml.includes('</score-partwise>');
  const hasPartOpening = xml.includes('<part id="P1">');
  const hasPartClosing = xml.includes('</part>');
  
  console.log('   - Has <score-partwise>:', hasOpening);
  console.log('   - Has </score-partwise>:', hasClosing);
  console.log('   - Has <part id="P1">:', hasPartOpening);
  console.log('   - Has </part>:', hasPartClosing);
  
  if (!hasOpening || !hasClosing || !hasPartOpening || !hasPartClosing) {
    console.log('   ✗ ERROR: XML structure is incomplete!');
  } else {
    console.log('   ✓ XML structure is complete');
  }
  
  // Check measure sequence
  console.log('\n5. Checking measure sequence...');
  for (let i = 1; i <= Math.min(5, params.bars); i++) {
    const measureOpen = xml.includes(`<measure number="${i}">`);
    const measureClose = xml.includes('</measure>');
    console.log(`   - Measure ${i}: ${measureOpen ? '✓' : '✗'} opening tag`);
  }
  
  // Save file
  console.log('\n6. Saving file...');
  const outputDir = path.join(__dirname, 'output', 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const filename = `direct-test-${Date.now()}.musicxml`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, xml, 'utf8');
  console.log('   ✓ Saved to:', filepath);
  
  // Verify saved file
  console.log('\n7. Verifying saved file...');
  const savedXml = fs.readFileSync(filepath, 'utf8');
  const savedMeasures = (savedXml.match(/<measure number=/g) || []).length;
  const savedNotes = (savedXml.match(/<note>/g) || []).length;
  console.log('   - Measures in saved file:', savedMeasures);
  console.log('   - Notes in saved file:', savedNotes);
  console.log('   - File size:', fs.statSync(filepath).size, 'bytes');
  
  if (savedMeasures === params.bars && savedNotes === expectedNotes) {
    console.log('\n✅ SUCCESS: File is complete with all measures!');
  } else {
    console.log('\n❌ FAILURE: File is incomplete!');
    console.log(`   Expected: ${params.bars} measures, ${expectedNotes} notes`);
    console.log(`   Got: ${savedMeasures} measures, ${savedNotes} notes`);
  }
  
} catch (error) {
  console.log('\n❌ FATAL ERROR:', error.message);
  console.log('Stack:', error.stack);
  process.exit(1);
}

