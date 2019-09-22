#!/bin/sh

set -e

KIND="$1"
KUBECONFIG="$GITHUB_WORKSPACE"/"$2"

apk add -U wget
wget -O /usr/local/bin/kind https://github.com/kubernetes-sigs/kind/releases/download/"${KIND}"/kind-linux-amd64
chmod +x /usr/local/bin/kind

kind create cluster

cp /usr/local/bin/kind "$GITHUB_WORKSPACE"
cat "$(kind get kubeconfig-path)" > "$KUBECONFIG"