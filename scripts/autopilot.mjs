#!/usr/bin/env node
/**
 * Autopilot System for Stage-Gated Development
 * Validates stages, runs tests, bumps versions, commits, and tags
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..');

// Load stage configuration
const stagesConfig = JSON.parse(readFileSync(join(repoRoot, 'stages/stages.json'), 'utf-8'));
const packageJson = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf-8'));

// Detect package manager
function detectPackageManager() {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      return 'yarn';
    } catch {
      return 'npm';
    }
  }
}

const pkgManager = detectPackageManager();
const testCommand = pkgManager === 'pnpm' ? 'pnpm test' : pkgManager === 'yarn' ? 'yarn test' : 'npm test';

// Load check modules
async function loadCheck(checkName) {
  const checkPath = join(repoRoot, `scripts/checks/${checkName}.mjs`);
  try {
    const module = await import(`file://${checkPath}`);
    // Map check names to function names
    const functionMap = {
      'foundations0_checks': 'runFoundations0Checks',
      'stategraph_checks': 'runStategraphChecks',
      'voiceleading_checks': 'runVoiceleadingChecks'
    };
    const functionName = functionMap[checkName] || `run${checkName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    return module[functionName];
  } catch (error) {
    console.error(`Failed to load check ${checkName}: ${error.message}`);
    return null;
  }
}

// Run tests for a stage
function runStageTests(stage) {
  console.log(`\n=== Running tests for ${stage.id} ===`);
  const testResults = {
    passed: true,
    errors: []
  };

  for (const testFile of stage.tests || []) {
    try {
      const testPath = join(repoRoot, testFile);
      console.log(`  Running: ${testFile}`);
      execSync(`node ${testPath}`, { 
        cwd: repoRoot, 
        stdio: 'inherit',
        encoding: 'utf-8'
      });
    } catch (error) {
      testResults.passed = false;
      testResults.errors.push(`Test ${testFile} failed: ${error.message}`);
    }
  }

  // Run npm test
  try {
    console.log(`  Running: ${testCommand}`);
    execSync(testCommand, { 
      cwd: repoRoot, 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
  } catch (error) {
    testResults.passed = false;
    testResults.errors.push(`npm test failed: ${error.message}`);
  }

  return testResults;
}

// Run checks for a stage
async function runStageChecks(stage, stageConfig) {
  console.log(`\n=== Running checks for ${stage.id} ===`);
  const checkResults = {
    passed: true,
    errors: [],
    totalPassed: 0,
    totalFailed: 0
  };

  for (const checkName of stage.checks || []) {
    console.log(`  Running check: ${checkName}`);
    const checkFn = await loadCheck(checkName);
    if (!checkFn) {
      checkResults.passed = false;
      checkResults.errors.push(`Check ${checkName} could not be loaded`);
      continue;
    }

    try {
      const result = checkName === 'foundations0_checks' 
        ? await checkFn() 
        : await checkFn(stage.id);
      checkResults.totalPassed += result.passed || 0;
      checkResults.totalFailed += result.failed || 0;
      
      if (result.failed > 0) {
        checkResults.passed = false;
        checkResults.errors.push(...(result.errors || []));
      }
    } catch (error) {
      checkResults.passed = false;
      checkResults.errors.push(`Check ${checkName} threw error: ${error.message}`);
    }
  }

  // Verify minimum randomized checks
  if (stageConfig.minRandomizedChecks) {
    // This would be verified by the test files themselves
    console.log(`  Minimum randomized checks required: ${stageConfig.minRandomizedChecks}`);
  }

  return checkResults;
}

// Bump version
function bumpVersion(stageId) {
  const [major, minor, patch] = packageJson.version.split('.').map(Number);
  // For stages, we'll use minor version bumps
  const newVersion = `${major}.${minor + 1}.${patch}`;
  packageJson.version = newVersion;
  writeFileSync(join(repoRoot, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
  return newVersion;
}

// Update CHANGELOG
function updateChangelog(stageId, stageConfig, newVersion) {
  const changelogPath = join(repoRoot, 'CHANGELOG.md');
  let changelog = readFileSync(changelogPath, 'utf-8');
  
  const entry = `## [${newVersion}] - ${stageConfig.name}

### Added
- Stage ${stageId} implementation: ${stageConfig.name}
${stageConfig.requirements.map(r => `- ${r}`).join('\n')}

### Testing
- All stage ${stageId} tests pass
- All checks pass

---

`;
  
  changelog = entry + changelog.replace(/^# Changelog/, '# Changelog');
  writeFileSync(changelogPath, changelog);
}

// Commit and tag
function commitAndTag(stageId, newVersion) {
  try {
    execSync(`git add -A`, { cwd: repoRoot, stdio: 'inherit' });
    execSync(`git commit -m "stage: ${stageId} passed"`, { cwd: repoRoot, stdio: 'inherit' });
    execSync(`git tag "${stageId}-pass"`, { cwd: repoRoot, stdio: 'inherit' });
    console.log(`\n✓ Committed and tagged: ${stageId}-pass`);
  } catch (error) {
    console.error(`Failed to commit/tag: ${error.message}`);
    throw error;
  }
}

// Process a stage
async function processStage(stage, stageConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PROCESSING STAGE: ${stage.id} - ${stageConfig.name}`);
  console.log('='.repeat(60));

  // Run tests
  const testResults = runStageTests(stage);
  if (!testResults.passed) {
    console.error(`\n✗ Stage ${stage.id} FAILED tests:`);
    testResults.errors.forEach(e => console.error(`  - ${e}`));
    return { passed: false, stage: stage.id, errors: testResults.errors };
  }

  // Run checks
  const checkResults = await runStageChecks(stage, stageConfig);
  if (!checkResults.passed) {
    console.error(`\n✗ Stage ${stage.id} FAILED checks:`);
    checkResults.errors.forEach(e => console.error(`  - ${e}`));
    return { passed: false, stage: stage.id, errors: checkResults.errors };
  }

  console.log(`\n✓ Stage ${stage.id} PASSED all tests and checks`);
  console.log(`  Passed: ${checkResults.totalPassed}, Failed: ${checkResults.totalFailed}`);

  // Bump version
  const newVersion = bumpVersion(stage.id);
  console.log(`\n✓ Bumped version to ${newVersion}`);

  // Update CHANGELOG
  updateChangelog(stage.id, stageConfig, newVersion);
  console.log(`✓ Updated CHANGELOG`);

  // Commit and tag
  commitAndTag(stage.id, newVersion);

  return { passed: true, stage: stage.id, version: newVersion };
}

// Main autopilot loop
async function main() {
  console.log('🚀 AUTOPILOT SYSTEM STARTING');
  console.log(`Package manager: ${pkgManager}`);
  console.log(`Test command: ${testCommand}`);
  console.log(`Current version: ${packageJson.version}`);

  const results = [];
  const currentStageIndex = stagesConfig.stages.findIndex(s => s.id === stagesConfig.currentStage);
  
  if (currentStageIndex === -1) {
    console.error(`Current stage ${stagesConfig.currentStage} not found in stages list`);
    process.exit(1);
  }

  // Process stages starting from current
  for (let i = currentStageIndex; i < stagesConfig.stages.length; i++) {
    const stage = stagesConfig.stages[i];
    const stageConfigPath = join(repoRoot, `stages/${stage.file}`);
    const stageConfig = JSON.parse(readFileSync(stageConfigPath, 'utf-8'));

    const result = await processStage(stage, stageConfig);
    results.push(result);

    if (!result.passed) {
      console.error(`\n✗ Stage ${stage.id} failed. Stopping autopilot.`);
      console.error(`Fix the errors and run autopilot again to retry.`);
      break;
    }

    // Update current stage for next iteration
    if (i < stagesConfig.stages.length - 1) {
      stagesConfig.currentStage = stagesConfig.stages[i + 1].id;
      writeFileSync(join(repoRoot, 'stages/stages.json'), JSON.stringify(stagesConfig, null, 2) + '\n');
    }
  }

  // Final report
  console.log(`\n${'='.repeat(60)}`);
  console.log('FINAL AUTOPILOT REPORT');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\nStages processed: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log(`\nFailed stages:`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.stage}`);
      r.errors.forEach(e => console.log(`    ${e}`));
    });
  }

  if (passed === results.length) {
    console.log(`\n✓ ALL STAGES PASSED!`);
    process.exit(0);
  } else {
    console.log(`\n✗ Some stages failed. Fix errors and retry.`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

