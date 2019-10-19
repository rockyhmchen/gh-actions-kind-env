import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import * as path from 'path';
import * as util from 'util';

const IS_WINDOWS = process.platform === 'win32';

export async function getKind(version: string): Promise<string> {
  // check cache
  let toolPath: string;
  toolPath = tc.find('kind', version);

  if (!toolPath) {
    // download, rename, cache
    toolPath = await acquireKind(version);
    core.debug('Kind tool is cached under ' + toolPath);
  }

  toolPath = path.join(toolPath, 'bin');
  core.addPath(toolPath);

  return toolPath;
}

async function acquireKind(version: string): Promise<string> {
  //
  // Download
  //
  let downloadUrl: string = getDownloadUrl(version);
  let downloadFile: string | null = null;
  try {
    downloadFile = await tc.downloadTool(downloadUrl);
  } catch (error) {
    core.error(error);
    throw `Failed to download version ${version}: ${error}`;
  }

  //
  // Rename
  //
  const original = downloadFile;

  let tempPath: string = getTempPath(original);
  if (!tempPath) {
    throw new Error('Temp directory not set');
  }
  let kindPath = path.join(tempPath, `kind-${version}`);
  let binary = 'kind';
  if (IS_WINDOWS) {
    binary = 'kind.exe';
  }
  const dest = path.join(kindPath, 'bin', binary);

  await io.mv(original, dest);

  //
  // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
  //
  const toolRoot = kindPath;
  return await tc.cacheDir(toolRoot, 'kind', version);
}

function getTempPath(fullPath: string): string {
  var indexOf = IS_WINDOWS
    ? fullPath.lastIndexOf('\\')
    : fullPath.lastIndexOf('/');
  var tempPath = fullPath.substring(0, indexOf);
  return tempPath;
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
