import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as path from 'path';
import * as kindInstaller from './installer-kind';
import * as kubefwdInstaller from './installer-kubefwd';
import * as bepatientInstaller from './installer-bepatient';

async function run() {
  await setKind();
  await setKubefwd();
  await setBepatient();
}

async function setKind() {
  try {
    let version = core.getInput('kind-version');
    if (version) {
      const toolPath = await kindInstaller.getKind(version);
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

async function setKubefwd() {
  try {
    let version = core.getInput('kubefwd-version');
    if (version) {
      let toolPath = await kubefwdInstaller.getKubefwd(version);
      let tool = path.join(toolPath, 'kubefwd');

      await exec.exec('chmod', ['+x', tool]);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function setBepatient() {
  try {
    let version = core.getInput('bepatient-version');
    if (version) {
      let toolPath = await bepatientInstaller.getBepatient(version);
      let tool = path.join(toolPath, 'bepatient');

      await exec.exec('chmod', ['+x', tool]);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
