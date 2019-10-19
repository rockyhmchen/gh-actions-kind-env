# K8S test environment creator

This action is to create a Kubernetes environment for test using [kind](https://github.com/kubernetes-sigs/kind)

## Inputs

### `kind-version`

**Required** The version of kind. Default `v0.5.1`.

## Example usage

```
    - name: Setup kind and create cluster
      uses: rockyhmchen/gh-actions-kind-env@js-ver
      with:
        kind-version: "v0.5.1"
```