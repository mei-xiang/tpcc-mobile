#!/usr/bin/env bash
echo "==== Run lint ===="
npm run lint
npm run lint:style
echo "==== Run unit test ===="
npm run test:unit
echo "==== Run test for coverage report ===="
#npm run test-sonar todo
echo "==== Run sonar-scanner ===="
#npm run sonar-scanner -- \ todo
#  -Dsonar.sourceEncoding="UTF-8" \
#  -Dsonar.host.url=${SONAR_URL} \
#  -Dsonar.token=${SONAR_TOKEN} \
#  -Dsonar.gitlab.project_id=${CI_PROJECT_PATH} \
#  -Dsonar.gitlab.commit_sha=${CI_COMMIT_SHA} \
#  -Dsonar.gitlab.ref_name=${CI_COMMIT_REF_NAME} \
#  -Dsonar.gitlab.query_wait="5000" \
#  -Dsonar.analysis.serviceGroup=${GROUP_NAME} \
#  -Dsonar.analysis.commitId=${CI_COMMIT_SHA} \
#  -Dsonar.projectKey=${GROUP_NAME}:${PROJECT_NAME} \
#  -Dsonar.projectName=${GROUP_NAME}/${PROJECT_NAME} \
#  -Dsonar.projectVersion=commit-${CI_COMMIT_SHA} \
#  -Dsonar.sources=./src \
#  -Dsonar.exclusions=**/node_modules/**/*,**/coverage-reports/** \
#  -Dsonar.typescript.exclusions=**/node_modules/** \
#  -Dsonar.typescript.lcov.reportPaths=coverage-reports/lcov.info \
#  -Dsonar.test.inclusions=**/__test__/*.spec.ts,**/__test__/*.test.ts \
#  -Dsonar.testExecutionReportPaths=test-report.xml \
#  -Dsonar.coverage.exclusions=src/**/*.tsx,src/**/index.ts,src/**/*.stories.tsx,src/**/*.styles.ts,src/constants/**,src/root/*,src/**/constants.ts,src/**/constants/**,src/**/interfaces.ts,src/**/interfaces/**,src/momentToDayjs.ts
