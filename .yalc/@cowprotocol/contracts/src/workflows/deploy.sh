#!/bin/bash

set -o nounset
set -o pipefail
set -o errexit

GIT_BRANCH="${1:-""}"

fail_if_unset () {
  VAR_NAME="$1"
  if [[ -z "${!VAR_NAME:-""}" ]]; then
    printf '%s not set\n' "$VAR_NAME" >&2
    exit 1
  fi
}
gwei_to_wei () {
  GWEI="$1"
  printf "%s000000000" "${GWEI}"
}

fail_if_unset "ETHERSCAN_API_KEY"
fail_if_unset "INFURA_KEY"
fail_if_unset "PK"

GAS_PRICE_WEI_MAINNET="$( \
  curl --silent "https://safe-relay.gnosis.io/api/v1/gas-station/" \
    | jq -e --raw-output .fast \
)"
if ! [[ "$GAS_PRICE_WEI_MAINNET" =~ ^[1-9][0-9]{9,11}$ ]]; then
  echo "Invalid mainnet gas price $GAS_PRICE_WEI_MAINNET (wei)" >&2
  exit 1
fi

yarn deploy --network rinkeby --gasprice "$(gwei_to_wei 1)"
yarn deploy --network xdai --gasprice "$(gwei_to_wei 1)"
yarn deploy --network mainnet --gasprice "$GAS_PRICE_WEI_MAINNET"

# wait for Etherscan to register the new contracts on the blockchain
sleep 60

yarn verify:etherscan --network rinkeby
yarn verify:etherscan --network mainnet
yarn verify:tenderly --network xdai

if [ -n "$GIT_BRANCH" ]; then
  GIT_USERNAME="GitHub Actions"
  GIT_USEREMAIL="GitHub-Actions@GPv2-contracts"
  if ! git config --get user.name &>/dev/null; then
    git config user.name "$GIT_USERNAME"
    git config user.email "$GIT_USEREMAIL"
  fi

  git checkout -b "$GIT_BRANCH"
  git add .
  git commit -m "Deploy latest contract version"
  git push --set-upstream origin "$GIT_BRANCH"
fi
