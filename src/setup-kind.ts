import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as path from 'path';
import * as installer from './installer';

async function run() {
  try {
    let version = core.getInput('kind-version');
    if (version) {
      const toolPath = await installer.getKind(version);
      const tool = path.join(toolPath, 'kind');

      await exec.exec('chmod', ['+x', tool]);
      await exec.exec(tool, ['create', 'cluster']);

      await io.cp(
        '/home/runner/.kube/kind-config-kind',
        '/home/runner/.kube/config',
        {recursive: true, force: true}
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
