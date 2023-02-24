import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { OrderKind } from '@cowprotocol/contracts'
import { APP_DATA_HASH } from 'constants/index'
import { registerOnWindow } from 'utils/misc'
import { isBarn, isDev, isLocal, isPr } from 'utils/environments'

import { toErc20Address, toNativeBuyAddress } from 'utils/tokens'
import { LegacyFeeQuoteParams as FeeQuoteParams } from './legacy/types'

import { ZERO_ADDRESS } from 'constants/misc'
import { getAppDataHash } from 'constants/appDataHash'
import { orderBookApi } from '@cow/cowSdk'
import {
  OrderQuoteRequest,
  PriceQuality,
  SigningScheme,
  OrderQuoteResponse,
  EnrichedOrder,
} from '@cowprotocol/cow-sdk/order-book'

function getGnosisProtocolUrl(): Partial<Record<ChainId, string>> {
  if (isLocal || isDev || isPr || isBarn) {
    return {
      [ChainId.MAINNET]: process.env.REACT_APP_API_URL_STAGING_MAINNET || 'https://barn.api.cow.fi/mainnet/api',
      [ChainId.GNOSIS_CHAIN]: process.env.REACT_APP_API_URL_STAGING_XDAI || 'https://barn.api.cow.fi/xdai/api',
      [ChainId.GOERLI]: process.env.REACT_APP_API_URL_STAGING_GOERLI || 'https://barn.api.cow.fi/goerli/api',
    }
  }

  // Production, staging, ens, ...
  return {
    [ChainId.MAINNET]: process.env.REACT_APP_API_URL_PROD_MAINNET || 'https://api.cow.fi/mainnet/api',
    [ChainId.GNOSIS_CHAIN]: process.env.REACT_APP_API_URL_PROD_XDAI || 'https://api.cow.fi/xdai/api',
    [ChainId.GOERLI]: process.env.REACT_APP_API_URL_PROD_GOERLI || 'https://api.cow.fi/goerli/api',
  }
}

function getProfileUrl(): Partial<Record<ChainId, string>> {
  if (isLocal || isDev || isPr || isBarn) {
    return {
      [ChainId.MAINNET]:
        process.env.REACT_APP_PROFILE_API_URL_STAGING_MAINNET || 'https://barn.api.cow.fi/affiliate/api',
    }
  }

  // Production, staging, ens, ...
  return {
    [ChainId.MAINNET]: process.env.REACT_APP_PROFILE_API_URL_STAGING_MAINNET || 'https://api.cow.fi/affiliate/api',
  }
}

const API_BASE_URL = getGnosisProtocolUrl()
const PROFILE_API_BASE_URL = getProfileUrl()

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-AppId': APP_DATA_HASH.toString(),
}
const API_NAME = 'CoW Protocol'
/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
 * where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string
export interface TradeMetaData {
  blockNumber: number
  logIndex: number
  orderUid: OrderID
  owner: string
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  sellAmountBeforeFees: string
  txHash: string
}

export interface UnsupportedToken {
  [token: string]: {
    address: string
    dateAdded: number
  }
}

function _getApiBaseUrl(chainId: ChainId): string {
  const baseUrl = API_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error(`Unsupported Network. The ${API_NAME} API is not deployed in the Network ` + chainId)
  } else {
    return baseUrl + '/v1'
  }
}

function _getProfileApiBaseUrl(chainId: ChainId): string {
  const baseUrl = PROFILE_API_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error(`Unsupported Network. The ${API_NAME} API is not deployed in the Network ` + chainId)
  } else {
    return baseUrl + '/v1'
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

function _fetchProfile(
  chainId: ChainId,
  url: string,
  method: 'GET' | 'POST' | 'DELETE',
  data?: any
): Promise<Response> {
  const baseUrl = _getProfileApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method,
    body: data !== undefined ? JSON.stringify(data) : data,
  })
}

function _post(chainId: ChainId, url: string, data: any): Promise<Response> {
  return _fetch(chainId, url, 'POST', data)
}

function _get(chainId: ChainId, url: string): Promise<Response> {
  return _fetch(chainId, url, 'GET')
}

