/**
 * Chart Bar Detector
 * Detects the number of bars from iReal Pro screenshots and chord charts
 * 
 * This module analyzes images to count bars, detect repeat symbols, and extract chord progressions
 */

/**
 * Detect bar count from image data
 * @param {ImageData|HTMLImageElement|File} imageData - Image to analyze
 * @returns {Promise<{barCount: number, chords: string[], confidence: number, warnings: string[]}>}
 */
export async function detectBarCountFromChart(imageData) {
  const result = {
    barCount: 0,
    chords: [],
    confidence: 0,
    warnings: []
  };

  try {
    // Step 1: Convert image to canvas for analysis
    const canvas = await imageToCanvas(imageData);
    const ctx = canvas.getContext('2d');
    
    // Step 2: Extract text using OCR (if available) or pattern detection
    const textData = await extractTextFromImage(canvas, ctx);
    
    // Step 3: Detect bar separators visually
    const visualBarCount = detectBarsVisually(canvas, ctx);
    
    // Step 4: Parse chord symbols from text
    const parsedChords = parseChordsFromText(textData.text);
    
    // Step 5: Count bars from chord sequence
    const chordBarCount = countBarsFromChords(parsedChords);
    
    // Step 6: Validate against musical forms
    const formValidation = validateMusicalForm(chordBarCount, visualBarCount);
    
    // Step 7: Determine final bar count (prefer visual count, fall back to chord count)
    result.barCount = formValidation.finalBarCount;
    result.chords = parsedChords;
    result.confidence = formValidation.confidence;
    result.warnings = formValidation.warnings;
    
    console.log('Bar detection result:', result);
    return result;
  } catch (error) {
    console.error('Error detecting bars from chart:', error);
    result.warnings.push(`Detection error: ${error.message}`);
    // Fallback: return a reasonable default based on common forms
    result.barCount = inferBarCountFromChords(result.chords);
    result.confidence = 0.3;
    return result;
  }
}

/**
 * Convert various image formats to canvas
 */
async function imageToCanvas(imageData) {
  const canvas = document.createElement('canvas');
  
  if (imageData instanceof File) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageData);
    });
  } else if (imageData instanceof HTMLImageElement) {
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageData, 0, 0);
    return canvas;
  } else if (imageData instanceof ImageData) {
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
  
  throw new Error('Unsupported image format');
}

/**
 * Extract text from image using OCR or pattern recognition
 */
async function extractTextFromImage(canvas, ctx) {
  // Try to use Tesseract.js if available
  if (typeof Tesseract !== 'undefined') {
    try {
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
        logger: m => console.log('OCR:', m)
      });
      return { text, method: 'tesseract' };
    } catch (error) {
      console.warn('Tesseract OCR failed, falling back to pattern detection:', error);
    }
  }
  
  // Fallback: Pattern-based detection
  // Look for common chord symbols and bar separators
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const patterns = detectChordPatterns(imageData);
  
  return { text: patterns.join(' '), method: 'pattern' };
}

/**
 * Detect bars visually by looking for vertical lines (bar separators)
 */
function detectBarsVisually(canvas, ctx) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;
  
  let barCount = 0;
  const verticalLines = [];
  
  // Scan for vertical lines (bar separators)
  // Look for columns with high density of dark pixels
  for (let x = 0; x < width; x += 2) { // Sample every 2 pixels for performance
    let darkPixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r + g + b) / 3;
      
      // Count dark pixels (likely part of a bar line)
      if (brightness < 100) {
        darkPixelCount++;
      }
    }
    
    // If this column has many dark pixels, it might be a bar line
    if (darkPixelCount > height * 0.3) {
      verticalLines.push(x);
    }
  }
  
  // Count distinct bar separators (group nearby lines)
  const threshold = 10; // pixels
  let lastLine = -threshold - 1;
  for (const line of verticalLines) {
    if (line - lastLine > threshold) {
      barCount++;
      lastLine = line;
    }
  }
  
  // Add 1 for the final bar (bars are between separators)
  return Math.max(1, barCount);
}

/**
 * Detect chord patterns in image data
 */
function detectChordPatterns(imageData) {
  // Basic pattern detection - look for common chord symbols
  // This is a simplified version - full implementation would use ML or advanced OCR
  const patterns = [];
  
  // Common chord roots: A, B, C, D, E, F, G
  // Common qualities: maj, min, 7, m7, maj7, dim, aug
  // This would need more sophisticated pattern matching
  
  return patterns;
}

/**
 * Parse chords from extracted text
 */
function parseChordsFromText(text) {
  // Use existing chord parser
  // Split by common delimiters and extract chord symbols
  const chords = text
    .split(/[|\s,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s !== '%')
    .filter(s => /^[A-G][#b]?[0-9]*(m|maj|dim|aug|sus)?[0-9]*/.test(s));
  
  return chords;
}

/**
 * Count bars from chord sequence
 */
function countBarsFromChords(chords) {
  // Each chord typically represents one bar, but some bars have multiple chords
  // Count distinct bar positions
  return chords.length;
}

/**
 * Validate bar count against musical forms
 */
function validateMusicalForm(chordBarCount, visualBarCount) {
  const warnings = [];
  let finalBarCount = Math.max(chordBarCount, visualBarCount);
  let confidence = 0.7;
  
  // Check against common forms
  const commonForms = [8, 12, 16, 24, 32];
  const closestForm = commonForms.reduce((prev, curr) => {
    return Math.abs(curr - finalBarCount) < Math.abs(prev - finalBarCount) ? curr : prev;
  });
  
  if (Math.abs(closestForm - finalBarCount) <= 2) {
    // Close to a common form - adjust and increase confidence
    finalBarCount = closestForm;
    confidence = 0.9;
  } else {
    warnings.push(`Bar count (${finalBarCount}) doesn't match common forms (8, 12, 16, 24, 32)`);
  }
  
  // If visual and chord counts disagree significantly, warn
  if (Math.abs(visualBarCount - chordBarCount) > 4) {
    warnings.push(`Visual count (${visualBarCount}) and chord count (${chordBarCount}) disagree significantly`);
    confidence = 0.5;
    // Prefer visual count as ground truth
    finalBarCount = visualBarCount;
  }
  
  // Never default to 4 bars
  if (finalBarCount === 4 && chordBarCount > 4) {
    warnings.push('CRITICAL: Bar count was 4 but more chords detected - using chord count');
    finalBarCount = chordBarCount;
    confidence = 0.8;
  }
  
  return { finalBarCount, confidence, warnings };
}

/**
 * Infer bar count from chords if detection fails
 */
function inferBarCountFromChords(chords) {
  if (chords.length === 0) return 12; // Default to 12-bar blues
  
  // Common patterns:
  // 12-bar blues: ~12 chords
  // 32-bar AABA: ~32 chords
  // 16-bar: ~16 chords
  
  const count = chords.length;
  
  // Round to nearest common form
  if (count >= 10 && count <= 14) return 12;
  if (count >= 14 && count <= 18) return 16;
  if (count >= 28 && count <= 36) return 32;
  if (count >= 6 && count <= 10) return 8;
  
  return count; // Return actual count if not close to common form
}


