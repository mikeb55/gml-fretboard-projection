/**
 * Run tests for a specific version
 */

const version = process.argv[2] || 'v0.1.3';

let testFile;
switch(version) {
  case 'v0.1.0':
    testFile = '../test-v0.1.0.js';
    break;
  case 'v0.1.1':
    testFile = '../test-v0.1.1.js';
    break;
  case 'v0.1.2':
    testFile = '../test-v0.1.2.js';
    break;
  case 'v0.1.3':
    testFile = '../test-v0.1.3.js';
    break;
  default:
    console.error(`Unknown version: ${version}`);
    process.exit(1);
}

import(testFile).catch(err => {
  console.error(`Failed to load test file: ${err.message}`);
  process.exit(1);
});
