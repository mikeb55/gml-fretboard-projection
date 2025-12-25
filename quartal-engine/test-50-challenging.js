/**
 * Test 50 challenging commands - verify each generates multiple chords/measures
 */

const { parseCommand, generateMusicXML } = require('./quartal-cli-core');
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

// 50 challenging test commands covering various scenarios
const commands = [
  // Single scale, various durations
  'Generate C major quartals, 4 bars, quarter notes',
  'Generate D dorian quartals, 8 bars, half notes',
  'Generate E minor quartals, 7 bars, eighth notes',
  'Generate F lydian quartals, 6 bars, sixteenth notes',
  'Generate G mixolydian quartals, 12 bars, quarter notes',
  
  // 4-note quartals
  'Generate A minor 4-note quartals, 4 bars, quarter notes',
  'Generate B locrian 4-note quartals, 8 bars, half notes',
  'Generate C# phrygian 4-note quartals, 6 bars, eighth notes',
  'Generate Eb lydian 4-note quartals, 10 bars, sixteenth notes',
  
  // Multi-scale, 2 scales
  'Generate C major bars 1-4, F lydian bars 5-8',
  'Generate D dorian bars 1-6, A minor bars 7-12',
  'Generate E minor bars 1-8, B locrian bars 9-16',
  'Generate F lydian bars 1-3, C major bars 4-6',
  'Generate G mixolydian bars 1-5, D dorian bars 6-10',
  
  // Multi-scale, 3 scales
  'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12',
  'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6',
  'Generate E minor bars 1-3, B locrian bars 4-6, F lydian bars 7-9',
  'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12',
  'Generate Eb phrygian bars 1-3, Bb major bars 4-6, F lydian bars 7-9',
  
  // Multi-scale, 4 scales
  'Generate C major bars 1-2, F lydian bars 3-4, G mixolydian bars 5-6, Bb major bars 7-8',
  'Generate D dorian bars 1-3, A minor bars 4-6, E phrygian bars 7-9, B locrian bars 10-12',
  'Generate E minor bars 1-2, B locrian bars 3-4, F lydian bars 5-6, C major bars 7-8',
  
  // Multi-scale, 5 scales
  'Generate G mixolydian bars 1-2, D dorian bars 3-4, A minor bars 5-6, E phrygian bars 7-8, B locrian bars 9-10',
  'Generate C major bars 1-2, F lydian bars 3-4, G mixolydian bars 5-6, Bb major bars 7-8, Eb phrygian bars 9-10',
  
  // With tempo
  'Generate C major quartals, 4 bars, quarter notes, 120 bpm',
  'Generate D dorian quartals, 8 bars, half notes, tempo 90',
  'Generate E minor quartals, 6 bars, eighth notes, at 150',
  'Generate F lydian quartals, 4 bars, sixteenth notes, speed 80',
  'Generate C major bars 1-4, F lydian bars 5-8, 100 bpm',
  'Generate D dorian bars 1-6, A minor bars 7-12, tempo 140',
  
  // 4-note with tempo
  'Generate C major 4-note quartals, 4 bars, quarter notes, 120 bpm',
  'Generate D dorian 4-note quartals, 8 bars, half notes, tempo 90',
  'Generate E minor 4-note quartals, 6 bars, eighth notes, at 150',
  
  // Multi-scale 4-note
  'Generate C major 4-note bars 1-4, F lydian 4-note bars 5-8',
  'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6, 4-note quartals',
  'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, 4-note quartals, eighth notes',
  
  // Parentheses format
  'Generate C major (4 bars), F lydian (4 bars), G mixolydian (4 bars)',
  'Generate D dorian (2 bars), A minor (2 bars), E phrygian (2 bars)',
  'Generate E minor (3 bars), B locrian (3 bars), F lydian (3 bars), C major (3 bars)',
  
  // Dash format
  'Generate C major, F lydian, G mixolydian - 4 bars each',
  'Generate D dorian, A minor, E phrygian - 2 bars each',
  'Generate C major, F lydian, G mixolydian, Bb major, Eb phrygian - 4 bars each',
  
  // Complex combinations
  'Generate C major bars 1-4, F lydian bars 5-8, G mixolydian bars 9-12, 4-note quartals, eighth notes, tempo 140',
  'Generate D dorian bars 1-2, A minor bars 3-4, E phrygian bars 5-6, B locrian bars 7-8, F# lydian bars 9-10, sixteenth notes, at 180 bpm',
  'Generate C# locrian bars 1-4, F# lydian bars 5-8, B major bars 9-12, 4-note quartals, half notes, speed 60',
  'Generate Eb phrygian bars 1-3, Bb major bars 4-6, F lydian bars 7-9, C major bars 10-12, quarter notes, 120 bpm',
  'Generate G mixolydian bars 1-7, D dorian bars 8-14',
  'Generate C major bars 1-8, F lydian bars 9-16, quarter notes, tempo 100',
  'Generate A minor bars 1-6, D dorian bars 7-12, 4-note quartals, half notes, 90 bpm',
  'Generate B locrian bars 1-5, F lydian bars 6-10, C major bars 11-15, eighth notes, at 130',
];

