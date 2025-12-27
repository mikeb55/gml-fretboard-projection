/**
 * OCR Image Preprocessor
 * Enhances images for better OCR accuracy
 */

// Cache for sharp module (lazy loaded)
let sharpModule = null;
let sharpLoadAttempted = false;

/**
 * Load sharp module dynamically
 * @returns {Promise<object|null>} Sharp module or null if not available
 */
async function loadSharp() {
  if (sharpModule !== null) {
    return sharpModule;
  }
  
  if (sharpLoadAttempted) {
    return null;
  }
  
  try {
    sharpLoadAttempted = true;
    const sharp = await import('sharp');
    sharpModule = sharp.default || sharp;
    return sharpModule;
  } catch (error) {
    return null;
  }
}

/**
 * Preprocess image for better OCR accuracy
 * @param {string|Buffer} imageInput - Image file path or buffer
 * @returns {Promise<Buffer>} Preprocessed image buffer
 */
export async function preprocessImageForOCR(imageInput) {
  try {
    const sharp = await loadSharp();
    if (!sharp) {
      // If sharp is not available, return original
      if (typeof imageInput === 'string') {
        const fs = await import('fs');
        return fs.readFileSync(imageInput);
      }
      return imageInput;
    }
    
    let image = sharp(imageInput);
    
    // Get image metadata
    const metadata = await image.metadata();
    
    // Resize if too small (OCR works better at 300 DPI equivalent)
    const minWidth = 1200;
    const minHeight = 800;
    
    if (metadata.width < minWidth || metadata.height < minHeight) {
      const scale = Math.max(minWidth / metadata.width, minHeight / metadata.height);
      image = image.resize(
        Math.round(metadata.width * scale),
        Math.round(metadata.height * scale),
        { kernel: sharp.kernel.lanczos3 }
      );
    }
    
    // Enhance for OCR
    const processed = await image
      .greyscale() // Convert to grayscale
      .normalize() // Normalize contrast
      .sharpen() // Sharpen edges
      .toBuffer();
    
    return processed;
  } catch (error) {
    // If sharp is not available, return original
    console.warn('Image preprocessing not available:', error.message);
    if (typeof imageInput === 'string') {
      const fs = await import('fs');
      return fs.readFileSync(imageInput);
    }
    return imageInput;
  }
}

/**
 * Check if image preprocessing is available
 */
export async function isPreprocessingAvailable() {
  const sharp = await loadSharp();
  return sharp !== null;
}


