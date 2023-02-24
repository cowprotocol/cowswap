import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { OrderKind } from '@cowprotocol/contracts'
import { stringify } from 'qs'
import { getSigningSchemeApiValue, OrderCancellation, OrderCreation, UnsignedOrder } from 'utils/signatures'
import { APP_DATA_HASH, RAW_CODE_LINK } from 'constants/index'
import { getProviderErrorMessage, registerOnWindow } from 'utils/misc'
import { environmentName, isBarn, isDev, isLocal, isPr } from 'utils/environments'
import OperatorError, { ApiErrorObject } from '@cow/api/gnosisProtocol/errors/OperatorError'

import { toErc20Address, toNativeBuyAddress } from 'utils/tokens'
import { LegacyFeeQuoteParams as FeeQuoteParams } from './legacy/types'

import * as Sentry from '@sentry/browser'
import { constructSentryError } from 'utils/logging'
import { ZERO_ADDRESS } from 'constants/misc'
import { getAppDataHash } from 'constants/appDataHash'
import { Context } from '@sentry/types'
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
const STRATEGY_URL_BASE = RAW_CODE_LINK + '/configuration/config/'
function getPriceStrategyUrl(): Record<ChainId, string> {
  const environment = environmentName !== 'production' ? 'barn' : environmentName
  const url = STRATEGY_URL_BASE + environment + '/strategies'

  return {
    [ChainId.MAINNET]: url + '/strategy-1.json',
    [ChainId.GNOSIS_CHAIN]: url + '/strategy-100.json',
    [ChainId.GOERLI]: url + '/strategy-5.json',
  }
}

const API_BASE_URL = getGnosisProtocolUrl()
const PROFILE_API_BASE_URL = getProfileUrl()
const STRATEGY_API_URL = getPriceStrategyUrl()

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

type PaginationParams = {
  limit?: number
  offset?: number
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

function _getPriceStrategyApiBaseUrl(chainId: ChainId): string {
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

function _delete(chainId: ChainId, url: string, data: any): Promise<Response> {
  return _fetch(chainId, url, 'DELETE', data)
}

export async function sendOrder(params: { chainId: ChainId; order: OrderCreation; owner: string }): Promise<OrderID> {
  const { chainId, order, owner } = params
  console.log(`[api:${API_NAME}] Post signed order for network`, chainId, order)

  const orderParams = {
    ...order,
    signingScheme: getSigningSchemeApiValue(order.signingScheme),
    from: owner,
  }
  // Call API
  const response = await _post(chainId, `/orders`, orderParams)

  return _handleOrderResponse<string, typeof orderParams>(response, orderParams)
}

type OrderCancellationParams = {
  chainId: ChainId
  cancellation: OrderCancellation
  owner: string
}

export async function sendSignedOrderCancellation(params: OrderCancellationParams): Promise<void> {
  const { chainId, cancellation, owner: from } = params

  console.log(`[api:${API_NAME}] Delete signed order for network`, chainId, cancellation)

  const response = await _delete(chainId, `/orders/${cancellation.orderUid}`, {
    signature: cancellation.signature,
    signingScheme: getSigningSchemeApiValue(cancellation.signingScheme),
    from,
  })

  if (!response.ok) {
    // Raise an exception
    const errorObject: ApiErrorObject = await response.json()
    const errorMessage = OperatorError.getErrorFromStatusCode(response.status, errorObject, 'delete')

    throw new Error(errorMessage)
  }

  console.log(`[api:${API_NAME}] Cancelled order`, cancellation.orderUid, chainId)
}

function _handleError<P extends Context>(error: any, response: Response, params: P, operation: 'ORDER' | 'QUOTE') {
  // Create a new sentry error OR
  // use the previously created and rethrown error from the try block
  const sentryError =
    error?.sentryError ||
    constructSentryError(error, response, {
      message: getProviderErrorMessage(error),
      name: `[${operation}-ERROR] - Unmapped ${operation} Error`,
    })
  // Create the error tags or use the previously constructed ones from the try block
  const tags = error?.tags || { errorType: operation, backendErrorCode: response.status }

  // report to sentry
  Sentry.captureException(sentryError, {
    tags,
    // TODO: change/remove this in context update pr
    contexts: { params },
  })

  return error?.baseError || error
}

async function _handleOrderResponse<T = any, P extends UnsignedOrder = UnsignedOrder>(
  response: Response,
  params: P
): Promise<T> {
  try {
    // Handle response
    if (!response.ok) {
      // Raise an exception
      const errorObject: ApiErrorObject = await response.json()
      const description = OperatorError.getErrorFromStatusCode(response.status, errorObject, 'create')

      // create the OperatorError from the constructed error message and the original error
      const error = new OperatorError(Object.assign({}, errorObject, { description }))

      // we need to create a sentry error and keep the original mapped quote error
      throw constructSentryError(error, response, {
        message: `${error.description}`,
        name: `[${error.name}] - ${error.type}`,
        optionalTags: {
          orderErrorType: error.type,
        },
      })
    } else {
      const uid = await response.json()
      console.log(`[api:${API_NAME}] Success posting the signed order`, JSON.stringify(uid))
      return uid
    }
  } catch (error: any) {
    throw _handleError(error, response, params, 'ORDER')
  }
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

type GetTradesParams = {
  chainId: ChainId
  owner: string
} & PaginationParams

export async function getTrades(params: GetTradesParams): Promise<TradeMetaData[]> {
  const { chainId, owner, limit, offset } = params
  const qsParams = stringify({ owner, limit, offset })
  console.log('[util:operator] Get trades for', chainId, owner, { limit, offset })
  try {
    const response = await _get(chainId, `/trades?${qsParams}`)

    if (!response.ok) {
      const errorResponse = await response.json()
      throw new Error(errorResponse)
    } else {
      return response.json()
    }
  } catch (error: any) {
    console.error('Error getting trades:', error)
    throw new Error('Error getting trades: ' + error)
  }
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
    getTrades,
    getOrder,
    sendSignedOrder: sendOrder,
    apiGet: _get,
    apiPost: _post,
    getNativePrice,
  },
})
