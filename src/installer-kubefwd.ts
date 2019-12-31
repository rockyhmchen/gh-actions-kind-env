import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as util from 'util';

const IS_WINDOWS = process.platform === 'win32';

let osPlat: string = os.platform();

export async function getKubefwd(version: string): Promise<string> {
  // check cache
  let toolPath: string;
  toolPath = tc.find('kubefwd', version);

  if (!toolPath) {
    // download, extract, cache
    toolPath = await acquireKubefwd(version);
    core.debug('Kubefwd tool is cached under ' + toolPath);
  }

  // toolPath = path.join(toolPath, 'bin');
  core.debug('@@@@@ toolPath: ' + toolPath);
  core.addPath(toolPath);

  return toolPath;
}

async function acquireKubefwd(version: string): Promise<string> {
  //
  // Download - a tool installer intimately knows how to get the tool (and construct urls)
  //
  let fileName: string = getFileName();
  let downloadUrl: string = getDownloadUrl(version, fileName);
  let downloadPath: string | null = null;
  try {
    downloadPath = await tc.downloadTool(downloadUrl);
  } catch (error) {
    core.debug(error);

    throw `Failed to download version ${version}: ${error}`;
  }

  //
  // Extract
  //
  let extPath: string;
  if (IS_WINDOWS) {
    extPath = await tc.extractZip(downloadPath);
  } else {
    extPath = await tc.extractTar(downloadPath);
  }
  core.debug('@@@@@ extPath1: ' + extPath);

  //
  // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
  //
  const toolRoot = extPath;
  core.debug('@@@@@ toolRoot: ' + toolRoot);
  return await tc.cacheDir(toolRoot, 'kubefwd', version);
}

function getTempPath(fullPath: string): string {
  var indexOf = IS_WINDOWS
    ? fullPath.lastIndexOf('\\')
    : fullPath.lastIndexOf('/');
  var tempPath = fullPath.substring(0, indexOf);
  return tempPath;
}

function getFileName(): string {
  const platform: string = IS_WINDOWS ? 'windows' : 'linux';
  const ext: string = osPlat == 'win32' ? 'zip' : 'tar.gz';
  const filename: string = util.format('kubefwd_%s_amd64.%s', platform, ext);
  return filename;
}

function getDownloadUrl(version: string, filename: string): string {
  return util.format(
    'https://github.com/txn2/kubefwd/releases/download/%s/%s',
    version,
    filename
  );
}
