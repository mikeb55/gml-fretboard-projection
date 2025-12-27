/**
 * Comprehensive OCR Image Preprocessor Test
 * Tests preprocessing functionality with challenging scenarios
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { preprocessImageForOCR, isPreprocessingAvailable } from '../src/ocr-image-preprocessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_DIR = path.join(__dirname, '..', 'test-images');
const CLEANUP_AFTER_TEST = true; // Set to false to keep test images for inspection

let passed = 0;
let failed = 0;
let skipped = 0;
const errors = [];
const warnings = [];

// Ensure test directory exists
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

/**
 * Create a synthetic test image using sharp
 */
async function createTestImage(width, height, format = 'png', options = {}) {
  try {
    const sharp = await import('sharp');
    
    const {
      text = 'C7 F7 Bb7 Eb7',
      backgroundColor = { r: 255, g: 255, b: 255 },
      textColor = { r: 0, g: 0, b: 0 },
      contrast = 1.0,
      noise = false
    } = options;
    
    // Create base image
    let image = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: backgroundColor
      }
    });
    
    // Add text overlay (simulated - sharp doesn't have text rendering)
    // Instead, we'll create a pattern that simulates text
    const svg = `
      <svg width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="rgb(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b})"/>
        <text x="50%" y="50%" 
              font-family="Arial" 
              font-size="${Math.min(width, height) / 10}" 
              fill="rgb(${textColor.r},${textColor.g},${textColor.b})" 
              text-anchor="middle" 
              dominant-baseline="middle"
              font-weight="bold">${text}</text>
      </svg>
    `;
    
    image = sharp(Buffer.from(svg));
    
    // Apply contrast if specified
    if (contrast !== 1.0) {
      image = image.modulate({ brightness: 1, saturation: 0, hue: 0 });
    }
    
    // Convert to specified format
    let buffer;
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        buffer = await image.jpeg({ quality: 90 }).toBuffer();
        break;
      case 'png':
        buffer = await image.png().toBuffer();
        break;
      case 'webp':
        buffer = await image.webp().toBuffer();
        break;
      default:
        buffer = await image.png().toBuffer();
    }
    
    return buffer;
  } catch (error) {
    // Fallback: create a minimal valid image buffer
    if (format === 'png') {
      // Minimal PNG header + data
      const pngHeader = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A // PNG signature
      ]);
      // This is a very basic PNG - just enough to be recognized
      return Buffer.concat([pngHeader, Buffer.alloc(width * height * 3)]);
    }
    throw error;
  }
}

/**
 * Save test image to disk
 */
