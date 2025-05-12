#!/usr/bin/env bash
echo "==== Docker Build ===="
echo "docker tag: ${DOCKER_REGISTRY}/${GROUP_NAME}/${PROJECT_NAME}:${CI_COMMIT_TAG}"
cp -r /cache/${CI_PROJECT_NAME}-${CI_PROJECT_ID}-${CI_COMMIT_REF_NAME}-${CI_COMMIT_SHA}/dist/ .
docker build -t ${DOCKER_REGISTRY}/${GROUP_NAME}/${PROJECT_NAME}:${CI_COMMIT_TAG} ${1:-"."}

echo "==== Docker Login ===="
docker login -u ${DOCKER_USER} -p ${DOCKER_PWD} ${DOCKER_REGISTRY}

echo "==== Docker Push ===="
docker push ${DOCKER_REGISTRY}/${GROUP_NAME}/${PROJECT_NAME}:${CI_COMMIT_TAG}
