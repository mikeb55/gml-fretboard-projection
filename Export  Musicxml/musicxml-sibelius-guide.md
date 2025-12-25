# 🎼 MusicXML Sibelius Export Codex
## The Definitive Guide for GML Projects

> **SAVE THIS DOCUMENT**: Place in `C:\Users\mike\Documents\gml-workspace\CODEX\musicxml-sibelius-guide.md`

---

## 🔴 CRITICAL: What Actually Works with Sibelius

After extensive testing and analysis of Dolet 8 (the official Sibelius MusicXML plugin), here are the **PROVEN REQUIREMENTS**:

### 1. XML Declaration
```xml
<?xml version='1.0' encoding='UTF-8' standalone='no'?>
```
- ✅ Single OR double quotes work
- ✅ UTF-8 encoding is fine (Dolet uses UTF-16 but UTF-8 works)
- ✅ Include `standalone='no'`

### 2. DOCTYPE - DO NOT USE!
```xml
<!-- NO DOCTYPE DECLARATION -->
```
- ❌ **NEVER include DOCTYPE** - Dolet doesn't use it
- ❌ Even though MusicXML spec suggests it, Sibelius doesn't need it

### 3. Divisions = 768
```xml
<divisions>768</divisions>
```
- ✅ **ALWAYS use 768** - this is what Dolet uses
- ✅ Gives finest resolution for complex rhythms
- ❌ Never use 4, 24, or 480 - these cause import issues

### 4. Duration Calculations
```javascript
// MEMORIZE THESE - Based on divisions=768
const DURATIONS = {
    whole: 3072,        // 768 * 4
    half: 1536,         // 768 * 2
    quarter: 768,       // 768 * 1
    eighth: 384,        // 768 / 2
    sixteenth: 192,     // 768 / 4
    thirtySecond: 96,   // 768 / 8
    sixtyFourth: 48,    // 768 / 16
    
    // Dotted notes
    dottedHalf: 2304,   // 1536 * 1.5
    dottedQuarter: 1152, // 768 * 1.5
    dottedEighth: 576,   // 384 * 1.5
    
    // Triplets (3 in space of 2)
    tripletQuarter: 512,  // (768 * 2) / 3
    tripletEighth: 256,   // (384 * 2) / 3
    tripletSixteenth: 128 // (192 * 2) / 3
};
```

### 5. Polyrhythm Duration Formula
```javascript
function polyrhythmDuration(baseBeats, polyBeats, baseDuration = 768) {
    // For X:Y polyrhythm, each note of X gets:
    return Math.round((baseDuration * baseBeats) / polyBeats);
}

// Examples:
// 3:2 → polyrhythmDuration(2, 3, 768) = 512
// 5:4 → polyrhythmDuration(4, 5, 768) = 614
// 7:4 → polyrhythmDuration(4, 7, 768) = 439
```

---

## 📝 Complete Working Template

```javascript
function createSibeliusCompliantMusicXML(measures) {
    let xml = `<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Music</part-name>
    </score-part>
  </part-list>
  <part id="P1">`;

    measures.forEach((measure, index) => {
        xml += `
    <measure number="${index + 1}">`;
        
        if (index === 0) {
            xml += `
      <attributes>
        <divisions>768</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>${measure.timeSignature?.beats || 4}</beats>
          <beat-type>${measure.timeSignature?.beatType || 4}</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>`;
        }
        
        measure.notes.forEach(note => {
            xml += createNote(note);
        });
        
        xml += `
    </measure>`;
    });
    
    xml += `
  </part>
