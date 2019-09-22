# K8S test environment creator

This action is to create a Kubernetes environment for test using [kind](https://github.com/kubernetes-sigs/kind)

## Inputs

### `kind-version`

**Required** The version of kind. Default `v0.5.1`.

### `kubeconfig-file`

**Required** KUBECONFIG file.

## Example usage

```
    - name: Initial a kube config file.
      run: |
        touch "${GITHUB_WORKSPACE}"/kind-kube.config

    - name: Create a cluster
      id: kind-env
      uses: rockyhmchen/gh-actions-kind-env@master
      with:
        kind-version: "v0.5.1"
        kubeconfig-file: "kind-kube.config"

    - name: Set KUBECONFIG
      run: |
        export KUBECONFIG="${GITHUB_WORKSPACE}"/kind-kube.config
```