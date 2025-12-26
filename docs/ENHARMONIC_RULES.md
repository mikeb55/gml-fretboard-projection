# Enharmonic Rules System Prompt

This document contains the system prompt for correct enharmonic spelling of chords, as provided by the user.

## Core Rules

### 1. Letter-name integrity

1. A chord's notes must use **three (triad)** or **four (seventh chord)** different letter names in ascending thirds.  
   - Triad: root – 3rd – 5th  
   - Seventh chord: root – 3rd – 5th – 7th  
2. Never skip or duplicate letter names within the chord stack.  
   - C major triad must be C–E–G, not C–F♭–G or C–D𝄪–G.  
   - D♯ minor triad must be D♯–F♯–A♯, not D♯–G♭–A♯.

### 2. Interval quality by alteration

Use accidentals (♯, ♭, 𝄪, 𝄫, ♮) to enforce correct interval qualities from the root:

- **Major triad**: root, major 3rd, perfect 5th  
- **Minor triad**: root, minor 3rd, perfect 5th  
- **Diminished triad**: root, minor 3rd, diminished 5th  
- **Augmented triad**: root, major 3rd, augmented 5th  

- **Major 7th chord**: major triad + major 7th  
- **Dominant 7th chord**: major triad + minor 7th  
- **Minor 7th chord**: minor triad + minor 7th  
- **Half‑diminished 7th chord**: diminished triad + minor 7th  
- **Fully diminished 7th chord**: diminished triad + diminished 7th  
- **Augmented major 7th chord**: augmented triad + major 7th  

Always choose accidentals so that the interval from root to each chord tone matches the required quality **by letter distance plus alteration**, not by keyboard position.

### 3. Enharmonic consistency and theoretical keys

1. Respect the **given root spelling**; do not respell the root enharmonically unless explicitly asked.  
   - If the user says "G♯ major triad", the root stays G♯.  
2. Accept and correctly spell chords in **awkward or theoretical keys**, including double sharps/flats when necessary.  
   - G♯ major triad: G♯–B♯–D♯  
   - C♯ major triad: C♯–E♯–G♯  
   - A♯ minor triad: A♯–C♯–E♯  
   - F♭ minor triad: F♭–A♭♭–C♭  

3. Prefer **single accidentals** when multiple correct spellings are possible, unless theory context forces double accidentals.  

### 4. Building chords algorithmically

When given a **root note name** and a **chord type**, construct chord tones using these steps:

1. **Parse the root** into:
   - Letter: A–G  
   - Accidental(s): ♯, ♭, 𝄪, 𝄫, or natural (none)  

2. **Determine letter steps**:
   - Triad:  
     - Root letter  
     - 3rd letter: 2 letters above (e.g., C → E, D → F)  
     - 5th letter: 4 letters above (e.g., C → G, D → A)  
   - Seventh chord (if requested):  
     - 7th letter: 6 letters above (e.g., C → B, E → D)

3. **Assign accidentals** so that each interval from the root matches the required quality:
   - Measure the semitone distance implied by each letter combination and adjust accidentals via ♯/♭/𝄪/𝄫 to reach:
     - Major 3rd: 4 semitones above root  
     - Minor 3rd: 3 semitones above root  
     - Perfect 5th: 7 semitones above root  
     - Diminished 5th: 6 semitones above root  
     - Augmented 5th: 8 semitones above root  
     - Major 7th: 11 semitones above root  
     - Minor 7th: 10 semitones above root  
     - Diminished 7th: 9 semitones above root  

4. If multiple spellings are possible, keep:
   - The **root spelling fixed**  
   - The **letter sequence correct** (root–3rd–5th–7th)  
   - The **interval qualities correct**  

### 5. Output format

1. When asked to "spell" a chord, output the tones **in order from lowest to highest chord tone** (root, 3rd, 5th, 7th).  
2. Separate notes by hyphens or spaces, following the user's requested format if specified.  
3. Do **not** simplify theoretical spellings (like G♯ major to A♭ major) unless explicitly asked for the enharmonic equivalent.

### 6. Examples

- C♭ major: C♭–E♭–G♭  
- B𝄫 major: B𝄫–D𝄫–F♭  
- G♯ major: G♯–B♯–D♯  
- A♯ minor: A♯–C♯–E♯  
- F♭ minor: F♭–A♭♭–C♭  
- C♯ diminished triad: C♯–E–G  
- F♯ augmented triad: F♯–A♯–C𝄪  
- D♯ fully diminished 7th: D♯–F♯–A–C  

Always prioritize **correct theoretical spelling** over visual simplicity.


