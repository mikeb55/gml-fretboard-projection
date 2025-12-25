/**
 * Test progressions for fretboard projection testing
 * These simulate engine output
 */

export const testProgressions = {
  // Basic ii-V-I major
  iiVIMajor: [
    {
      voicing: [50, 57, 62, 65], // Dm7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    },
    {
      voicing: [55, 59, 62, 67], // G7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    },
    {
      voicing: [48, 52, 55, 59], // Cmaj7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    }
  ],

  // Minor ii-V-i
  iiVIMinor: [
    {
      voicing: [50, 53, 57, 60], // Bm7b5
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    },
    {
      voicing: [55, 58, 62, 65], // E7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    },
    {
      voicing: [48, 51, 55, 60], // Am7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    }
  ],

  // Dominant chain
  dominantChain: [
    {
      voicing: [55, 59, 62, 65], // G7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    },
    {
      voicing: [58, 62, 65, 68], // Bb7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    },
    {
      voicing: [53, 57, 60, 63], // F7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    },
    {
      voicing: [48, 52, 55, 58], // C7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    }
  ],

  // HOLD heavy
  holdHeavy: [
    {
      voicing: [48, 52, 55, 59], // Cmaj7
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    },
    {
      voicing: [48, 52, 55, 59], // Cmaj7 (same)
      inversion: 'root',
      registerPosition: 'mid',
      hold: true,
      reasonCodes: [{ code: 'HOLD_VALID' }]
    },
    {
      voicing: [48, 52, 55, 59], // Cmaj7 (same)
      inversion: 'root',
      registerPosition: 'mid',
      hold: true,
      reasonCodes: [{ code: 'HOLD_VALID' }]
    },
    {
      voicing: [48, 52, 55, 59], // Cmaj7 (same)
      inversion: 'root',
      registerPosition: 'mid',
      hold: true,
      reasonCodes: [{ code: 'HOLD_VALID' }]
    },
    {
      voicing: [50, 53, 57, 60], // Dm7 (different)
      inversion: 'root',
      registerPosition: 'mid',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    }
  ],

  // Long form 32 bars
  longForm32: (() => {
    const voicings = [
      [48, 52, 55, 59], // Cmaj7
      [45, 48, 52, 57], // Am7
      [50, 53, 57, 62], // Dm7
      [55, 59, 62, 67]  // G7
    ];
    const result = [];
    for (let i = 0; i < 32; i++) {
      const idx = i % 4;
      result.push({
        voicing: voicings[idx],
        inversion: 'root',
        registerPosition: 'mid',
        hold: i > 0 && idx === (i - 1) % 4,
        reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
      });
    }
    return result;
  })(),

  // Long form 64 bars
  longForm64: (() => {
    const voicings = [
      [48, 52, 55, 59], // Cmaj7
      [45, 48, 52, 57], // Am7
      [50, 53, 57, 62], // Dm7
      [55, 59, 62, 67]  // G7
    ];
    const result = [];
    for (let i = 0; i < 64; i++) {
      const idx = i % 4;
      result.push({
        voicing: voicings[idx],
        inversion: 'root',
        registerPosition: 'mid',
        hold: i > 0 && idx === (i - 1) % 4,
        reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
      });
    }
    return result;
  })(),

  // Register reset scenario
  registerReset: [
    {
      voicing: [48, 52, 55, 59], // Cmaj7
      inversion: 'root',
      registerPosition: 'low',
      hold: false,
      reasonCodes: [{ code: 'BARRY_HARRIS_INVERSION' }]
    },
    {
      voicing: [60, 64, 67, 71], // Cmaj7 (high)
      inversion: 'root',
      registerPosition: 'high',
      hold: false,
      reasonCodes: [{ code: 'REGISTER_RESET' }]
    },
    {
      voicing: [48, 52, 55, 59], // Cmaj7 (back to low)
      inversion: 'root',
      registerPosition: 'low',
      hold: false,
      reasonCodes: [{ code: 'REGISTER_RESET' }]
    }
  ]
};
