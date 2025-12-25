# Creating Melodies with Quartal Harmony - Guide

## Overview

There are several approaches to creating melodies harmonized with quartal chords. This guide explains the methods and how to use the Quartal Engine for each.

## Method 1: Generate Quartal Harmony, Then Extract/Create Melody

### Approach
1. Generate quartal harmony for your scale
2. Use the top voice (highest note) of each quartal stack as your melody
3. The harmony below supports the melody

### Example: E Pentatonic with Quartal Triads

**Step 1: Generate the quartal harmony**
```
Generate E minor quartals, 5 bars
```
(Note: Pentatonic is a subset of minor scale - we'll use E minor and select pentatonic degrees)

**Step 2: In your DAW/notation software:**
- The top voice (Voice 1) becomes your melody line
- The lower voices (Voice 2, 3, 4) provide quartal harmony support

### Using the Engine

The engine generates quartal stacks where:
- **Voice 1** = Highest note (top of stack)
- **Voice 2** = Middle note
- **Voice 3** = Lowest note (for 3-note quartals)
- **Voice 4** = Additional note (for 4-note quartals)

You can use Voice 1 as your melody line.

## Method 2: Create Melody First, Then Harmonize (v1.1 Feature)

### Approach
1. Create a monophonic melody in MusicXML format
2. Use the v1.1 harmonizer to add quartal harmony below the melody
3. The melody remains unchanged, harmony is added

### Current Limitation
The current v1.1 implementation requires:
- A MusicXML melody file as input
- Explicit scale/mode specification

### Workflow
1. Create your melody in MuseScore, Finale, or any notation software
2. Export as MusicXML
3. Use the harmonizer to add quartal harmony below

## Method 3: Pentatonic-Specific Quartal Harmony

### Understanding Pentatonic Quartals

A pentatonic scale has 5 notes. Quartal harmony on pentatonic creates interesting voicings:

**E Pentatonic Minor:** E, G, A, B, D

Quartal stacks (3-note) on pentatonic:
- E-A-D (E to A = perfect 4th, A to D = perfect 4th)
- G-B-E (G to B = major 3rd, B to E = perfect 4th) - *not pure quartal*
- A-D-G (A to D = perfect 4th, D to G = perfect 4th)
- B-E-A (B to E = perfect 4th, E to A = perfect 4th)
- D-G-B (D to G = perfect 4th, G to B = major 3rd) - *not pure quartal*

### Current Engine Capability

The current engine works with **diatonic scales** (7-note scales):
- Major, Minor, Dorian, Mixolydian, Lydian, Phrygian, Locrian

For pentatonic scales, you have two options:

#### Option A: Use Parent Scale
Generate quartal harmony from the parent scale (e.g., E minor), then:
- Select only the pentatonic degrees (1, 3, 4, 5, 7)
- Or filter the output to use only pentatonic notes

#### Option B: Manual Approach
1. Generate quartal harmony for E minor
2. In your notation software, modify to use only pentatonic notes
3. Adjust voicings to fit pentatonic constraints

## Practical Example: E Pentatonic Quartal Melody

### Step-by-Step Process

**1. Generate Base Harmony**
```
Generate E minor quartals, 5 bars
```

This gives you quartal stacks on E minor scale degrees.

**2. Extract Melody**
- Open the generated MusicXML in MuseScore/Finale
- The top voice (Voice 1) is your potential melody
- Lower voices provide quartal harmony

**3. Refine for Pentatonic**
- Edit to use only E, G, A, B, D
- Adjust voicings to maintain quartal intervals where possible
- Some stacks may need adjustment (pentatonic has fewer notes)

**4. Create Melodic Line**
- Use Voice 1 as starting point
- Develop melodic phrases using pentatonic notes
- Keep quartal harmony below

## Recommended Workflow

### For Creating Original Melodies:

1. **Generate Quartal Harmony**
   ```
   Generate [ROOT] [SCALE] quartals, [N] bars
   ```

2. **Open in Notation Software**
   - MuseScore, Finale, Sibelius, or Guitar Pro 8
   - All support MusicXML directly

3. **Extract/Develop Melody**
   - Use top voice as melody foundation
   - Develop melodic phrases
   - Keep quartal harmony below

4. **Refine**
   - Adjust voicings for playability
   - Develop melodic rhythm
   - Add expression and dynamics

### For Harmonizing Existing Melodies:

1. **Create Melody First**
   - Write your melody in notation software
   - Export as MusicXML

2. **Use v1.1 Harmonizer** (when available)
   - Input: Your melody MusicXML
   - Output: Melody + quartal harmony below

## Tips for Quartal Melody Writing

1. **Voice Leading**: The top voice (melody) should have smooth motion
2. **Quartal Color**: The quartal harmony provides a modern, open sound
3. **Pentatonic Limitation**: Pure quartal intervals on pentatonic are limited - some stacks will have major 3rds
4. **Guitar-Friendly**: The engine generates guitar-friendly voicings (5-fret span, adjacent strings)

## Future Enhancements

Potential improvements for pentatonic support:
- Direct pentatonic scale input
- Pentatonic-specific quartal voicing rules
- Automatic pentatonic filtering from parent scales

## Example Commands

### E Minor (Parent of E Pentatonic Minor)
```
Generate E minor quartals, 5 bars
```

### E Minor, 4-Note Quartals
```
Generate E minor 4-note quartals, 5 bars
```

### Full E Minor Scale Harmonization
```
Generate a musicxml of the E minor scale harmonised as quartals
```

Then manually select pentatonic degrees (1, 3, 4, 5, 7) in your notation software.


