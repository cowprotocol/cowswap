#!/bin/bash

set -euo pipefail

# If image does not exist, don't use cache
docker pull "gnosispm/$DOCKERHUB_PROJECT:$1" && \
docker build -t "$DOCKERHUB_PROJECT" -f src/docker/Dockerfile . --cache-from "gnosispm/$DOCKERHUB_PROJECT:$1" || \
docker build -t "$DOCKERHUB_PROJECT" -f src/docker/Dockerfile .

docker tag "$DOCKERHUB_PROJECT" "gnosispm/$DOCKERHUB_PROJECT:$1"
docker push "gnosispm/$DOCKERHUB_PROJECT:$1"
