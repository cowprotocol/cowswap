import { SupportedChainId as ChainId, SupportedChainId } from 'constants/chains'
import { OrderKind, QuoteQuery } from '@gnosis.pm/gp-v2-contracts'
import { stringify } from 'qs'
import { getSigningSchemeApiValue, OrderCreation, OrderCancellation, SigningSchemeValue } from 'utils/signatures'
import { APP_DATA_HASH } from 'constants/index'
import { registerOnWindow } from 'utils/misc'
import { isLocal, isDev, isPr, isBarn } from '../../utils/environments'
import OperatorError, {
  ApiErrorCodeDetails,
  ApiErrorCodes,
  ApiErrorObject,
} from 'api/gnosisProtocol/errors/OperatorError'
import QuoteError, {
  GpQuoteErrorCodes,
  GpQuoteErrorObject,
  mapOperatorErrorToQuoteError,
  GpQuoteErrorDetails,
} from 'api/gnosisProtocol/errors/QuoteError'
import { toErc20Address } from 'utils/tokens'
import { FeeQuoteParams, PriceInformation, PriceQuoteParams, SimpleGetQuoteResponse } from 'utils/price'

import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { GAS_FEE_ENDPOINTS } from 'constants/index'
import * as Sentry from '@sentry/browser'
import { ZERO_ADDRESS } from 'constants/misc'
import { getAppDataHash } from 'constants/appDataHash'
import { GpPriceStrategy } from 'hooks/useGetGpPriceStrategy'

