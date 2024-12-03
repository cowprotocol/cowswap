import { RAW_CODE_LINK } from '@cowprotocol/common-const'
import { environmentName } from '@cowprotocol/common-utils'
import { SupportedChainId, mapSupportedNetworks } from '@cowprotocol/cow-sdk'

import { PriceStrategy as PriceStrategyEnum } from 'legacy/state/gas/atoms'

const API_NAME = 'CoW Protocol'
const STRATEGY_URL_BASE = RAW_CODE_LINK + '/configuration/config/'
const ENV_BASE = environmentName !== 'production' ? 'barn' : environmentName
const STRATEGY_URL = STRATEGY_URL_BASE + ENV_BASE + '/strategies'

const STRATEGY_API_URL = mapSupportedNetworks((chainId: SupportedChainId) => `${STRATEGY_URL}/strategy-${chainId}.json`)

export type PriceStrategy = {
  primary: PriceStrategyEnum
  secondary: PriceStrategyEnum
}

function _getPriceStrategyApiBaseUrl(chainId: SupportedChainId): string {
  const baseUrl = STRATEGY_API_URL[chainId]
  if (!baseUrl) {
    new Error(
      `Unsupported Network. The ${API_NAME} strategy API is not deployed in the Network ` +
        chainId +
        '. Defaulting to using Mainnet strategy.',
    )
  }
  return baseUrl
}

function _fetchPriceStrategy(chainId: SupportedChainId): Promise<Response> {
  const baseUrl = _getPriceStrategyApiBaseUrl(chainId)
  return fetch(baseUrl)
}

export async function getPriceStrategy(chainId: SupportedChainId): Promise<PriceStrategy> {
  const response = await _fetchPriceStrategy(chainId)

  if (!response.ok) {
    const errorResponse = await response.json()
    console.log(errorResponse)
    throw new Error(errorResponse?.description)
  } else {
    return response.json()
  }
}
