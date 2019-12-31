import io = require('@actions/io');
import fs = require('fs');
import os = require('os');
import path = require('path');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as installer from '../src/installer-bepatient';

describe('installer of bepatient tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, 100000);

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  it('Acquires version of bepatient if no matching version is installed', async () => {
    await installer.getBepatient('v0.1.0');
    const bepatientDir = path.join(toolDir, 'bepatient', '0.1.0', os.arch());

    expect(fs.existsSync(`${bepatientDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(bepatientDir, 'bin', 'bepatient'))).toBe(
      true
    );
  }, 100000);

  it('Throws if no location contains correct bepatient version', async () => {
    let thrown = false;
    try {
      await installer.getBepatient('1000.0');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });
});
