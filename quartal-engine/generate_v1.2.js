/**
 * Quartal Engine v1.2 Generator
 * Extends v1.1 with taste-control switches
 */

const fs = require('fs');
const path = require('path');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

// Import v1.1 functions
const v1_1 = require('./generate_v1.1');

// Reuse scale functions
const SCALE_DEGREES = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const TUNING = [40, 45, 50, 55, 59, 64];

function getPitchClass(noteName) {
  const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const sharpIdx = NOTE_NAMES.indexOf(noteName);
  if (sharpIdx >= 0) return sharpIdx;
  return FLAT_NAMES.indexOf(noteName);
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

function hasTritone(pitchClass1, pitchClass2) {
  const interval = Math.abs(pitchClass1 - pitchClass2);
  return interval === 6 || interval === 6;
}

function harmonizeMelodyV1_2(melodyXml, fixture) {
  // Use v1.1 as base, then apply v1.2 switches
  const input = fixture.input;
  
  // Defaults (maintain v1.1 behavior)
  const density = input.density || 3;
  const tritonePolicy = input.tritonePolicy || 'allow';
  const registerConstraint = input.registerConstraint || 'none';
  const stringSet = input.stringSet || 'auto';
  
  // Parse melody (same as v1.1)
  const parser = new DOMParser();
  const doc = parser.parseFromString(melodyXml, 'text/xml');
  const measures = doc.getElementsByTagName('measure');
  const melodyNotes = [];
  
  for (let i = 0; i < measures.length; i++) {
    const measure = measures[i];
    const notes = measure.getElementsByTagName('note');
    for (let j = 0; j < notes.length; j++) {
      const note = notes[j];
      const step = note.getElementsByTagName('step')[0]?.textContent;
      const alter = note.getElementsByTagName('alter')[0]?.textContent;
      const octave = note.getElementsByTagName('octave')[0]?.textContent;
      const duration = note.getElementsByTagName('duration')[0]?.textContent;
      const type = note.getElementsByTagName('type')[0]?.textContent;
      
      if (step && octave) {
        let noteName = step;
        if (alter === '1') noteName += '#';
        if (alter === '-1') noteName += 'b';
        const pitchClass = getPitchClass(noteName);
        const midiNote = (parseInt(octave) + 1) * 12 + pitchClass;
        
        melodyNotes.push({
          step,
          alter: alter ? parseInt(alter) : null,
          octave: parseInt(octave),
          pitchClass,
          midiNote,
          duration,
          type,
          xmlNode: note
        });
      }
    }
  }
  
  const scale = fixture.input.governingScale;
  const root = fixture.input.root;
  const scalePcs = getScalePitchClasses(scale, root);
  
  // Group notes by measure
  const notesByMeasure = {};
  for (let i = 0; i < melodyNotes.length; i++) {
    const melodyNote = melodyNotes[i];
    const xmlNode = melodyNote.xmlNode;
    let measure = xmlNode.parentNode;
    while (measure && measure.nodeName !== 'measure') {
      measure = measure.parentNode;
    }
    
    if (measure) {
      const measureNum = Array.from(measures).indexOf(measure);
      if (!notesByMeasure[measureNum]) {
        notesByMeasure[measureNum] = [];
      }
      notesByMeasure[measureNum].push({ ...melodyNote, measure });
    }
  }
  
  // Process each measure with v1.2 switches
  for (const measureNum in notesByMeasure) {
    const measure = notesByMeasure[measureNum][0].measure;
    const measureNotes = notesByMeasure[measureNum];
    
    for (let i = 0; i < measureNotes.length; i++) {
      const melodyNote = measureNotes[i];
      const melodyPc = melodyNote.pitchClass;
      
      // Find quartal stack (same as v1.1)
      let bestStack = null;
      for (let n = 0; n < 7; n++) {
        const n3 = (n + 3) % 7;
        const n6 = (n + 6) % 7;
        const stack = [scalePcs[n], scalePcs[n3], scalePcs[n6]];
        if (stack.includes(melodyPc)) {
          bestStack = stack;
          break;
        }
      }
      
      if (!bestStack) {
        const melodyDegree = scalePcs.indexOf(melodyPc);
        if (melodyDegree >= 0) {
          const n = melodyDegree;
          const n3 = (n + 3) % 7;
          const n6 = (n + 6) % 7;
          bestStack = [scalePcs[n], scalePcs[n3], scalePcs[n6]];
        } else {
          bestStack = [scalePcs[0], scalePcs[3], scalePcs[6]];
        }
      }
      
      // Apply v1.2 switches
      let harmonyPcs = bestStack.filter(pc => pc !== melodyPc);
      
      // Apply tritone policy
      if (tritonePolicy !== 'allow') {
        harmonyPcs = harmonyPcs.filter(pc => {
          if (tritonePolicy === 'avoid-top' && pc === harmonyPcs[harmonyPcs.length - 1]) {
            return !hasTritone(melodyPc, pc);
          }
          if (tritonePolicy === 'avoid-internal' && pc !== harmonyPcs[0] && pc !== harmonyPcs[harmonyPcs.length - 1]) {
            return !hasTritone(melodyPc, pc);
          }
          if (tritonePolicy === 'avoid-all') {
            return !hasTritone(melodyPc, pc);
          }
          return true;
        });
      }
      
      // Apply density
      harmonyPcs = harmonyPcs.slice(0, density - 1);
      
      // Determine string set
      let targetStringSet;
      if (stringSet === 'auto') {
        targetStringSet = harmonyPcs.length === 2 ? [4, 3] : [5, 4, 3];
      } else {
        const stringMap = {
          '6-5-4': [5, 4, 3],
          '5-4-3': [4, 3, 2],
          '4-3-2': [3, 2, 1],
          '3-2-1': [2, 1, 0]
        };
        targetStringSet = stringMap[stringSet] || [5, 4, 3];
      }
      
      // Add harmony notes
      for (let h = 0; h < harmonyPcs.length; h++) {
        const harmonyPc = harmonyPcs[h];
        const harmonyNote = doc.createElement('note');
        
        const noteName = NOTE_NAMES[harmonyPc];
        const step = noteName.replace(/[#]/, '');
        const alter = noteName.includes('#') ? '1' : null;
        
        // Apply register constraint
        let octave = melodyNote.octave - 1;
        if (registerConstraint === 'low-register') {
          octave = Math.max(2, octave);
        } else if (registerConstraint === 'mid-register') {
          octave = Math.max(3, Math.min(4, octave));
        } else if (registerConstraint === 'high-register') {
          octave = Math.min(5, octave + 1);
        }
        
        const pitch = doc.createElement('pitch');
        const stepEl = doc.createElement('step');
        stepEl.textContent = step;
        pitch.appendChild(stepEl);
        
        if (alter) {
          const alterEl = doc.createElement('alter');
          alterEl.textContent = alter;
          pitch.appendChild(alterEl);
        }
        
        const octaveEl = doc.createElement('octave');
        octaveEl.textContent = octave.toString();
        pitch.appendChild(octaveEl);
        
        harmonyNote.appendChild(pitch);
        
        const duration = doc.createElement('duration');
        duration.textContent = melodyNote.duration;
        harmonyNote.appendChild(duration);
        
        const type = doc.createElement('type');
        type.textContent = melodyNote.type;
        harmonyNote.appendChild(type);
        
        const voice = doc.createElement('voice');
        voice.textContent = (h + 2).toString();
        harmonyNote.appendChild(voice);
        
        measure.appendChild(harmonyNote);
      }
      
      // Ensure melody note has voice 1
      const voiceEl = melodyNote.xmlNode.getElementsByTagName('voice')[0];
      if (voiceEl) {
        voiceEl.textContent = '1';
      } else {
        const voice = doc.createElement('voice');
        voice.textContent = '1';
        melodyNote.xmlNode.appendChild(voice);
      }
    }
  }
  
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

// Main execution
if (require.main === module) {
  const fixtureFile = process.argv[2];
  if (!fixtureFile) {
    console.error('Usage: node generate_v1.2.js <fixture.json>');
    process.exit(1);
  }
  
  const fixturePath = path.join(__dirname, 'tests', 'fixtures', fixtureFile);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  
  const melodyFile = fixture.input.melodyFile;
  const melodyPath = path.join(__dirname, 'tests', 'fixtures', melodyFile);
  const melodyXml = fs.readFileSync(melodyPath, 'utf8');
  
  const harmonizedXml = harmonizeMelodyV1_2(melodyXml, fixture);
  
  const outputFile = fixtureFile.replace('.json', '.musicxml').replace('fixture_', 'output_');
  const outputPath = path.join(__dirname, 'output', 'v1.2', outputFile);
  
  fs.writeFileSync(outputPath, harmonizedXml, 'utf8');
  console.log(`Generated: ${outputPath}`);
}

module.exports = { harmonizeMelodyV1_2 };

