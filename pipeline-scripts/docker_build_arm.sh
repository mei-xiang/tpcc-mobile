#!/usr/bin/env bash
echo "==== Docker Build ===="
echo "docker tag: ${DOCKER_REGISTRY}/${GROUP_NAME}/${PROJECT_NAME}:${CI_COMMIT_TAG}"

# 拷贝dist包到dockerfile目录
cp -r /cache/${CI_PROJECT_NAME}-${CI_PROJECT_ID}-${CI_COMMIT_REF_NAME}-${CI_COMMIT_SHA}/dist .
cp -rf /root/.docker/* .choerodon/.docker/
docker login -u ${DOCKER_USER} -p ${DOCKER_PWD} ${DOCKER_REGISTRY}
# 构建arm64镜像
docker pull registry.saas.crland.com.cn/java/nginx:1.21.6-arm64
docker buildx use default
docker buildx ls
docker buildx build -f Dockerfile.arm -t ${DOCKER_REGISTRY}/${GROUP_NAME}/${PROJECT_NAME}:${CI_COMMIT_TAG} . --platform=linux/arm64  --push

# 清理镜像
docker rmi ${DOCKER_REGISTRY}/${GROUP_NAME}/${PROJECT_NAME}:${CI_COMMIT_TAG}
