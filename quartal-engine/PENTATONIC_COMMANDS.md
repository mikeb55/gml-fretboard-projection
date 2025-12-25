# E Pentatonic with Quartal Triads - Command Examples

## Quick Answer

Since the Quartal Engine works with **diatonic scales** (7-note scales), and E pentatonic minor is a subset of E minor, use:

### For E Pentatonic Minor with Quartal Triads:

```
Generate E minor quartals, 5 bars
```

This generates quartal harmony on E minor scale. The E pentatonic notes (E, G, A, B, D) are all in E minor, so you can:
- Use the top voice (Voice 1) as your melody
- The quartal harmony below supports it
- Manually filter to pentatonic notes if desired

## Command Variations

### 1. Basic E Minor Quartals (3-note)
```
Generate E minor quartals, 5 bars
```
**Result:** 5 bars, 15 notes (3-note quartal stacks)

### 2. E Minor Quartals with 4-Note Stacks
```
Generate E minor 4-note quartals, 5 bars
```
**Result:** 5 bars, 20 notes (4-note quartal stacks)

### 3. Full E Minor Scale Harmonization
```
Generate a musicxml of the E minor scale harmonised as quartals
```
**Result:** 7 bars, 21 notes (one quartal stack per scale degree)

### 4. Custom Bar Count
```
Generate E minor quartals, 8 bars
```
**Result:** 8 bars, 24 notes

## Using the Output

1. **Open in MuseScore/Finale/Guitar Pro 8**
   - The generated MusicXML opens directly

2. **Extract Melody**
   - **Voice 1** (top voice) = Your melody line
   - **Voice 2, 3, 4** = Quartal harmony below

3. **For Pentatonic Focus**
   - The E minor scale includes: E, F#, G, A, B, C, D
   - E pentatonic minor is: E, G, A, B, D
   - You can manually edit to emphasize pentatonic notes
   - Or use Voice 1 as-is (it will naturally include pentatonic notes)

## Example Workflow

### Step 1: Generate
```
Generate E minor quartals, 5 bars
```

### Step 2: Open in Notation Software
- File opens as: `E-minor-quartal-3note-5bars-1234567890.MusicXML`
- Open in MuseScore, Finale, or Guitar Pro 8

### Step 3: Use Top Voice as Melody
- Voice 1 = Melody (highest notes)
- Voices 2-3 = Quartal harmony support

### Step 4: Refine (Optional)
- Edit to emphasize pentatonic notes (E, G, A, B, D)
- Develop melodic phrases
- Adjust voicings for playability

## Other Pentatonic Examples

### A Pentatonic Minor
```
Generate A minor quartals, 5 bars
```

### D Pentatonic Major
```
Generate D major quartals, 5 bars
```

### G Pentatonic Minor
```
Generate G minor quartals, 5 bars
```

## Important Notes

- The engine generates **diatonic quartal harmony** (7-note scales)
- Pentatonic scales are **5-note subsets** of diatonic scales
- The output includes all scale notes, but you can focus on pentatonic notes
- Voice 1 (top voice) naturally serves as melody
- The quartal harmony below provides modern, open-sounding support

## Command Syntax Reference

```
Generate [ROOT] [SCALE] quartals, [N] bars
Generate [ROOT] [SCALE] 4-note quartals, [N] bars
Generate a musicxml of the [ROOT] [SCALE] scale harmonised as quartals
```

**For E Pentatonic specifically:**
- Use **E minor** as the parent scale
- Request **3-note quartals** (triads)
- Specify **5 bars** (one per pentatonic note, or any number you want)