function _getProfile(chainId: ChainId, url: string): Promise<Response> {
  return _fetchProfile(chainId, url, 'GET')
}

// ETH-FLOW orders require different quote params
// check the isEthFlow flag and set in quote req obj
const ETH_FLOW_AUX_QUOTE_PARAMS = {
  signingScheme: SigningScheme.EIP1271,
  onchainOrder: true,
  // Ethflow orders are subsidized in the backend.
  // This means we can assume the verification gas costs are zero for the quote/fee estimation
  verificationGasLimit: 0,
}

function _mapNewToLegacyParams(params: FeeQuoteParams): OrderQuoteRequest {
  const { amount, kind, userAddress, receiver, validTo, sellToken, buyToken, chainId, priceQuality, isEthFlow } = params
  const fallbackAddress = userAddress || ZERO_ADDRESS

  const baseParams = {
    sellToken: toErc20Address(sellToken, chainId),
    // check buy token, if native, use native address
    buyToken: toNativeBuyAddress(buyToken, chainId),
    from: fallbackAddress,
    receiver: receiver || fallbackAddress,
    appData: getAppDataHash(),
    validTo,
    partiallyFillable: false,
    priceQuality:
      priceQuality === PriceQuality.FAST
        ? PriceQuality.FAST
        : priceQuality === PriceQuality.OPTIMAL
        ? PriceQuality.OPTIMAL
        : undefined,
  }

  if (isEthFlow) {
    console.debug('[API:CowSwap] ETH FLOW ORDER, setting onchainOrder: true, and signingScheme: eip1271')
  }

  if (kind === OrderKind.SELL) {
    return {
      ...baseParams,
      ...(isEthFlow ? ETH_FLOW_AUX_QUOTE_PARAMS : {}),
      kind: OrderKind.SELL,
      sellAmountBeforeFee: amount.toString(),
    }
  } else {
    return {
      kind: OrderKind.BUY,
      buyAmountAfterFee: amount.toString(),
      ...baseParams,
    }
  }
}

export async function getQuote(params: FeeQuoteParams): Promise<OrderQuoteResponse> {
  const { chainId } = params
  const quoteParams = _mapNewToLegacyParams(params)

  return orderBookApi.getQuote(chainId, quoteParams)
}

export async function getOrder(chainId: ChainId, orderId: string): Promise<EnrichedOrder | null> {
  return orderBookApi.getOrder(chainId, orderId)
}

export async function getOrders(chainId: ChainId, owner: string, limit = 1000, offset = 0): Promise<EnrichedOrder[]> {
  return orderBookApi.getOrders(chainId, { owner, limit, offset })
}

export type ProfileData = {
  totalTrades: number
  totalReferrals: number
  tradeVolumeUsd: number
  referralVolumeUsd: number
  lastUpdated: string
}

export async function getProfileData(chainId: ChainId, address: string): Promise<ProfileData | null> {
  console.log(`[api:${API_NAME}] Get profile data for`, chainId, address)
  if (chainId !== ChainId.MAINNET) {
    console.info('Profile data is only available for mainnet')
    return null
  }

  const response = await _getProfile(chainId, `/profile/${address}`)

  // TODO: Update the error handler when the openAPI profile spec is defined
  if (!response.ok) {
    const errorResponse = await response.json()
    console.log(errorResponse)
    throw new Error(errorResponse?.description)
  } else {
    return response.json()
  }
}

export interface NativePrice {
  price: number
}

export async function getNativePrice(chainId: ChainId, address: string): Promise<NativePrice | null> {
  console.log(`[api:${API_NAME}] Get native price for`, chainId, address)

  try {
    const response = await _get(chainId, `/token/${address}/native_price`)

    if (!response.ok) {
      const errorResponse = await response.json()
      throw new Error(errorResponse)
    } else {
      return response.json()
    }
  } catch (error: any) {
    console.error('Error getting native price:', error)
    throw new Error('Error getting native price: ' + error)
  }
}

// Register some globals for convenience
registerOnWindow({
  operator: {
    getQuote,
    getOrder,
    apiGet: _get,
    apiPost: _post,
    getNativePrice,
  },
})
