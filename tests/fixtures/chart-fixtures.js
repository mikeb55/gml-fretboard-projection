/**
 * Chart fixtures for bar count testing
 * These simulate iReal Pro screenshots or extracted chord charts
 */

export const chartFixtures = {
  // 12-bar blues
  blues12: {
    text: 'C7 | C7 | C7 | C7 | F7 | F7 | C7 | C7 | G7 | F7 | C7 | C7',
    expectedBars: 12,
    form: 'blues',
    description: 'Standard 12-bar blues progression'
  },
  
  // 32-bar AABA standard
  aaba32: {
    text: 'C | Am | Dm | G7 | C | Am | Dm | G7 | F | F | C | C | Am | Am | Dm | G7 | C | Am | Dm | G7 | F | F | C | C | Am | Am | Dm | G7 | C | Am | Dm | G7',
    expectedBars: 32,
    form: 'aaba',
    description: '32-bar AABA standard form'
  },
  
  // 8-bar short form
  short8: {
    text: 'C | Am | Dm | G7 | C | Am | Dm | G7',
    expectedBars: 8,
    form: 'short',
    description: '8-bar short form'
  },
  
  // 16-bar form
  form16: {
    text: 'C | Am | Dm | G7 | C | Am | Dm | G7 | F | F | C | C | Am | Am | Dm | G7',
    expectedBars: 16,
    form: 'standard',
    description: '16-bar standard form'
  },
  
  // 24-bar form
  form24: {
    text: 'C | Am | Dm | G7 | C | Am | Dm | G7 | F | F | C | C | Am | Am | Dm | G7 | C | Am | Dm | G7 | F | F | C | C',
    expectedBars: 24,
    form: 'extended',
    description: '24-bar extended form'
  },
  
  // With repeat symbols
  withRepeats: {
    text: 'Bb7 | % | Eb7 | F7 | Bb7 | % | Eb7 | Bb7 | Gm7 | Cm7 | F7 | Bb7',
    expectedBars: 12, // % means repeat previous, so still 12 distinct bars
    form: 'blues',
    description: '12-bar with repeat symbols'
  },
  
  // Multiple chords per bar (iReal Pro notation)
  multipleChordsPerBar: {
    text: 'Bb7/G7 | Eb7/F7 | Bb7 | Eb7',
    expectedBars: 4, // Second chord only per iReal Pro notation
    form: 'short',
    description: 'Multiple chords per bar (extract second chord)'
  }
};


