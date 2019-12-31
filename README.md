# K8S test environment creator

This action is to
- create a Kubernetes environment for test using [kind](https://github.com/kubernetes-sigs/kind)
- set up [kubefwd](https://github.com/txn2/kubefwd) tool
- set up [bepatient](https://github.com/rockyhmchen/bepatient) tool

## Inputs

- ### `kind-version`

  **Required** The version of kind. Default `v0.5.1`.

- ### `kubefwd-version`

  **Required** The version of kubefwd. Default `v1.9.2`.

- ### `bepatient-version`

  **Required** The version of bepatient. Default `v0.1.0`.

## Example usage

```
    - name: Create cluster
      uses: rockyhmchen/gh-actions-kind-env@master
      with:
        kind-version: "v0.5.1"
        kubefwd-version: "v1.9.2"
        bepatient-version: "v1.9.2"
```