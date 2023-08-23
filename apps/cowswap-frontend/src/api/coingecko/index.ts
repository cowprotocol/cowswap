import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'

import useSWR from 'swr'
import { PriceInformation } from 'types'

import { SWR_OPTIONS } from 'legacy/constants'
import { USDC } from 'legacy/constants/tokens'

import { fetchWithRateLimit } from 'common/utils/fetch'

import { getNativePrice } from '../gnosisProtocol'

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

const fetchRateLimitted = fetchWithRateLimit({
  rateLimit: {
    tokensPerInterval: 3,
    interval: 'second',
  },
})

function _getApiBaseUrl(chainId: SupportedChainId): string {
  const baseUrl = API_BASE_URL

  if (!baseUrl) {
    throw new Error(`Unsupported Network. The ${API_NAME} API is not deployed in the Network ${chainId}`)
  } else {
    return baseUrl + '/' + API_VERSION
  }
}

function _getCoinGeckoAssetPlatform(chainId: SupportedChainId) {
  if (!ENABLED) {
    return null
  }
  switch (chainId) {
    // Use of asset platforms - supports ethereum and xdai
    // https://api.coingecko.com/api/v3/asset_platforms
    case SupportedChainId.MAINNET:
      return 'ethereum'
    case SupportedChainId.GNOSIS_CHAIN:
      return 'xdai'
    default:
      return null
  }
}

function _fetch(
  chainId: SupportedChainId,
  url: string,
  method: 'GET' | 'POST' | 'DELETE',
  data?: any
): Promise<Response> {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetchRateLimitted(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method,
    body: data !== undefined ? JSON.stringify(data) : data,
  })
}

// TODO: consider making these _get/_delete/_post etc reusable across apis
function _get(chainId: SupportedChainId, url: string): Promise<Response> {
  return _fetch(chainId, url, 'GET')
}

export interface CoinGeckoUsdPriceParams {
  chainId: SupportedChainId
  currency: Currency
  isNative: boolean
}

interface CoinGeckoUsdQuote {
  [address: string]: {
    usd: number
  }
}

/**
 * API response value represents the amount of native token atoms needed to buy 1 atom of the specified token
 * This function inverts the price to represent the amount of specified token atoms needed to buy 1 atom of the native token
 */
function invertNativeToTokenPrice(value: number, decimals: number): number {
  return (1 / value) * 10 ** (18 - decimals)
}

async function getUSDPriceFromNative(currency: Currency, chainId: SupportedChainId): Promise<number | null> {
  const usdcToken = USDC[chainId]

  const tokenAddress = currency.wrapped.address
  // TODO: request USDC price only once per trade
  const usdNativePrice = await getNativePrice(chainId, usdcToken.address)
  const tokenNativePrice = await getNativePrice(chainId, tokenAddress)

  if (usdNativePrice.price && tokenNativePrice.price) {
    const usdPrice = invertNativeToTokenPrice(usdNativePrice.price, usdcToken.decimals)
    const tokenPrice = invertNativeToTokenPrice(tokenNativePrice.price, currency.decimals)

    console.log('Spot price calculation', {
      currency: currency.symbol,
      usdPrice,
      tokenPrice,
      price: usdPrice / tokenPrice,
    })
    return usdPrice / tokenPrice
  }

  return null
}

export async function getUSDPriceQuote(
  params: Omit<CoinGeckoUsdPriceParams, 'isNative'>
): Promise<CoinGeckoUsdQuote | null> {
  const { chainId, currency } = params

  const tokenAddress = currency.wrapped.address

  // ethereum/xdai (chains)
  const assetPlatform = _getCoinGeckoAssetPlatform(chainId)

  try {
    // TODO: remove temporary condition
    if (assetPlatform == null || 2 > 1) {
      // Unsupported
      throw new Error('Unsupported Coingecko platform')
    }

    console.debug(`[api:${API_NAME}] Get USD price from ${API_NAME}`, params)

    const response = await _get(
      chainId,
      `/simple/token_price/${assetPlatform}?contract_addresses=${tokenAddress}&vs_currencies=usd`
    ).catch((error) => {
      console.error(`Error getting ${API_NAME} USD price quote:`, error)
      throw new Error(error)
    })

    return response.json()
  } catch (e) {
    const price = await getUSDPriceFromNative(currency, chainId)

    if (price === null) return null

    return { [tokenAddress]: { usd: price } }
  }
}

export function useGetCoingeckoUsdPrice(params: Partial<CoinGeckoUsdPriceParams>, options = SWR_OPTIONS) {
  const { chainId, currency, isNative } = params

  const tokenAddress = currency?.wrapped.address

  return useSWR<PriceInformation | null>(
    ['getUSDPriceQuote', chainId, tokenAddress, isNative],
    () => {
      if (chainId && tokenAddress) {
        return getUSDPriceQuote({ chainId, currency }).then(toPriceInformation)
      } else {
        return null
      }
    },
    options
  )
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
