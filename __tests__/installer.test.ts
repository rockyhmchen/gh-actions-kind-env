import io = require('@actions/io');
import fs = require('fs');
import os = require('os');
import path = require('path');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as installer from '../src/installer';
import {defaultCoreCipherList} from 'constants';

const IS_WINDOWS = process.platform === 'win32';

describe('installer tests', () => {
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

  it('Acquires version of kind if no matching version is installed', async () => {
    await installer.getKind('v0.5.1');
    const kindDir = path.join(toolDir, 'kind', '0.5.1', os.arch());

    expect(fs.existsSync(`${kindDir}.complete`)).toBe(true);
    if (IS_WINDOWS) {
      expect(fs.existsSync(path.join(kindDir, 'bin', 'kind.exe'))).toBe(true);
    } else {
      expect(fs.existsSync(path.join(kindDir, 'bin', 'kind'))).toBe(true);
    }
  }, 100000);

  it('Throws if no location contains correct kind version', async () => {
    let thrown = false;
    try {
      await installer.getKind('1000.0');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Uses version of kind installed in cache', async () => {
    const kindDir: string = path.join(toolDir, 'kind', '0.5.0', os.arch());
    await io.mkdirP(kindDir);
    fs.writeFileSync(`${kindDir}.complete`, 'hello');
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await installer.getKind('v0.5.0');
    return;
  });

  it('Doesnt use version of kind that was only partially installed in cache', async () => {
    const kindDir: string = path.join(toolDir, 'kind', 'v0.4.0', os.arch());
    await io.mkdirP(kindDir);
    let thrown = false;
    try {
      // This will throw if it doesn't find it in the cache (because no such version exists)
      await installer.getKind('v0.4');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
    return;
  });
});
