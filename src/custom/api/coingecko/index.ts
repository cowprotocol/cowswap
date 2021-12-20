import { SupportedChainId as ChainId } from 'constants/chains'
import { PriceInformation } from 'utils/price'

function getApiUrl(): string {
  // it's all the same base url
  return 'https://api.coingecko.com/api'
}

// https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x33e18a092a93ff21ad04746c7da12e35d34dc7c4&vs_currencies=usd
// Defaults
const API_NAME = 'Coingecko'
const ENABLED = process.env.REACT_APP_PRICE_FEED_COINGECKO_ENABLED !== 'false'

const API_BASE_URL = getApiUrl()
const API_VERSION = 'v3'
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

function _getApiBaseUrl(chainId: ChainId): string {
  const baseUrl = API_BASE_URL

  if (!baseUrl) {
    throw new Error(`Unsupported Network. The ${API_NAME} API is not deployed in the Network ${chainId}`)
  } else {
    return baseUrl + '/' + API_VERSION
  }
}

function _getCoinGeckoAssetPlatform(chainId: ChainId) {
  if (!ENABLED) {
    return null
  }
  switch (chainId) {
    // Use of asset platforms - supports ethereum and xdai
    // https://api.coingecko.com/api/v3/asset_platforms
    case ChainId.MAINNET:
      return 'ethereum'
    case ChainId.XDAI:
      return 'xdai'
    default:
      return null
  }
}

function _fetch(chainId: ChainId, url: string, method: 'GET' | 'POST' | 'DELETE', data?: any): Promise<Response> {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method,
    body: data !== undefined ? JSON.stringify(data) : data,
  })
}

// TODO: consider making these _get/_delete/_post etc reusable across apis
function _get(chainId: ChainId, url: string): Promise<Response> {
  return _fetch(chainId, url, 'GET')
}

export interface CoinGeckoUsdPriceParams {
  chainId: ChainId
  tokenAddress: string
}

interface CoinGeckoUsdQuote {
  [address: string]: {
    usd: number
  }
}

export async function getUSDPriceQuote(params: CoinGeckoUsdPriceParams): Promise<CoinGeckoUsdQuote | null> {
  const { chainId, tokenAddress } = params
  // ethereum/xdai (chains)
  const assetPlatform = _getCoinGeckoAssetPlatform(chainId)
  if (assetPlatform == null) {
    // Unsupported
    return null
  }

  console.log(`[api:${API_NAME}] Get USD price from ${API_NAME}`, params)

  const response = await _get(
    chainId,
    `/simple/token_price/${assetPlatform}?contract_addresses=${tokenAddress}&vs_currencies=usd`
  ).catch((error) => {
    console.error(`Error getting ${API_NAME} USD price quote:`, error)
    throw new Error(error)
  })

  return response.json()
}

export function toPriceInformation(priceRaw: CoinGeckoUsdQuote | null): PriceInformation | null {
  // We only receive/want the first key/value pair in the return object
  const token = priceRaw ? Object.keys(priceRaw)[0] : null

  if (!token || !priceRaw?.[token].usd) {
    return null
  }

  const { usd } = priceRaw[token]
  return { amount: usd.toString(), token }
}
