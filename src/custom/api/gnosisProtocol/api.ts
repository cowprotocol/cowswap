import { SupportedChainId as ChainId } from 'constants/chains'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
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
import { FeeInformation, FeeQuoteParams, PriceInformation, PriceQuoteParams } from 'utils/price'

import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { GAS_FEE_ENDPOINTS } from 'constants/index'
import * as Sentry from '@sentry/browser'

function getGnosisProtocolUrl(): Partial<Record<ChainId, string>> {
  if (isLocal || isDev || isPr || isBarn) {
    return {
      // [ChainId.MAINNET]:
      //   process.env.REACT_APP_API_URL_STAGING_MAINNET || 'https://protocol-mainnet.dev.gnosisdev.com/api',
      // [ChainId.RINKEBY]:
      //   process.env.REACT_APP_API_URL_STAGING_RINKEBY || 'https://protocol-rinkeby.dev.gnosisdev.com/api',
      // [ChainId.XDAI]: process.env.REACT_APP_API_URL_STAGING_XDAI || 'https://protocol-xdai.dev.gnosisdev.com/api',

      [ChainId.MAINNET]: process.env.REACT_APP_API_URL_PROD_MAINNET || 'https://protocol-mainnet.gnosis.io/api',
      [ChainId.RINKEBY]: process.env.REACT_APP_API_URL_PROD_RINKEBY || 'https://protocol-rinkeby.gnosis.io/api',
      [ChainId.XDAI]: process.env.REACT_APP_API_URL_PROD_XDAI || 'https://protocol-xdai.gnosis.io/api',
    }
  }

  // Production, staging, ens, ...
  return {
    [ChainId.MAINNET]: process.env.REACT_APP_API_URL_PROD_MAINNET || 'https://protocol-mainnet.gnosis.io/api',
    [ChainId.RINKEBY]: process.env.REACT_APP_API_URL_PROD_RINKEBY || 'https://protocol-rinkeby.gnosis.io/api',
    [ChainId.XDAI]: process.env.REACT_APP_API_URL_PROD_XDAI || 'https://protocol-xdai.gnosis.io/api',
  }
}

function getProfileUrl(): Partial<Record<ChainId, string>> {
  if (isLocal || isDev || isPr || isBarn) {
    return {
      [ChainId.MAINNET]:
        process.env.REACT_APP_PROFILE_API_URL_STAGING_MAINNET || 'https://protocol-affiliate.dev.gnosisdev.com/api',
    }
  }

  // Production, staging, ens, ...
  return {
    [ChainId.MAINNET]:
      process.env.REACT_APP_PROFILE_API_URL_STAGING_MAINNET || 'https://protocol-affiliate.gnosis.io/api',
  }
}

const API_BASE_URL = getGnosisProtocolUrl()
const PROFILE_API_BASE_URL = getProfileUrl()

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-AppId': APP_DATA_HASH.toString(),
}
const API_NAME = 'Gnosis Protocol'
const ENABLED = process.env.REACT_APP_PRICE_FEED_GP_ENABLED !== 'false'
/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
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

async function _handleQuoteResponse(response: Response, params?: FeeQuoteParams) {
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
        contexts: { params },
      })
    }

    throw quoteError
  } else {
    return response.json()
  }
}

export async function getPriceQuote(params: PriceQuoteParams): Promise<PriceInformation | null> {
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

  return _handleQuoteResponse(response)
}

export async function getFeeQuote(params: FeeQuoteParams): Promise<FeeInformation> {
  const { sellToken, buyToken, amount, kind, chainId } = params
  console.log(`[api:${API_NAME}] Get fee from API`, params)

  const response = await _get(
    chainId,
    `/fee?sellToken=${toErc20Address(sellToken, chainId)}&buyToken=${toErc20Address(
      buyToken,
      chainId
    )}&amount=${amount}&kind=${kind}`
  ).catch((error) => {
    console.error('Error getting fee quote:', error)
    throw new QuoteError(UNHANDLED_QUOTE_ERROR)
  })

  return _handleQuoteResponse(response, params)
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
  operator: { getFeeQuote, getTrades, getOrder, sendSignedOrder: sendOrder, apiGet: _get, apiPost: _post },
})
