/**
 * Quartal Engine v1.0 Generator
 * Generates MusicXML from scale/mode input
 */

const fs = require('fs');
const path = require('path');

// Scale degree mappings
const SCALE_DEGREES = {
  ionian: [0, 2, 4, 5, 7, 9, 11],      // C, D, E, F, G, A, B
  dorian: [0, 2, 3, 5, 7, 9, 10],      // C, D, Eb, F, G, A, Bb
  phrygian: [0, 1, 3, 5, 7, 8, 10],    // C, Db, Eb, F, G, Ab, Bb
  lydian: [0, 2, 4, 6, 7, 9, 11],      // C, D, E, F#, G, A, B
  mixolydian: [0, 2, 4, 5, 7, 9, 10],  // C, D, E, F, G, A, Bb
  aeolian: [0, 2, 3, 5, 7, 8, 10],     // C, D, Eb, F, G, Ab, Bb
  locrian: [0, 1, 3, 5, 6, 8, 10]      // C, Db, Eb, F, Gb, Ab, Bb
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Guitar tuning (MIDI notes)
const TUNING = [40, 45, 50, 55, 59, 64]; // EADGBE

function getPitchClass(noteName) {
  const sharpIdx = NOTE_NAMES.indexOf(noteName);
  if (sharpIdx >= 0) return sharpIdx;
  return FLAT_NAMES.indexOf(noteName);
}

function getNoteName(pitchClass, useFlats = false) {
  return useFlats ? FLAT_NAMES[pitchClass] : NOTE_NAMES[pitchClass];
}

function getScalePitchClasses(scale, root) {
  const modeMap = {
    'major': 'ionian',
    'minor': 'aeolian',
    'dorian': 'dorian',
    'mixolydian': 'mixolydian',
    'lydian': 'lydian',
    'phrygian': 'phrygian',
    'locrian': 'locrian'
  };
  
  const mode = modeMap[scale] || 'ionian';
  const degrees = SCALE_DEGREES[mode];
  const rootPc = getPitchClass(root);
  
  return degrees.map(deg => (rootPc + deg) % 12);
}

function generateQuartalStack(scalePcs, stackRootIndex, stackType) {
  const n = stackRootIndex;
  const n3 = (n + 3) % 7;
  const n6 = (n + 6) % 7;
  const n9 = (n + 9) % 7;
  
  if (stackType === '3-note') {
    return [scalePcs[n], scalePcs[n3], scalePcs[n6]];
  } else {
    return [scalePcs[n], scalePcs[n3], scalePcs[n6], scalePcs[n9]];
  }
}

function findGuitarPosition(pitchClass, stringIndex, minFret, maxFret) {
  const openNote = TUNING[stringIndex] % 12;
  for (let fret = minFret; fret <= maxFret; fret++) {
    const note = (openNote + fret) % 12;
    if (note === pitchClass) {
      return { fret, midiNote: TUNING[stringIndex] + fret };
    }
  }
  return null;
}

function generateMusicXML(fixture) {
  const input = fixture.input;
  const scale = input.scale;
  const root = input.root;
  const stackType = input.stackType || '3-note';
  const bars = input.bars || 1;
  const noteValue = input.noteValue || 'quarter';
  
  const scalePcs = getScalePitchClasses(scale, root);
  const rootPc = getPitchClass(root);
  
  // Determine divisions based on note value
  const divisions = noteValue === 'quarter' ? 1 : 2;
  const noteType = noteValue === 'quarter' ? 'quarter' : 'eighth';
  
  // Generate quartal stacks
  const stacks = [];
  for (let bar = 0; bar < bars; bar++) {
    const stackRootIndex = bar % 7; // Cycle through scale degrees
    const stack = generateQuartalStack(scalePcs, stackRootIndex, stackType);
    stacks.push(stack);
  }
  
  // Build MusicXML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Guitar</part-name>
    </score-part>
  </part-list>
  <part id="P1">`;
  
  for (let bar = 0; bar < bars; bar++) {
    xml += `
    <measure number="${bar + 1}">
      <attributes>
        <divisions>${divisions}</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>`;
    
    const stack = stacks[bar];
    const numVoices = stack.length;
    
    // Place notes on guitar (simplified - use string set 6-5-4 or 6-5-4-3)
    const stringSet = numVoices === 3 ? [5, 4, 3] : [5, 4, 3, 2];
    const anchorFret = 5; // Mid-neck position
    
    for (let voice = 0; voice < numVoices; voice++) {
      const pitchClass = stack[voice];
      const stringIndex = stringSet[voice];
      const position = findGuitarPosition(pitchClass, stringIndex, anchorFret - 2, anchorFret + 2);
      
      if (position) {
        const midiNote = position.midiNote;
        const octave = Math.floor(midiNote / 12) - 1;
        const noteName = getNoteName(pitchClass, scale === 'dorian' || scale === 'minor');
        const step = noteName.replace(/[#b]/, '');
        const alter = noteName.includes('#') ? 1 : (noteName.includes('b') ? -1 : null);
        
        xml += `
      <note>
        <pitch>`;
        xml += `
          <step>${step}</step>`;
        if (alter !== null) {
          xml += `
          <alter>${alter}</alter>`;
        }
        xml += `
          <octave>${octave}</octave>
        </pitch>
        <duration>${divisions}</duration>
        <type>${noteType}</type>
        <voice>${voice + 1}</voice>
      </note>`;
      }
    }
    
    xml += `
    </measure>`;
  }
  
  xml += `
  </part>
</score-partwise>`;
  
  return xml;
}

// Main execution
if (require.main === module) {
  const fixtureFile = process.argv[2];
  if (!fixtureFile) {
    console.error('Usage: node generate_v1.0.js <fixture.json>');
    process.exit(1);
  }
  
  const fixturePath = path.join(__dirname, 'tests', 'fixtures', fixtureFile);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  
  const xml = generateMusicXML(fixture);
  
  const outputFile = fixtureFile.replace('.json', '.musicxml').replace('fixture_', 'output_');
  const outputPath = path.join(__dirname, 'output', 'v1.0', outputFile);
  
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Generated: ${outputPath}`);
}

module.exports = { generateMusicXML };