function getGnosisProtocolUrl(): Partial<Record<ChainId, string>> {
  if (isLocal || isDev || isPr || isBarn) {
    return {
      [ChainId.MAINNET]: process.env.REACT_APP_API_URL_STAGING_MAINNET || 'https://barn.api.cow.fi/mainnet/api',
      [ChainId.RINKEBY]: process.env.REACT_APP_API_URL_STAGING_RINKEBY || 'https://barn.api.cow.fi/rinkeby/api',
      [ChainId.XDAI]: process.env.REACT_APP_API_URL_STAGING_XDAI || 'https://barn.api.cow.fi/xdai/api',
    }
  }

  // Production, staging, ens, ...
  return {
    [ChainId.MAINNET]: process.env.REACT_APP_API_URL_PROD_MAINNET || 'https://api.cow.fi/mainnet/api',
    [ChainId.RINKEBY]: process.env.REACT_APP_API_URL_PROD_RINKEBY || 'https://api.cow.fi/rinkeby/api',
    [ChainId.XDAI]: process.env.REACT_APP_API_URL_PROD_XDAI || 'https://api.cow.fi/xdai/api',
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
const STRATEGY_URL_BASE = 'https://raw.githubusercontent.com/gnosis/cowswap/configuration/config/strategies'
function getPriceStrategyUrl(): Record<SupportedChainId, string> {
  return {
    [SupportedChainId.MAINNET]: STRATEGY_URL_BASE + '/strategy-1.json',
    [SupportedChainId.RINKEBY]: STRATEGY_URL_BASE + '/strategy-4.json',
    [SupportedChainId.XDAI]: STRATEGY_URL_BASE + '/strategy-100.json',
  }
}

const API_BASE_URL = getGnosisProtocolUrl()
const PROFILE_API_BASE_URL = getProfileUrl()
const STRATEGY_API_URL = getPriceStrategyUrl()

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-AppId': APP_DATA_HASH.toString(),
}
const API_NAME = 'Gnosis Protocol'
const ENABLED = process.env.REACT_APP_PRICE_FEED_GP_ENABLED !== 'false'
/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
 * where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string
export type ApiOrderStatus = 'fulfilled' | 'expired' | 'cancelled' | 'presignaturePending' | 'open'

export interface OrderMetaData {
  creationDate: string
  owner: string
  uid: OrderID
  availableBalance: string
  executedBuyAmount: string
  executedSellAmount: string
  executedSellAmountBeforeFees: string
  executedFeeAmount: string
  invalidated: false
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  validTo: number
  appData: number
  feeAmount: string
  kind: OrderKind
  partiallyFillable: false
  signature: string
  signingScheme: SigningSchemeValue
  status: ApiOrderStatus
  receiver: string
}

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

export function getOrderLink(chainId: ChainId, orderId: OrderID): string {
  const baseUrl = _getApiBaseUrl(chainId)

  return baseUrl + `/orders/${orderId}`
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

function _fetchPriceStrategy(chainId: ChainId): Promise<Response> {
  const baseUrl = _getPriceStrategyApiBaseUrl(chainId)
  return fetch(baseUrl)
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

  // Call API
  const response = await _post(chainId, `/orders`, {
    ...order,
    signingScheme: getSigningSchemeApiValue(order.signingScheme),
    from: owner,
  })

  // Handle response
  if (!response.ok) {
    // Raise an exception
    const errorMessage = await OperatorError.getErrorFromStatusCode(response, 'create')
    throw new Error(errorMessage)
  }

  const uid = (await response.json()) as string
  console.log(`[api:${API_NAME}] Success posting the signed order`, uid)
  return uid
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
    const errorMessage = await OperatorError.getErrorFromStatusCode(response, 'delete')
    throw new Error(errorMessage)
  }

  console.log(`[api:${API_NAME}] Cancelled order`, cancellation.orderUid, chainId)
}

const UNHANDLED_QUOTE_ERROR: GpQuoteErrorObject = {
  errorType: GpQuoteErrorCodes.UNHANDLED_ERROR,
  description: GpQuoteErrorDetails.UNHANDLED_ERROR,
}

const UNHANDLED_ORDER_ERROR: ApiErrorObject = {
  errorType: ApiErrorCodes.UNHANDLED_CREATE_ERROR,
  description: ApiErrorCodeDetails.UNHANDLED_CREATE_ERROR,
}

async function _handleQuoteResponse<T = any, P extends QuoteQuery = QuoteQuery>(
  response: Response,
  params?: P
): Promise<T> {
  if (!response.ok) {
    const errorObj: ApiErrorObject = await response.json()

    // we need to map the backend error codes to match our own for quotes
    const mappedError = mapOperatorErrorToQuoteError(errorObj)
    const quoteError = new QuoteError(mappedError)

    if (params) {
      const { sellToken, buyToken } = params

      const sentryError = new Error()
      Object.assign(sentryError, quoteError, {
        message: `Error querying fee from API - sellToken: ${sellToken}, buyToken: ${buyToken}`,
        name: 'FeeErrorObject',
      })

      // report to sentry
      Sentry.captureException(sentryError, {
        tags: { errorType: 'getFeeQuote' },
        contexts: { params: { ...params } },
      })
    }

    throw quoteError
  } else {
    return response.json()
  }
}

function _mapNewToLegacyParams(params: FeeQuoteParams): QuoteQuery {
  const { amount, kind, userAddress, receiver, validTo, sellToken, buyToken, chainId } = params
  const fallbackAddress = userAddress || ZERO_ADDRESS

  const baseParams = {
    sellToken: toErc20Address(sellToken, chainId),
    buyToken: toErc20Address(buyToken, chainId),
    from: fallbackAddress,
    receiver: receiver || fallbackAddress,
    appData: getAppDataHash(),
    validTo,
    partiallyFillable: false,
  }

  const finalParams: QuoteQuery =
    kind === OrderKind.SELL
      ? {
          kind: OrderKind.SELL,
          sellAmountBeforeFee: amount,
          ...baseParams,
        }
      : {
          kind: OrderKind.BUY,
          buyAmountAfterFee: amount,
          ...baseParams,
        }

  return finalParams
}

export async function getQuote(params: FeeQuoteParams) {
  const { chainId } = params
  const quoteParams = _mapNewToLegacyParams(params)
  const response = await _post(chainId, '/quote', quoteParams)

  return _handleQuoteResponse<SimpleGetQuoteResponse>(response)
}

export async function getPriceQuoteLegacy(params: PriceQuoteParams): Promise<PriceInformation | null> {
  const { baseToken, quoteToken, amount, kind, chainId } = params
  console.log(`[api:${API_NAME}] Get price from API`, params)

  if (!ENABLED) {
    return null
  }

  const response = await _get(
    chainId,
    `/markets/${toErc20Address(baseToken, chainId)}-${toErc20Address(quoteToken, chainId)}/${kind}/${amount}`
  ).catch((error) => {
    console.error('Error getting price quote:', error)
    throw new QuoteError(UNHANDLED_QUOTE_ERROR)
  })

  return _handleQuoteResponse<PriceInformation | null>(response)
}

export async function getOrder(chainId: ChainId, orderId: string): Promise<OrderMetaData | null> {
  console.log(`[api:${API_NAME}] Get order for `, chainId, orderId)
  try {
    const response = await _get(chainId, `/orders/${orderId}`)

    if (!response.ok) {
      const errorResponse: ApiErrorObject = await response.json()
      throw new OperatorError(errorResponse)
    } else {
      return response.json()
    }
  } catch (error) {
    console.error('Error getting order information:', error)
    throw new OperatorError(UNHANDLED_ORDER_ERROR)
  }
}

export async function getOrders(chainId: ChainId, owner: string, limit = 1000, offset = 0): Promise<OrderMetaData[]> {
  console.log(`[api:${API_NAME}] Get orders for `, chainId, owner, limit, offset)

  const queryString = stringify({ limit, offset }, { addQueryPrefix: true })

  try {
    const response = await _get(chainId, `/account/${owner}/orders/${queryString}`)

    if (!response.ok) {
      const errorResponse: ApiErrorObject = await response.json()
      throw new OperatorError(errorResponse)
    } else {
      return response.json()
    }
  } catch (error) {
    console.error('Error getting orders information:', error)
    throw new OperatorError(UNHANDLED_ORDER_ERROR)
  }
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
  } catch (error) {
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

export type PriceStrategy = {
  primary: GpPriceStrategy
  secondary: GpPriceStrategy
}

export async function getPriceStrategy(chainId: ChainId): Promise<PriceStrategy> {
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

export interface GasFeeEndpointResponse {
  lastUpdate: string
  lowest: string
  safeLow: string
  standard: string
  fast: string
  fastest: string
}

export async function getGasPrices(chainId: ChainId = DEFAULT_NETWORK_FOR_LISTS): Promise<GasFeeEndpointResponse> {
  const response = await fetch(GAS_FEE_ENDPOINTS[chainId])
  return response.json()
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
  },
})
