import io = require('@actions/io');
import fs = require('fs');
import os = require('os');
import path = require('path');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as installer from '../src/installer-kubefwd';

const IS_WINDOWS = process.platform === 'win32';

describe('installer of kubefwd tests', () => {
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

  it('Acquires version of kubefwd if no matching version is installed', async () => {
    await installer.getKubefwd('v1.9.2');
    const kubefwdDir = path.join(toolDir, 'kubefwd', '1.9.2', os.arch());

    expect(fs.existsSync(`${kubefwdDir}.complete`)).toBe(true);
    if (IS_WINDOWS) {
      expect(fs.existsSync(path.join(kubefwdDir, 'kubefwd.exe'))).toBe(true);
    } else {
      expect(fs.existsSync(path.join(kubefwdDir, 'kubefwd'))).toBe(true);
    }
  }, 100000);

  it('Throws if no location contains correct kubefwd version', async () => {
    let thrown = false;
    try {
      await installer.getKubefwd('1000.0');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  // it('Uses version of kubefwd installed in cache', async () => {
  //   const kubefwdDir: string = path.join(
  //     toolDir,
  //     'kubefwd',
  //     '1.9.1',
  //     os.arch()
  //   );
  //   await io.mkdirP(kubefwdDir);
  //   fs.writeFileSync(`${kubefwdDir}.complete`, 'hello');
  //   // This will throw if it doesn't find it in the cache (because no such version exists)
  //   await installer.getKubefwd('v1.9.1');
  //   return;
  // });

  // it('Doesnt use version of kubefwd that was only partially installed in cache', async () => {
  //   const kubefwdDir: string = path.join(
  //     toolDir,
  //     'kubefwd',
  //     'v1.8.4',
  //     os.arch()
  //   );
  //   await io.mkdirP(kubefwdDir);
  //   let thrown = false;
  //   try {
  //     // This will throw if it doesn't find it in the cache (because no such version exists)
  //     await installer.getKubefwd('v1.8');
  //   } catch {
  //     thrown = true;
  //   }
  //   expect(thrown).toBe(true);
  //   return;
  // });
});