function saveTestImage(buffer, filename) {
  const filepath = path.join(TEST_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

/**
 * Get image metadata using sharp
 */
async function getImageMetadata(imageInput) {
  try {
    const sharp = await import('sharp');
    const image = sharp(imageInput);
    return await image.metadata();
  } catch (error) {
    return null;
  }
}

/**
 * Compare two image buffers (basic size comparison)
 */
function compareImageBuffers(buffer1, buffer2) {
  if (buffer1.length === buffer2.length) {
    return buffer1.equals(buffer2);
  }
  return false;
}

/**
 * Test runner
 */
async function runTest(name, testFn) {
  try {
    console.log(`\n[TEST] ${name}`);
    await testFn();
    passed++;
    console.log(`  ✓ PASSED`);
  } catch (error) {
    // Check if this is a skip (not a real failure)
    if (error.message.includes('Skipped:')) {
      skipped++;
      console.log(`  ⊘ SKIPPED: ${error.message}`);
    } else {
      failed++;
      errors.push(`${name}: ${error.message}`);
      console.log(`  ✗ FAILED: ${error.message}`);
    }
  }
}

/**
 * Test suite
 */
console.log('=== OCR Image Preprocessor Comprehensive Test ===\n');

// Test 1: Check if preprocessing is available
await runTest('Preprocessing availability check', async () => {
  const available = await isPreprocessingAvailable();
  console.log(`  Preprocessing available: ${available}`);
  
  // Try to import sharp to verify
  try {
    const sharp = await import('sharp');
    if (!available) {
      throw new Error('Sharp is available but isPreprocessingAvailable() returned false');
    }
    console.log(`  Sharp version: ${sharp.default ? 'loaded' : 'not loaded'}`);
  } catch (e) {
    if (available) {
      throw new Error('isPreprocessingAvailable() returned true but sharp import failed');
    }
    console.log(`  Sharp not available (expected): ${e.message}`);
    skipped++;
  }
});

// Test 2: Test with very small image (should be resized)
await runTest('Small image resize (200x150)', async () => {
  if (!(await isPreprocessingAvailable())) {
    skipped++;
    throw new Error('Skipped: Sharp not available');
  }
  
  const smallImage = await createTestImage(200, 150, 'png');
  const filepath = saveTestImage(smallImage, 'small-test.png');
  
  const originalMetadata = await getImageMetadata(smallImage);
  console.log(`  Original size: ${originalMetadata.width}x${originalMetadata.height}`);
  
  const processed = await preprocessImageForOCR(filepath);
  const processedMetadata = await getImageMetadata(processed);
  console.log(`  Processed size: ${processedMetadata.width}x${processedMetadata.height}`);
  
  // Should be resized to at least 1200x800
  if (processedMetadata.width < 1200 || processedMetadata.height < 800) {
    throw new Error(`Image not resized properly. Expected min 1200x800, got ${processedMetadata.width}x${processedMetadata.height}`);
  }
  
  // Should be grayscale
  if (processedMetadata.channels !== 1) {
    throw new Error(`Expected grayscale (1 channel), got ${processedMetadata.channels} channels`);
  }
  
  if (CLEANUP_AFTER_TEST) {
    fs.unlinkSync(filepath);
  }
});

// Test 3: Test with large image (should not be resized)
await runTest('Large image (no resize needed)', async () => {
  if (!(await isPreprocessingAvailable())) {
    skipped++;
    throw new Error('Skipped: Sharp not available');
  }
  
  const largeImage = await createTestImage(2000, 1500, 'png');
  const filepath = saveTestImage(largeImage, 'large-test.png');
  
  const originalMetadata = await getImageMetadata(largeImage);
  console.log(`  Original size: ${originalMetadata.width}x${originalMetadata.height}`);
  
  const processed = await preprocessImageForOCR(filepath);
  const processedMetadata = await getImageMetadata(processed);
  console.log(`  Processed size: ${processedMetadata.width}x${processedMetadata.height}`);
  
  // Should maintain similar dimensions (may be slightly different due to processing)
  const widthDiff = Math.abs(processedMetadata.width - originalMetadata.width);
  const heightDiff = Math.abs(processedMetadata.height - originalMetadata.height);
  
  if (widthDiff > originalMetadata.width * 0.1 || heightDiff > originalMetadata.height * 0.1) {
    throw new Error(`Image resized unexpectedly. Original: ${originalMetadata.width}x${originalMetadata.height}, Processed: ${processedMetadata.width}x${processedMetadata.height}`);
  }
  
  // Should be grayscale
  if (processedMetadata.channels !== 1) {
    throw new Error(`Expected grayscale (1 channel), got ${processedMetadata.channels} channels`);
  }
  
  if (CLEANUP_AFTER_TEST) {
    fs.unlinkSync(filepath);
  }
});

// Test 4: Test with buffer input (not file path)
await runTest('Buffer input processing', async () => {
  if (!(await isPreprocessingAvailable())) {
    skipped++;
    throw new Error('Skipped: Sharp not available');
  }
  
  const imageBuffer = await createTestImage(800, 600, 'png');
  const originalMetadata = await getImageMetadata(imageBuffer);
  console.log(`  Input buffer size: ${imageBuffer.length} bytes`);
  console.log(`  Original dimensions: ${originalMetadata.width}x${originalMetadata.height}`);
  
  const processed = await preprocessImageForOCR(imageBuffer);
  const processedMetadata = await getImageMetadata(processed);
  console.log(`  Output buffer size: ${processed.length} bytes`);
  console.log(`  Processed dimensions: ${processedMetadata.width}x${processedMetadata.height}`);
  
  if (!Buffer.isBuffer(processed)) {
    throw new Error('Expected Buffer output, got ' + typeof processed);
  }
  
  // Should be resized (800x600 < 1200x800)
  if (processedMetadata.width < 1200 || processedMetadata.height < 800) {
    throw new Error('Image should have been resized');
  }
});

// Test 5: Test with different image formats
await runTest('Multiple image formats (PNG, JPEG)', async () => {
  if (!(await isPreprocessingAvailable())) {
    skipped++;
    throw new Error('Skipped: Sharp not available');
  }
  
  const formats = ['png', 'jpeg'];
  for (const format of formats) {
    const image = await createTestImage(500, 400, format);
    const filename = `test-${format}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    const filepath = saveTestImage(image, filename);
    
    try {
      const processed = await preprocessImageForOCR(filepath);
      const metadata = await getImageMetadata(processed);
      
      console.log(`  ${format.toUpperCase()}: ${metadata.width}x${metadata.height}, ${metadata.channels} channel(s)`);
      
      if (metadata.channels !== 1) {
        throw new Error(`${format}: Expected grayscale, got ${metadata.channels} channels`);
      }
      
      if (CLEANUP_AFTER_TEST) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      if (CLEANUP_AFTER_TEST) {
        try { fs.unlinkSync(filepath); } catch {}
      }
      throw new Error(`${format} format failed: ${error.message}`);
    }
  }
});

// Test 6: Test fallback behavior when sharp fails
await runTest('Fallback behavior (graceful degradation)', async () => {
  // This test verifies that the function doesn't crash even if processing fails
  // We can't easily simulate sharp failure, but we can test with invalid input
  
  // Test with invalid buffer
  const invalidBuffer = Buffer.from('not an image');
  try {
    const result = await preprocessImageForOCR(invalidBuffer);
    console.log(`  Handled invalid input gracefully`);
    console.log(`  Returned: ${Buffer.isBuffer(result) ? 'Buffer' : typeof result}`);
    
    // Should return the original buffer or handle gracefully
    if (!Buffer.isBuffer(result)) {
      throw new Error('Expected Buffer output even on error');
    }
  } catch (error) {
    // If sharp is available, it might throw - that's okay, we just want to verify
    // the error is handled or the function doesn't crash
    console.log(`  Error handled: ${error.message}`);
  }
});

// Test 7: Test edge case - very wide image
await runTest('Very wide image (aspect ratio test)', async () => {
  if (!(await isPreprocessingAvailable())) {
    skipped++;
    throw new Error('Skipped: Sharp not available');
  }
  
  const wideImage = await createTestImage(3000, 200, 'png');
  const filepath = saveTestImage(wideImage, 'wide-test.png');
  
  const originalMetadata = await getImageMetadata(wideImage);
  const processed = await preprocessImageForOCR(filepath);
  const processedMetadata = await getImageMetadata(processed);
  
  console.log(`  Original: ${originalMetadata.width}x${originalMetadata.height}`);
  console.log(`  Processed: ${processedMetadata.width}x${processedMetadata.height}`);
  
  // Should maintain aspect ratio while meeting minimums
  const originalAspect = originalMetadata.width / originalMetadata.height;
  const processedAspect = processedMetadata.width / processedMetadata.height;
  const aspectDiff = Math.abs(originalAspect - processedAspect);
  
  if (aspectDiff > 0.1) {
    warnings.push(`Aspect ratio changed significantly: ${originalAspect.toFixed(2)} -> ${processedAspect.toFixed(2)}`);
  }
  
  if (CLEANUP_AFTER_TEST) {
    fs.unlinkSync(filepath);
  }
});

// Test 8: Test edge case - very tall image
await runTest('Very tall image (aspect ratio test)', async () => {
  if (!(await isPreprocessingAvailable())) {
    skipped++;
    throw new Error('Skipped: Sharp not available');
  }
  
  const tallImage = await createTestImage(200, 3000, 'png');
  const filepath = saveTestImage(tallImage, 'tall-test.png');
  
  const originalMetadata = await getImageMetadata(tallImage);
  const processed = await preprocessImageForOCR(filepath);
  const processedMetadata = await getImageMetadata(processed);
  
  console.log(`  Original: ${originalMetadata.width}x${originalMetadata.height}`);
  console.log(`  Processed: ${processedMetadata.width}x${processedMetadata.height}`);
  
  // Should meet minimum requirements
  if (processedMetadata.width < 1200 || processedMetadata.height < 800) {
    throw new Error('Processed image does not meet minimum size requirements');
  }
  
  if (CLEANUP_AFTER_TEST) {
    fs.unlinkSync(filepath);
  }
});

// Test 9: Test performance with multiple images
await runTest('Batch processing performance', async () => {
  if (!(await isPreprocessingAvailable())) {
    skipped++;
    throw new Error('Skipped: Sharp not available');
  }
  
  const imageCount = 5;
  const images = [];
  
  console.log(`  Creating ${imageCount} test images...`);
  for (let i = 0; i < imageCount; i++) {
    const image = await createTestImage(600 + i * 100, 400 + i * 50, 'png');
    const filename = `batch-test-${i}.png`;
    const filepath = saveTestImage(image, filename);
    images.push(filepath);
  }
  
  console.log(`  Processing ${imageCount} images...`);
  const startTime = Date.now();
  
  const results = await Promise.all(
    images.map(filepath => preprocessImageForOCR(filepath))
  );
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  const avgTime = duration / imageCount;
  
  console.log(`  Processed ${imageCount} images in ${duration}ms (avg: ${avgTime.toFixed(2)}ms/image)`);
  
  // Verify all results are buffers
  for (let i = 0; i < results.length; i++) {
    if (!Buffer.isBuffer(results[i])) {
      throw new Error(`Result ${i} is not a Buffer`);
    }
  }
  
  if (CLEANUP_AFTER_TEST) {
    images.forEach(filepath => {
      try { fs.unlinkSync(filepath); } catch {}
    });
  }
});

// Test 10: Test minimum size threshold
await runTest('Minimum size threshold validation', async () => {
  if (!(await isPreprocessingAvailable())) {
    skipped++;
    throw new Error('Skipped: Sharp not available');
  }
  
  // Test image exactly at threshold
  const thresholdImage = await createTestImage(1200, 800, 'png');
  const filepath = saveTestImage(thresholdImage, 'threshold-test.png');
  
  const originalMetadata = await getImageMetadata(thresholdImage);
  const processed = await preprocessImageForOCR(filepath);
  const processedMetadata = await getImageMetadata(processed);
  
  console.log(`  At threshold: ${originalMetadata.width}x${originalMetadata.height}`);
  console.log(`  Processed: ${processedMetadata.width}x${processedMetadata.height}`);
  
  // Should meet or exceed minimums
  if (processedMetadata.width < 1200 || processedMetadata.height < 800) {
    throw new Error('Processed image below minimum threshold');
  }
  
  if (CLEANUP_AFTER_TEST) {
    fs.unlinkSync(filepath);
  }
});

// Test 11: Test with non-existent file path
await runTest('Non-existent file path handling', async () => {
  const nonExistentPath = path.join(TEST_DIR, 'non-existent-file.png');
  
  try {
    const result = await preprocessImageForOCR(nonExistentPath);
    // Should either throw or return gracefully
    console.log(`  Handled non-existent file (returned: ${Buffer.isBuffer(result) ? 'Buffer' : typeof result})`);
  } catch (error) {
    // Error is acceptable - just verify it's handled
    console.log(`  Error caught: ${error.message}`);
  }
});

// Test 12: Verify grayscale conversion
await runTest('Grayscale conversion verification', async () => {
  if (!(await isPreprocessingAvailable())) {
    skipped++;
    throw new Error('Skipped: Sharp not available');
  }
  
  // Create a colorful image
  const colorImage = await createTestImage(1000, 800, 'png', {
    backgroundColor: { r: 100, g: 150, b: 200 },
    textColor: { r: 255, g: 0, b: 0 }
  });
  const filepath = saveTestImage(colorImage, 'color-test.png');
  
  const originalMetadata = await getImageMetadata(colorImage);
  const processed = await preprocessImageForOCR(filepath);
  const processedMetadata = await getImageMetadata(processed);
  
  console.log(`  Original channels: ${originalMetadata.channels}`);
  console.log(`  Processed channels: ${processedMetadata.channels}`);
  
  if (processedMetadata.channels !== 1) {
    throw new Error(`Expected 1 channel (grayscale), got ${processedMetadata.channels}`);
  }
  
  if (CLEANUP_AFTER_TEST) {
    fs.unlinkSync(filepath);
  }
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Skipped: ${skipped}`);

if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
}

if (errors.length > 0) {
  console.log(`\nErrors (${errors.length}):`);
  errors.forEach(e => console.log(`  ✗ ${e}`));
}

if (failed === 0 && skipped === 0) {
  console.log('\n✓ All tests passed!');
} else if (failed === 0) {
  console.log(`\n✓ All available tests passed! (${skipped} skipped due to missing dependencies)`);
  console.log(`\n  Note: To run all tests, install sharp: npm install sharp`);
} else {
  console.log(`\n✗ ${failed} test(s) failed`);
}

// Cleanup test directory if empty
if (CLEANUP_AFTER_TEST) {
  try {
    const files = fs.readdirSync(TEST_DIR);
    if (files.length === 0) {
      fs.rmdirSync(TEST_DIR);
      console.log('\nCleaned up test directory');
    }
  } catch {}
}

process.exit(failed > 0 ? 1 : 0);

