// Load tempDirectory before it gets wiped by tool-cache
// let tempDirectory = process.env['RUNNER_TEMPDIRECTORY'] || '';
// console.log('@@@@@@@ tempDirectory: ' + tempDirectory);

import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import * as path from 'path';
import * as util from 'util';

const IS_WINDOWS = process.platform === 'win32';

// if (!tempDirectory) {
//   let baseLocation;
//   if (IS_WINDOWS) {
//     // On windows use the USERPROFILE env variable
//     baseLocation = process.env['USERPROFILE'] || 'C:\\';
//   } else {
//     if (process.platform === 'darwin') {
//       baseLocation = '/Users';
//     } else {
//       baseLocation = '/home';
//     }
//   }
//   tempDirectory = path.join(baseLocation, 'actions', 'temp');
//   core.warning('@@@@@ tempDirectory2: ' + tempDirectory);
// }

export async function getKind(version: string): Promise<string> {
  // check cache
  let toolPath: string;
  toolPath = tc.find('kind', version);
  core.warning('@@@ toolPath1: ' + toolPath);

  if (!toolPath) {
    // download, rename, cache
    toolPath = await acquireKind(version);
    core.warning('@@@ toolPath2: ' + toolPath);
    core.warning('Kind tool is cached under ' + toolPath);
  }

  toolPath = path.join(toolPath, 'bin');
  core.warning('@@@ toolPath3: ' + toolPath);
  core.addPath(toolPath);

  return toolPath;
}

async function acquireKind(version: string): Promise<string> {
  //
  // Download
  //
  let downloadUrl: string = getDownloadUrl(version);
  core.warning('@@@ download url: ' + downloadUrl);
  let downloadFile: string | null = null;
  try {
    downloadFile = await tc.downloadTool(downloadUrl);
    core.warning('@@@ download file: ' + downloadFile);
  } catch (error) {
    core.warning(error);

    throw `Failed to download version ${version}: ${error}`;
  }

  //
  // Rename
  //
  const original = downloadFile;
  core.warning('@@@ original: ' + original);

  let tempPath: string = getTempPath(original);
  if (!tempPath) {
    throw new Error('Temp directory not set');
  }
  let kindPath = path.join(tempPath, `kind-${version}`);
  core.warning('@@@ kindPath: ' + kindPath);

  let binary = 'kind';
  if (IS_WINDOWS) {
    binary = 'kind.exe';
  }

  const dest = path.join(kindPath, 'bin', binary);
  core.warning('@@@ dest: ' + dest);

  await io.mv(original, dest);

  //
  // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
  //
  const toolRoot = kindPath;
  core.warning('@@@ toolRoot: ' + toolRoot);
  return await tc.cacheDir(toolRoot, 'kind', version);
}

function getTempPath(fullPath: string): string {
  var n = IS_WINDOWS ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/');
  var res = fullPath.substring(0, n);
  return res;
}

function getDownloadUrl(version: string): string {
  let binary = 'kind-linux-amd64';
  if (IS_WINDOWS) {
    binary = 'kind-windows-amd64';
  }
  return util.format(
    'https://github.com/kubernetes-sigs/kind/releases/download/%s/%s',
    version,
    binary
  );
}
