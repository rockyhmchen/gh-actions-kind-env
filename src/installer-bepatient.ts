import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import * as path from 'path';
import * as util from 'util';

export async function getBepatient(version: string): Promise<string> {
  // check cache
  let toolPath: string;
  toolPath = tc.find('bepatient', version);

  if (!toolPath) {
    // download, rename, cache
    toolPath = await acquireBepatient(version);
    core.debug('Bepatient tool is cached under ' + toolPath);
  }

  toolPath = path.join(toolPath, 'bin');
  core.addPath(toolPath);

  return toolPath;
}

async function acquireBepatient(version: string): Promise<string> {
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
  let bepatientPath = path.join(tempPath, `bepatient-${version}`);
  let binary = 'bepatient';

  const dest = path.join(bepatientPath, 'bin', binary);

  await io.mv(original, dest);

  //
  // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
  //
  const toolRoot = bepatientPath;
  return await tc.cacheDir(toolRoot, 'bepatient', version);
}

function getTempPath(fullPath: string): string {
  var indexOf = fullPath.lastIndexOf('/');
  var tempPath = fullPath.substring(0, indexOf);
  return tempPath;
}

function getDownloadUrl(version: string): string {
  let binary = 'bepatient';
  return util.format(
    'https://github.com/rockyhmchen/bepatient/releases/download/%s/%s',
    version,
    binary
  );
}