console.log('Testing 50 Challenging Commands - Verifying Multiple Chords/Measures\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;
const failures = [];

commands.forEach((cmd, idx) => {
  try {
    const params = parseCommand(cmd);
    const xml = generateMusicXML(params);
    
    // Parse XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    // Check for parse errors
    const parseErrors = doc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      failed++;
      failures.push({ cmd: idx + 1, error: 'XML Parse Error', details: parseErrors[0].textContent });
      return;
    }
    
    // Count measures
    const measures = doc.getElementsByTagName('measure');
    let totalNotes = 0;
    const notesPerMeasure = [];
    
    for (let i = 0; i < measures.length; i++) {
      const measure = measures[i];
      const notes = measure.getElementsByTagName('note');
      const count = notes.length;
      notesPerMeasure.push(count);
      totalNotes += count;
    }
    
    const expectedNotes = params.bars * (params.stackType === '3-note' ? 3 : 4);
    
    // CRITICAL CHECK: Must have more than 1 measure
    if (measures.length <= 1) {
      failed++;
      failures.push({ 
        cmd: idx + 1, 
        cmdText: cmd.substring(0, 60),
        error: `Only ${measures.length} measure(s) generated (expected ${params.bars})`,
        measures: measures.length,
        expected: params.bars
      });
      if (idx < 5 || idx % 10 === 0) {
        console.log(`✗ Test ${idx + 1}: Only ${measures.length} measure(s) - FAIL`);
      }
      return;
    }
    
    // Verify counts
    if (measures.length === params.bars && totalNotes === expectedNotes) {
      passed++;
      if (idx < 5 || idx % 10 === 0) {
        console.log(`✓ Test ${idx + 1}: ${measures.length} measures, ${totalNotes} notes - PASS`);
      }
    } else {
      failed++;
      failures.push({ 
        cmd: idx + 1, 
        cmdText: cmd.substring(0, 60),
        error: `Count mismatch: ${measures.length} measures (expected ${params.bars}), ${totalNotes} notes (expected ${expectedNotes})`,
        measures: measures.length,
        expectedBars: params.bars,
        notes: totalNotes,
        expectedNotes: expectedNotes
      });
      if (idx < 5 || idx % 10 === 0) {
        console.log(`✗ Test ${idx + 1}: ${measures.length} measures (expected ${params.bars}) - FAIL`);
      }
    }
    
  } catch (error) {
    failed++;
    failures.push({ 
      cmd: idx + 1, 
      cmdText: cmd.substring(0, 60),
      error: error.message,
      stack: error.stack
    });
    if (idx < 5 || idx % 10 === 0) {
      console.log(`✗ Test ${idx + 1}: Error - ${error.message}`);
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed out of ${commands.length} tests`);
console.log('='.repeat(80));

if (failed > 0) {
  console.log('\nFailures (first 10):');
  failures.slice(0, 10).forEach((f, i) => {
    console.log(`\n${i + 1}. Test ${f.cmd}: ${f.cmdText}...`);
    console.log(`   Error: ${f.error}`);
    if (f.measures !== undefined) {
      console.log(`   Measures: ${f.measures} (expected: ${f.expected || f.expectedBars})`);
    }
    if (f.notes !== undefined) {
      console.log(`   Notes: ${f.notes} (expected: ${f.expectedNotes})`);
    }
  });
  
  if (failures.length > 10) {
    console.log(`\n... and ${failures.length - 10} more failures`);
  }
}

// Summary
console.log('\n' + '='.repeat(80));
if (failed === 0) {
  console.log('✅ ALL 50 TESTS PASSED!');
  console.log('✅ All commands generated multiple chords/measures correctly!');
  process.exit(0);
} else {
  console.log(`❌ ${failed} test(s) failed`);
  console.log(`✅ ${passed} test(s) passed`);
  
  // Check if any failed due to only 1 measure
  const singleMeasureFailures = failures.filter(f => f.measures === 1);
  if (singleMeasureFailures.length > 0) {
    console.log(`\n⚠️  ${singleMeasureFailures.length} test(s) generated only 1 measure (CRITICAL ISSUE)`);
  }
  
  process.exit(1);
}

