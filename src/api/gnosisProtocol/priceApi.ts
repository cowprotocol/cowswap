import { GpPriceStrategy } from 'state/gas/atoms'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { RAW_CODE_LINK } from 'constants/index'
import { environmentName } from 'utils/environments'

const API_NAME = 'CoW Protocol'
const STRATEGY_URL_BASE = RAW_CODE_LINK + '/configuration/config/'

function getPriceStrategyUrl(): Record<SupportedChainId, string> {
  const environment = environmentName !== 'production' ? 'barn' : environmentName
  const url = STRATEGY_URL_BASE + environment + '/strategies'
  return {
    [SupportedChainId.MAINNET]: url + '/strategy-1.json',
    [SupportedChainId.GNOSIS_CHAIN]: url + '/strategy-100.json',
    [SupportedChainId.GOERLI]: url + '/strategy-5.json',
  }
}

const STRATEGY_API_URL = getPriceStrategyUrl()

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
