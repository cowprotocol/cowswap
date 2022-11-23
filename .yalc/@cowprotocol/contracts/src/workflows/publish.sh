#!/bin/bash

set -o nounset
set -o pipefail
set -o errexit

fail_if_unset () {
  local var_name="$1"
  if [[ -z "${!var_name:-""}" ]]; then
    printf '%s not set\n' "$var_name" >&2
    exit 1
  fi
}

fail_if_unset GITLAB_TRIGGER_TOKEN
fail_if_unset BUCKET_NAME
fail_if_unset PUBLISH_SERVER
fail_if_unset AWS_ACCESS_KEY_ID
fail_if_unset AWS_SECRET_ACCESS_KEY
fail_if_unset AWS_REGION

git_username="GitHub Actions"
git_useremail="GitHub-Actions@GPv2-contracts"

package_name="$(jq --raw-output .name ./package.json)"
version="$(jq --raw-output .version ./package.json)"

if grep --silent --line-regexp --fixed-strings -- "$version" \
    <(npm view --json "$package_name" | jq '.versions[] | .' --raw-output); then
  echo "Version $version already published"
  exit 1
fi

version_tag="v$version"
if git fetch --end-of-options origin "refs/tags/$version_tag" 2>/dev/null; then
  echo "Tag $version_tag is already present"
  exit 1
fi

yarn pack --filename package.tgz

aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
aws configure set region "$AWS_REGION"
if ! aws s3 cp package.tgz "s3://$BUCKET_NAME/gp-v2-contracts/gp-v2-contracts-$version.tgz"; then
  echo "Failed upload to aws"
  exit 1
fi

if ! pipeline_url="$(\
     curl --silent --request POST \
       --form-string "token=$GITLAB_TRIGGER_TOKEN" \
       --form-string "ref=master" \
       --form-string "variables[PROJECT]=$package_name" \
       --form-string "variables[VERSION]=$version" \
       --form-string "variables[TOKEN]=$GITLAB_TRIGGER_TOKEN" \
       "$PUBLISH_SERVER" \
       | jq -e '.web_url'\
     )"; then
  echo "Error triggering publish request"
  exit 1
fi

if ! git config --get user.name &>/dev/null; then
  git config user.name "$git_username"
  git config user.email "$git_useremail"
fi
git tag -m "Version $version" --end-of-options "$version_tag"

git push origin "refs/tags/$version_tag"

echo "Package $package_name version $version successfully submitted for publication."
echo "Progress can be tracked here: $pipeline_url"
