/**
 * Test the 5 example commands
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');

const examples = [
  ['Generate a musicxml of the C major scale harmonised as quartals', 7, 21],
  ['Generate D dorian quartals, 4 bars', 4, 12],
  ['Generate F# lydian 4-note quartal stacks', 1, 4],
  ['Generate A minor quartals, 8 bars', 8, 24],
  ['Generate a musicxml of the G mixolydian scale harmonised as 4-note quartals', 7, 28]
];

console.log('Testing 5 example commands:\n');

let allPassed = true;

examples.forEach(([cmd, expBars, expNotes], i) => {
  try {
    const params = parseCommand(cmd);
    const xml = generateMusicXML(params);
    const notes = (xml.match(/<note>/g) || []).length;
    const bars = (xml.match(/<measure number=/g) || []).length;
    const pass = notes === expNotes && bars === expBars;
    
    console.log(`${i + 1}. ${pass ? '✓' : '✗'} ${cmd.substring(0, 60)}`);
    console.log(`   Expected: ${expBars} bars, ${expNotes} notes | Got: ${bars} bars, ${notes} notes`);
    
    if (!pass) {
      allPassed = false;
    }
  } catch (e) {
    console.error(`${i + 1}. ✗ ERROR: ${e.message}`);
    allPassed = false;
  }
});

console.log('\n' + (allPassed ? '✅ All 5 examples work correctly!' : '❌ Some examples failed'));

process.exit(allPassed ? 0 : 1);
