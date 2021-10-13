import { OrderKind } from '@gnosis.pm/gp-v2-contracts'

import { NetworkID } from 'paraswap'
import { SupportedChainId as ChainId } from 'constants/chains'
import { getTokensFromMarket } from 'utils/misc'
import { getValidParams, PriceInformation, PriceQuoteParams } from 'utils/price'

// copy/pasting as the library types correspond to the internal types, not API response
// e.g "price: BigNumber" when we want the API response type: "price: string"
// see link below to see
// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
interface GetSwapQuoteResponseLiquiditySource {
  name: string
  proportion: string
  intermediateToken?: string
  hops?: string[]
}

// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
interface MatchaBaseQuote {
  chainId: ChainId
  price: string
  buyAmount: string
  sellAmount: string
  sources: GetSwapQuoteResponseLiquiditySource[]
  gasPrice: string
  estimatedGas: string
  sellTokenToEthRate: string
  buyTokenToEthRate: string
  protocolFee: string
  minimumProtocolFee: string
  allowanceTarget?: string
}

// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
export interface MatchaPriceQuote extends MatchaBaseQuote {
  sellTokenAddress: string
  buyTokenAddress: string
  value: string
  gas: string
}

function getMatchaChainId(chainId: ChainId): NetworkID | null {
  switch (chainId) {
    // Support: Mainnet, Ropsten, Polygon, Binance Smart Chain
    // See https://0x.org/docs/api#introduction
    // but we only support mainnet of that list so..
    case ChainId.MAINNET:
      return chainId

    default:
      // Unsupported network
      return null
  }
}

function getApiUrl(): Partial<Record<ChainId, string>> {
  // Support: Mainnet, Ropsten, Polygon, Binance Smart Chain
  // See https://0x.org/docs/api#introduction
  return {
    [ChainId.MAINNET]: 'https://api.0x.org/swap',
  }
}

// Defaults
const API_NAME = 'Matcha(0x)'
const API_BASE_URL = getApiUrl()
const API_VERSION = 'v1'
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}
// GPV2Settlement
// https://etherscan.io/address/0x9008d19f58aabd9ed0d60971565aa8510560ab41
const AFFILIATE_ADDRESS = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const EXCLUDED_SOURCES = ''
const MATCHA_DEFAULT_OPTIONS = `affiliateAddress=${AFFILIATE_ADDRESS}&excludedSources=${EXCLUDED_SOURCES}`

function _getApiBaseUrl(chainId: ChainId): string {
  const baseUrl = API_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error(`Unsupported Network. The ${API_NAME} API is not deployed in the Network ${chainId}`)
  } else {
    return baseUrl + '/' + API_VERSION
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

export async function getPriceQuote(params: PriceQuoteParams): Promise<MatchaPriceQuote | null> {
  const { baseToken, quoteToken, amount, kind, chainId } = getValidParams(params)

  const networkId = getMatchaChainId(chainId)
  if (networkId == null) {
    // Unsupported network
    return null
  }

  console.log(`[pricesApi:${API_NAME}] Get price from ${API_NAME}`, params)

  // Buy/sell token and side (sell/buy)
  const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })
  const swapSide = kind === OrderKind.BUY ? 'buyAmount' : 'sellAmount'

  const response = await _get(
    chainId,
    `/price?sellToken=${sellToken}&buyToken=${buyToken}&${swapSide}=${amount}&${MATCHA_DEFAULT_OPTIONS}`
  ).catch((error) => {
    console.error(`Error getting ${API_NAME} price quote:`, error)
    throw new Error(error)
  })

  return response.json()
}

export function toPriceInformation(priceRaw: MatchaPriceQuote | null, kind: OrderKind): PriceInformation | null {
  if (!priceRaw || !priceRaw.price) {
    return null
  }

  const { sellAmount, buyAmount, sellTokenAddress, buyTokenAddress } = priceRaw

  if (kind === OrderKind.BUY) {
    return { amount: sellAmount, token: sellTokenAddress }
  } else {
    return { amount: buyAmount, token: buyTokenAddress }
  }
}
