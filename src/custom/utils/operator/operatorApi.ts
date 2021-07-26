import { SupportedChainId as ChainId } from 'constants/chains'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { getSigningSchemeApiValue, OrderCreation, OrderCancellation } from 'utils/signatures'
import { APP_ID } from 'constants/index'
import { registerOnWindow } from '../misc'
import { isDev } from '../environments'
import OperatorError, { ApiErrorCodeDetails, ApiErrorCodes, ApiErrorObject } from 'utils/operator/errors/OperatorError'
import QuoteError, {
  GpQuoteErrorCodes,
  GpQuoteErrorObject,
  mapOperatorErrorToQuoteError,
  GpQuoteErrorDetails,
} from 'utils/operator/errors/QuoteError'
import { toErc20Address } from 'utils/tokens'
import { FeeInformation, FeeQuoteParams, PriceInformation, PriceQuoteParams } from '../price'
import { AppDataDoc } from 'utils/metadata'
import MetadataError from './errors/MetadataError'

function getOperatorUrl(): Partial<Record<ChainId, string>> {
  if (isDev) {
    return {
      [ChainId.MAINNET]:
        process.env.REACT_APP_API_URL_STAGING_MAINNET || 'https://protocol-mainnet.dev.gnosisdev.com/api',
      [ChainId.RINKEBY]:
        process.env.REACT_APP_API_URL_STAGING_RINKEBY || 'https://protocol-rinkeby.dev.gnosisdev.com/api',
      [ChainId.XDAI]: process.env.REACT_APP_API_URL_STAGING_XDAI || 'https://protocol-xdai.dev.gnosisdev.com/api',
    }
  }

  // Production, staging, ens, ...
  return {
    [ChainId.MAINNET]: process.env.REACT_APP_API_URL_PROD_MAINNET || 'https://protocol-mainnet.gnosis.io/api',
    [ChainId.RINKEBY]: process.env.REACT_APP_API_URL_PROD_RINKEBY || 'https://protocol-rinkeby.gnosis.io/api',
    [ChainId.XDAI]: process.env.REACT_APP_API_URL_PROD_XDAI || 'https://protocol-xdai.gnosis.io/api',
  }
}

const API_BASE_URL = getOperatorUrl()

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-AppId': APP_ID.toString(),
}

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string

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
    throw new Error('Unsupported Network. The operator API is not deployed in the Network ' + chainId)
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

function _post(chainId: ChainId, url: string, data: any): Promise<Response> {
  return _fetch(chainId, url, 'POST', data)
}

function _get(chainId: ChainId, url: string): Promise<Response> {
  return _fetch(chainId, url, 'GET')
}

function _delete(chainId: ChainId, url: string, data: any): Promise<Response> {
  return _fetch(chainId, url, 'DELETE', data)
}

export async function sendSignedOrder(params: {
  chainId: ChainId
  order: OrderCreation
  owner: string
}): Promise<OrderID> {
  const { chainId, order, owner } = params
  console.log('[utils:operator] Post signed order for network', chainId, order)

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
  console.log('[util:operator] Success posting the signed order', uid)
  return uid
}

type OrderCancellationParams = {
  chainId: ChainId
  cancellation: OrderCancellation
  owner: string
}

export async function sendSignedOrderCancellation(params: OrderCancellationParams): Promise<void> {
  const { chainId, cancellation, owner: from } = params

  console.log('[utils:operator] Delete signed order for network', chainId, cancellation)

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

  console.log('[utils:operator] Cancelled order', cancellation.orderUid, chainId)
}

const UNHANDLED_QUOTE_ERROR: GpQuoteErrorObject = {
  errorType: GpQuoteErrorCodes.UNHANDLED_ERROR,
  description: GpQuoteErrorDetails.UNHANDLED_ERROR,
}

const UNHANDLED_ORDER_ERROR: ApiErrorObject = {
  errorType: ApiErrorCodes.UNHANDLED_CREATE_ERROR,
  description: ApiErrorCodeDetails.UNHANDLED_CREATE_ERROR,
}

async function _handleQuoteResponse(response: Response) {
  if (!response.ok) {
    const errorObj: ApiErrorObject = await response.json()

    // we need to map the backend error codes to match our own for quotes
    const mappedError = mapOperatorErrorToQuoteError(errorObj)
    throw new QuoteError(mappedError)
  } else {
    return response.json()
  }
}

export async function getPriceQuote(params: PriceQuoteParams): Promise<PriceInformation> {
  const { baseToken, quoteToken, amount, kind, chainId } = params
  console.log('[util:operator] Get price from API', params)

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
  console.log('[util:operator] Get fee from API', params)

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

  return _handleQuoteResponse(response)
}

export async function getOrder(chainId: ChainId, orderId: string): Promise<OrderMetaData | null> {
  console.log('[util:operator] Get order for ', chainId, orderId)
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

export type UploadMetadataParams = {
  chainId: ChainId
  userAddress: string
  metadata: AppDataDoc
  hash: string
}

export async function uploadAppDataDoc(params: UploadMetadataParams): Promise<void> {
  const { chainId, userAddress, metadata, hash } = params
  console.log('[utils:operator] Post AppData doc', params)

  // Call API
  // TODO: the final endpoint IS TBD
  const response = await _post(chainId, `/metadata`, {
    user: userAddress,
    metadata,
    hash,
  })

  // Handle response
  if (!response.ok) {
    // Raise an exception
    const errorMessage = await MetadataError.getErrorFromStatusCode(response, 'update')
    throw new Error(errorMessage)
  }

  await response.json()
}

// Register some globals for convenience
registerOnWindow({
  operator: { getFeeQuote, getOrder, sendSignedOrder, uploadAppDataDoc, apiGet: _get, apiPost: _post },
})
