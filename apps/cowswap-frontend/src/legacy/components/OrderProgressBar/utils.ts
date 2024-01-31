import { SupportedChainId } from '@cowprotocol/cow-sdk'

const EXPECTED_EXECUTION_TIME_PERCENTAGE = 75

export const EXPECTED_EXECUTION_TIME: Record<SupportedChainId, number> = {
  [SupportedChainId.MAINNET]: 120,
  [SupportedChainId.GNOSIS_CHAIN]: 50,
  [SupportedChainId.SEPOLIA]: 50,
}

const LOG_FUNCTION = Math.log2

function getPercentageLogarithmicAux(seconds: number, expirationInSeconds: number) {
  return (100 / LOG_FUNCTION(expirationInSeconds + 1)) * Math.log2(seconds + 1)
}

function getPercentageLogarithmic(seconds: number, expirationInSeconds: number, chainId: SupportedChainId) {
  const percentage =
    ((100 - EXPECTED_EXECUTION_TIME_PERCENTAGE) / 100) *
    getPercentageLogarithmicAux(seconds - EXPECTED_EXECUTION_TIME[chainId], expirationInSeconds)
  return EXPECTED_EXECUTION_TIME_PERCENTAGE + percentage
}

function getPercentageLinear(seconds: number, chainId: SupportedChainId) {
  return (EXPECTED_EXECUTION_TIME_PERCENTAGE * seconds) / EXPECTED_EXECUTION_TIME[chainId]
}

export function getPercentage(seconds: number, expirationInSeconds: number, chainId: SupportedChainId) {
  if (seconds >= expirationInSeconds) {
    return 100
  } else if (seconds < EXPECTED_EXECUTION_TIME[chainId]) {
    return getPercentageLinear(seconds, chainId)
  } else {
    return getPercentageLogarithmic(seconds, expirationInSeconds, chainId)
  }
}
