#!/bin/bash

# Only:
# - Tagged commits
# - Security env variables are available.
if [ -n "$TRAVIS_TAG" ] && [ -n "$AWS_ACCESS_KEY_ID" ]
then
  REVIEW_ENVIRONMENT_DOMAIN='review.gnosisdev.com'

  # Feature name without all path. Example gnosis/conditional-tokens-explorer -> conditional-tokens-explorer
  REPO_NAME=$(basename $TRAVIS_REPO_SLUG)
  # Only alphanumeric characters. Example conditional-tokens-explorer -> conditional-tokens-explorer
  REPO_NAME_ALPHANUMERIC=$(echo $REPO_NAME | sed 's/[^a-zA-Z0-9]//g')

  # Only alphanumeric characters. Example v1.0.0 -> v100
  TRAVIS_TAG_ALPHANUMERIC=$(echo $TRAVIS_TAG | sed 's/[^a-zA-Z0-9]//g')

  REVIEW_RELEASE_FOLDER="$REPO_NAME_ALPHANUMERIC/$TRAVIS_TAG_ALPHANUMERIC"

  # Deploy cte release project
  aws s3 sync build s3://${REVIEW_BUCKET_NAME}/${REVIEW_RELEASE_FOLDER} --delete --exclude "*.html" --exclude "/page-data" --metadata-directive REPLACE --cache-control max-age=31536000,public

  aws s3 sync build s3://${REVIEW_BUCKET_NAME}/${REVIEW_RELEASE_FOLDER} --delete --exclude "*" --include "*.html" --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html
fi
