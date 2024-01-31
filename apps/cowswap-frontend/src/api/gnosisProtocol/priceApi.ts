import { RAW_CODE_LINK } from '@cowprotocol/common-const'
import { environmentName } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { GpPriceStrategy } from 'legacy/state/gas/atoms'

const API_NAME = 'CoW Protocol'
const STRATEGY_URL_BASE = RAW_CODE_LINK + '/configuration/config/'
const ENV_BASE = environmentName !== 'production' ? 'barn' : environmentName
const STRATEGY_URL = STRATEGY_URL_BASE + ENV_BASE + '/strategies'

const STRATEGY_API_URL: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: STRATEGY_URL + '/strategy-1.json',
  [SupportedChainId.GNOSIS_CHAIN]: STRATEGY_URL + '/strategy-100.json',
  [SupportedChainId.SEPOLIA]: STRATEGY_URL + '/strategy-11155111.json',
}

export type PriceStrategy = {
  primary: GpPriceStrategy
  secondary: GpPriceStrategy
}

function _getPriceStrategyApiBaseUrl(chainId: SupportedChainId): string {
  const baseUrl = STRATEGY_API_URL[chainId]
  if (!baseUrl) {
    new Error(
      `Unsupported Network. The ${API_NAME} strategy API is not deployed in the Network ` +
        chainId +
        '. Defaulting to using Mainnet strategy.'
    )
  }
  return baseUrl
}

function _fetchPriceStrategy(chainId: SupportedChainId): Promise<Response> {
  const baseUrl = _getPriceStrategyApiBaseUrl(chainId)
  return fetch(baseUrl)
}

export async function getPriceStrategy(chainId: SupportedChainId): Promise<PriceStrategy> {
  console.log(`[api:${API_NAME}] Get GP price strategy for`, chainId)

  const response = await _fetchPriceStrategy(chainId)

  if (!response.ok) {
    const errorResponse = await response.json()
    console.log(errorResponse)
    throw new Error(errorResponse?.description)
  } else {
    return response.json()
  }
}
