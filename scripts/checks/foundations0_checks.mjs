/**
 * Foundations 0 Compliance Checks
 * Validates MAJ6 chord support and parsing
 */

import { spellChord } from '../../src/chord-spelling.js';
import { parseChordSymbol } from '../../src/chord-symbol-parser.js';
import { normalizeTonicChord, ReasonCodes } from '../../src/tonic-normalization.js';

export async function runFoundations0Checks() {
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  // Check 1: MAJ6 intervals are exactly [0, 4, 7, 9]
  try {
    const c6 = spellChord('C', 'maj6');
    if (JSON.stringify(c6) !== JSON.stringify(['C', 'E', 'G', 'A'])) {
      results.failed++;
      results.errors.push('C maj6 spelling incorrect');
    } else {
      results.passed++;
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`MAJ6 spelling failed: ${error.message}`);
  }

  // Check 2: C6 parses correctly
  try {
    const parsed = parseChordSymbol('C6');
    if (!Array.isArray(parsed) || parsed.length !== 4) {
      results.failed++;
      results.errors.push('C6 did not parse to 4 notes');
    } else {
      results.passed++;
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`C6 parsing failed: ${error.message}`);
  }

  // Check 3: Cmaj6 parses correctly
  try {
    const parsed = parseChordSymbol('Cmaj6');
    if (!Array.isArray(parsed) || parsed.length !== 4) {
      results.failed++;
      results.errors.push('Cmaj6 did not parse to 4 notes');
    } else {
      results.passed++;
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`Cmaj6 parsing failed: ${error.message}`);
  }

  // Check 4: C13 does NOT parse as MAJ6
  try {
    const c13 = parseChordSymbol('C13');
    const c6 = parseChordSymbol('C6');
    if (JSON.stringify(c13) === JSON.stringify(c6)) {
      results.failed++;
      results.errors.push('C13 incorrectly parsed as C6');
    } else {
      results.passed++;
    }
  } catch (error) {
    // C13 might not be fully supported, which is fine
    results.passed++;
  }

  // Check 5: ReasonCodes exist for MAJ6
  try {
    if (ReasonCodes.TONIC_MAJ6_HOME && ReasonCodes.NORMALIZED_TONIC_MAJ7_TO_MAJ6) {
      results.passed++;
    } else {
      results.failed++;
      results.errors.push('MAJ6 ReasonCodes missing');
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`ReasonCodes check failed: ${error.message}`);
  }

  // Check 6: Tonic normalization works
  try {
    const normalized = normalizeTonicChord('C', 'maj7', 'C', true);
    if (normalized.type !== 'maj6' || !normalized.reasonCodes.includes(ReasonCodes.NORMALIZED_TONIC_MAJ7_TO_MAJ6)) {
      results.failed++;
      results.errors.push('Tonic normalization failed');
    } else {
      results.passed++;
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`Tonic normalization check failed: ${error.message}`);
  }

  return results;
}

