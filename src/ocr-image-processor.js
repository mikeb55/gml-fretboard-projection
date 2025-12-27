/**
 * OCR Image Processor for Node.js
 * Processes images and extracts chord progressions using OCR
 */

import { createWorker } from 'tesseract.js';
import fs from 'fs';
import { extractValidChords } from './ocr-chord-extractor.js';
import { preprocessImageForOCR, isPreprocessingAvailable } from './ocr-image-preprocessor.js';

/**
 * Process image file and extract text using OCR
 * @param {string} imagePath - Path to image file
 * @returns {Promise<{text: string, confidence: number, chords: string[]}>}
 */
export async function processImageWithOCR(imagePath, usePreprocessing = true) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }
  
  // Preprocess image if available and requested
  let imageToProcess = imagePath;
  if (usePreprocessing && await isPreprocessingAvailable()) {
    try {
      const preprocessed = await preprocessImageForOCR(imagePath);
      // Save to temp file or use buffer directly
      imageToProcess = preprocessed;
    } catch (e) {
      console.warn('Preprocessing failed, using original image:', e.message);
    }
  }
  
  // Create worker with optimized settings for chord symbols
  const worker = await createWorker('eng', 1, {
    logger: m => {} // Suppress logs for cleaner output
  });
  
  try {
    // Configure for better chord symbol recognition
    // Expanded whitelist to include common OCR misreads
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGabcdefg0123456789#b♭♯Δ-msusdimaugo+%|/()BbEeFfGgAaCcDd',
      tessedit_pageseg_mode: '6' // Assume uniform block of text
    });
    
    const { data: { text, confidence, words } } = await worker.recognize(imageToProcess, {
      rectangle: undefined // Process full image
    });
    
    // Clean and extract chord symbols from text
    const cleanedText = cleanOCRText(text);
    
    // Use advanced chord extractor
    const chords = extractValidChords(cleanedText);
    
    // Also try to extract from word-level data (more accurate)
    const wordChords = extractChordsFromWords(words || []);
    const allChords = [...new Set([...chords, ...wordChords])];
    
    await worker.terminate();
    
    return {
      text: cleanedText,
      confidence: confidence || 0,
      chords: allChords,
      rawText: text
    };
  } catch (error) {
    await worker.terminate();
    throw error;
  }
}

/**
 * Clean OCR text to improve chord extraction
 */
function cleanOCRText(text) {
  return text
    // Fix common OCR errors
    .replace(/[|]/g, '|') // Normalize bar separators
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/([A-G][#b]?)\s*([0-9])/g, '$1$2') // Fix spacing between root and number
    .replace(/([A-G][#b]?)\s*([mM])/g, '$1$2') // Fix spacing before m/M
    .replace(/0/g, 'o') // Common OCR error: 0 instead of o (dim)
    .replace(/O/g, 'o') // Common OCR error: O instead of o
    .trim();
}

/**
 * Extract chords from OCR word-level data (more accurate)
 */
function extractChordsFromWords(words) {
  const chords = [];
  const chordPattern = /^[A-G][#b]?(maj|min|m|M|Δ|dim|aug|o|\+)?[0-9]*(sus|add)?[0-9]*$/i;
  
  for (const word of words) {
    const text = word.text?.trim() || '';
    if (!text) continue;
    
    // Check if word matches chord pattern
    if (chordPattern.test(text)) {
      chords.push(text);
    }
    // Also check for chords with common OCR errors
    else {
      // Try to fix common misreads
      const fixed = fixCommonOCRErrors(text);
      if (chordPattern.test(fixed)) {
        chords.push(fixed);
      }
    }
  }
  
  return chords;
}

/**
 * Fix common OCR errors in chord symbols
 */
function fixCommonOCRErrors(text) {
  return text
    .replace(/[0O]/g, 'o') // 0/O -> o (dim)
    .replace(/[1lI]/g, '1') // l/I -> 1
    .replace(/5/g, '7') // Common: 5 misread as 7
    .replace(/S/g, '5') // S -> 5
    .replace(/s/g, '5') // s -> 5 (in some contexts)
    .replace(/B/g, 'B') // Ensure proper case
    .replace(/b(?=[0-9])/g, 'b') // b before number
    .trim();
}

// extractChordSymbols moved to ocr-chord-extractor.js

/**
 * Normalize chord symbol to standard format
 */
function normalizeChordSymbol(chord) {
  return chord
    .replace(/maj/g, 'maj')
    .replace(/min/g, 'm')
    .replace(/M(?=[0-9])/g, 'maj') // M7 -> maj7
    .replace(/Δ/g, 'maj7')
    .replace(/o(?=[0-9])/g, 'dim') // o7 -> dim7
    .replace(/\+/g, 'aug')
    .trim();
}

/**
 * Process multiple images
 * @param {string[]} imagePaths - Array of image file paths
 * @returns {Promise<Array<{file: string, text: string, chords: string[], confidence: number}>>}
 */
export async function processMultipleImages(imagePaths) {
  const results = [];
  
  for (const imagePath of imagePaths) {
    try {
      console.log(`Processing ${imagePath}...`);
      const result = await processImageWithOCR(imagePath);
      results.push({
        file: imagePath,
        text: result.text,
        chords: result.chords,
        confidence: result.confidence
      });
    } catch (error) {
      console.error(`Error processing ${imagePath}:`, error.message);
      results.push({
        file: imagePath,
        error: error.message,
        chords: [],
        confidence: 0
      });
    }
  }
  
  return results;
}

