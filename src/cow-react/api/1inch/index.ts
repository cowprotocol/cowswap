import { OrderKind } from '@cowprotocol/contracts'

import { SupportedChainId as ChainId } from 'constants/chains'
import { getTokensFromMarket } from 'utils/misc'
import { getValidParams } from 'utils/price'
import { LegacyPriceQuoteParams } from '@cow/api/gnosisProtocol/legacy/types'
import { fetchWithRateLimit } from '@cow/common/utils/fetch'
import { PriceInformation } from '@cow/types'

export const API_NAME = '1inch'
const ENABLED = process.env.REACT_APP_PRICE_FEED_1INCH_ENABLED !== 'false'

const SUPPORTED_CHAINS = [ChainId.MAINNET, ChainId.GNOSIS_CHAIN]

// 1inch API
// Docs: https://docs.1inch.io/docs/aggregation-protocol/api/swagger
//  i.e. https://api.1inch.io/v5.0/1/quote?fromTokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&toTokenAddress=0x111111111117dc0aa78b770fa6a738034120c302&amount=10000000000000000'
const BASE_URLS = new Map<ChainId, string>(
  SUPPORTED_CHAINS.map((chainId) => [chainId, `https://api.1inch.io/v5.0/${chainId}`])
)

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

export interface PathView1inch {
  name: string
  part: number
  fromTokenAddress: string
  toTokenAddress: string
}

export interface Token1inch {
  symbol: string
  name: string
  address: string
  decimals: number
  logoURI: string
}

export interface PriceQuote1inch {
  fromToken: Token1inch
  toToken: Token1inch
  toTokenAmount: string
  fromTokenAmount: string
  protocols: PathView1inch[][]
}

const fetchRateLimitted = fetchWithRateLimit({
  rateLimit: {
    tokensPerInterval: 5,
    interval: 'second',
  },
})

function _getApiBaseUrl(chainId: ChainId): string | null {
  if (!ENABLED) {
    return null
  }

  return BASE_URLS.get(chainId) || null
}

export function toPriceInformation(priceRaw: PriceQuote1inch | null): PriceInformation | null {
  if (!priceRaw) {
    return null
  }

  const { toToken, toTokenAmount } = priceRaw

  return {
    amount: toTokenAmount,
    token: toToken.address,
  }
}

function _fetch(
  chainId: ChainId,
  url: string,
  method: 'GET' | 'POST' | 'DELETE',
  data?: any
): Promise<Response> | null {
  const baseUrl = _getApiBaseUrl(chainId)

  if (!baseUrl) {
    return null
  }

  return fetchRateLimitted(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method,
    body: data !== undefined ? JSON.stringify(data) : data,
  })
}

function _get(chainId: ChainId, url: string): Promise<Response> | null {
  return _fetch(chainId, url, 'GET')
}

export async function getPriceQuote(params: LegacyPriceQuoteParams): Promise<PriceQuote1inch | null> {
  const { baseToken, quoteToken, amount, kind, chainId } = getValidParams(params)

  console.log(`[pricesApi:${API_NAME}] Get price from ${API_NAME}`, params)

  // Buy/sell token and side (sell/buy)
  const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })

  if (params.kind === OrderKind.BUY) {
    // API doesn't support buy orders
    console.debug(`[pricesApi:${API_NAME}] ${API_NAME} API don't support BUY Orders`, params)
    return null
  }

  const pricePromise = _get(chainId, `/quote?fromTokenAddress=${sellToken}&toTokenAddress=${buyToken}&amount=${amount}`)

  if (!pricePromise) {
    return null
  }

  const response = await pricePromise.catch((error) => {
    console.error(`Error getting ${API_NAME} price quote:`, error)
    throw new Error(error)
  })

  return response.json()
}