</score-partwise>`;
    
    return xml;
}

function createNote(noteData) {
    const { pitch, duration, isTuplet, actualNotes, normalNotes } = noteData;
    
    let xml = `
      <note>`;
    
    if (pitch) {
        xml += `
        <pitch>
          <step>${pitch.step}</step>
          <octave>${pitch.octave}</octave>
        </pitch>`;
    } else {
        xml += `
        <rest/>`;
    }
    
    xml += `
        <duration>${duration}</duration>
        <type>${getDurationType(duration)}</type>`;
    
    if (isTuplet) {
        xml += `
        <time-modification>
          <actual-notes>${actualNotes}</actual-notes>
          <normal-notes>${normalNotes}</normal-notes>
        </time-modification>`;
    }
    
    xml += `
      </note>`;
    
    return xml;
}

function getDurationType(duration) {
    // Based on divisions=768
    if (duration >= 3072) return 'whole';
    if (duration >= 1536) return 'half';
    if (duration >= 768) return 'quarter';
    if (duration >= 384) return 'eighth';
    if (duration >= 192) return '16th';
    if (duration >= 96) return '32nd';
    return '64th';
}
```

---

## ⚠️ Common Pitfalls to Avoid

### ❌ NEVER DO THIS:
1. **Don't use DOCTYPE** - Even though specs say to
2. **Don't use divisions=4** - Too low resolution
3. **Don't use self-closing tags** for elements that might have children
4. **Don't forget duration** for non-grace notes
5. **Don't put elements in wrong order** (pitch → duration → type → time-modification)

### ✅ ALWAYS DO THIS:
1. **Use divisions=768** for all projects
2. **Calculate durations based on 768**
3. **Follow Dolet's element order exactly**
4. **Test with simple file first** (just 4 quarter notes)
5. **Include version="3.1"** in score-partwise

---

## 🎹 Quick Testing Procedure

1. **Create minimal test file:**
```javascript
// Test with 4 quarter notes: C, D, E, F
const testMeasure = {
    timeSignature: { beats: 4, beatType: 4 },
    notes: [
        { pitch: { step: 'C', octave: 4 }, duration: 768 },
        { pitch: { step: 'D', octave: 4 }, duration: 768 },
        { pitch: { step: 'E', octave: 4 }, duration: 768 },
        { pitch: { step: 'F', octave: 4 }, duration: 768 }
    ]
};
```

2. **If test works, add complexity gradually:**
   - Add eighth notes
   - Add tuplets
   - Add multiple voices
   - Add dynamics/articulations

---

## 🔧 Debugging Sibelius Import Errors

### Error: "The file is not valid MusicXML"
- Check XML declaration syntax
- Remove DOCTYPE if present
- Verify all tags are properly closed

### Error: "Incorrect duration"
- Ensure divisions=768
- Check duration calculations
- Verify time-modification for tuplets

### Silent failure (nothing imports)
- Element order is wrong
- Missing required elements (divisions, duration, type)
- Self-closing tags where not allowed

---

## 📚 Reference Links

- **MusicXML 3.1 Spec**: https://www.w3.org/2017/12/musicxml31/
- **Dolet for Sibelius**: Part of Sibelius installation
- **Test Files**: Save working exports as references

---

## 💾 How to Use This Codex

1. **Save this file** in your GML workspace CODEX folder
2. **Reference it** for EVERY MusicXML export project
3. **Copy the template** function as your starting point
4. **Update this document** when you discover new requirements

---

## 🎯 The Golden Rules

```javascript
// PASTE THIS AT THE TOP OF EVERY MUSICXML EXPORT PROJECT
const MUSICXML_SIBELIUS_RULES = {
    divisions: 768,           // ALWAYS
    includeDoctype: false,    // NEVER
    encoding: 'UTF-8',        // Standard
    version: '3.1',           // Current
    
    // Duration map for divisions=768
    durations: {
        whole: 3072,
        half: 1536,
        quarter: 768,
        eighth: 384,
        sixteenth: 192
    }
};
```

---

**Last Updated**: September 2025  
**Verified With**: Dolet 8 for Sibelius  
**Author**: Mike's GML Projects  
**Status**: ✅ WORKING

---

### Notes Section (Add your discoveries here):
<!-- 
Add any new findings below:
- 
- 
-->