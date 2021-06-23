import { ChainId } from '@uniswap/sdk'
import { getSigningSchemeApiValue, OrderCreation } from 'utils/signatures'
import { APP_ID } from 'constants/index'
import { registerOnWindow } from '../misc'
import { isDev } from '../environments'
import { FeeInformation, PriceInformation } from 'state/price/reducer'
import OperatorError, { ApiError } from './error'
import { toErc20Address } from 'utils/tokens'

function getOperatorUrl(): Partial<Record<ChainId, string>> {
  if (isDev) {
    return {
      [ChainId.MAINNET]:
        process.env.REACT_APP_API_URL_STAGING_MAINNET || 'https://protocol-mainnet.dev.gnosisdev.com/api',
      [ChainId.RINKEBY]:
        process.env.REACT_APP_API_URL_STAGING_RINKEBY || 'https://protocol-rinkeby.dev.gnosisdev.com/api',
      [ChainId.XDAI]: process.env.REACT_APP_API_URL_STAGING_XDAI || 'https://protocol-xdai.dev.gnosisdev.com/api'
    }
  }

  // Production, staging, ens, ...
  return {
    [ChainId.MAINNET]: process.env.REACT_APP_API_URL_PROD_MAINNET || 'https://protocol-mainnet.gnosis.io/api',
    [ChainId.RINKEBY]: process.env.REACT_APP_API_URL_PROD_RINKEBY || 'https://protocol-rinkeby.gnosis.io/api',
    [ChainId.XDAI]: process.env.REACT_APP_API_URL_PROD_XDAI || 'https://protocol-xdai.gnosis.io/api'
  }
}

const API_BASE_URL = getOperatorUrl()

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-AppId': APP_ID.toString()
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
  kind: string
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

function _post(chainId: ChainId, url: string, data: any): Promise<Response> {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method: 'POST',
    body: JSON.stringify(data)
  })
}

function _fetchGet(chainId: ChainId, url: string) {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS
  })
}

export async function postSignedOrder(params: {
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
    from: owner
  })

  // Handle response
  if (!response.ok) {
    // Raise an exception
    const errorMessage = await OperatorError.getErrorFromStatusCode(response)
    throw new Error(errorMessage)
  }

  const uid = (await response.json()) as string
  console.log('[util:operator] Success posting the signed order', uid)
  return uid
}

export type FeeQuoteParams = Pick<OrderMetaData, 'sellToken' | 'buyToken' | 'kind'> & {
  amount: string
  chainId: ChainId
}

export type PriceQuoteParams = Omit<FeeQuoteParams, 'sellToken' | 'buyToken'> & {
  baseToken: string
  quoteToken: string
}

async function _getJson(chainId: ChainId, url: string): Promise<any> {
  let response: Response | undefined
  let json
  try {
    response = await _fetchGet(chainId, url)
    json = await response.json()
  } finally {
    if (!response || !json) {
      throw new Error(`Error getting query @ ${url}`)
    } else if (!response.ok) {
      // is backend error handled at this point
      const errorResponse: ApiError = json
      throw new OperatorError(errorResponse)
    } else {
      return json
    }
  }
}

export async function getPriceQuote(params: PriceQuoteParams): Promise<PriceInformation> {
  const { baseToken, quoteToken, amount, kind, chainId } = params
  console.log('[util:operator] Get Price from API', params)

  return _getJson(
    chainId,
    `/markets/${toErc20Address(baseToken, chainId)}-${toErc20Address(quoteToken, chainId)}/${kind}/${amount}`
  )
}

export async function getFeeQuote(params: FeeQuoteParams): Promise<FeeInformation> {
  const { sellToken, buyToken, amount, kind, chainId } = params
  console.log('[util:operator] Get fee from API', params)

  return _getJson(
    chainId,
    `/fee?sellToken=${toErc20Address(sellToken, chainId)}&buyToken=${toErc20Address(
      buyToken,
      chainId
    )}&amount=${amount}&kind=${kind}`
  )
}

export async function getOrder(chainId: ChainId, orderId: string): Promise<OrderMetaData | null> {
  console.log('[util:operator] Get order for ', chainId, orderId)
  return _getJson(chainId, `/orders/${orderId}`)
}

// Register some globals for convenience
registerOnWindow({ operator: { getFeeQuote, getOrder, postSignedOrder, apiGet: _fetchGet, apiPost: _post } })
