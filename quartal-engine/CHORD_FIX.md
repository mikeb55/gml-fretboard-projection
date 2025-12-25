# Chord vs Arpeggio Fix

## Problem Identified

When generating quartal harmony, the output was appearing as **arpeggios** (notes playing sequentially) instead of **chords** (notes playing simultaneously) in Sibelius.

## Root Cause

The MusicXML was assigning different voice numbers to each note:
- First note: `<voice>1</voice>`
- Second note: `<voice>2</voice>`
- Third note: `<voice>3</voice>`

In MusicXML, different voice numbers indicate separate melodic lines, causing notes to play sequentially (arpeggiated).

## Solution

To make notes play simultaneously as a chord in MusicXML:

1. **All notes must be in the same voice** (all use `<voice>1</voice>`)
2. **All notes after the first must have a `<chord/>` tag**

### Fixed Code

```javascript
// Generate notes for ALL positions
for (let voice = 0; voice < stack.length; voice++) {
  // ... pitch calculation ...
  
  xml += `<note>`;
  // Add <chord/> tag to all notes after the first one
  if (voice > 0) {
    xml += `<chord/>`;
  }
  xml += `
    <pitch>...</pitch>
    <duration>${noteDuration}</duration>
    <type>${noteType}</type>
    <voice>1</voice>  // All notes in voice 1
  </note>`;
}
```

## Result

Now the output correctly generates:
- All notes in voice 1
- `<chord/>` tags on notes 2, 3, 4 (for 3-note and 4-note quartals)
- Notes play simultaneously as chords, not arpeggios

## Testing

Command: `Generate D dorian quartals, 4 bars, quarter notes`

**Before Fix:**
- Notes had voices 1, 2, 3 → Played as arpeggios

**After Fix:**
- All notes in voice 1
- Chord tags on notes 2, 3 → Plays as simultaneous chords

## MusicXML Chord Structure

For a 3-note quartal chord:
```xml
<note>
  <pitch>...</pitch>
  <duration>1</duration>
  <type>quarter</type>
  <voice>1</voice>
</note>
<note>
  <chord/>  <!-- This makes it part of the previous chord -->
  <pitch>...</pitch>
  <duration>1</duration>
  <type>quarter</type>
  <voice>1</voice>
</note>
<note>
  <chord/>  <!-- This makes it part of the previous chord -->
  <pitch>...</pitch>
  <duration>1</duration>
  <type>quarter</type>
  <voice>1</voice>
</note>
```

This structure ensures all three notes play simultaneously as a chord.


