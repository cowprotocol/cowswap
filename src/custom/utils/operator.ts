import { ChainId, ETHER, WETH } from '@uniswap/sdk'
import { OrderCreation } from 'utils/signatures'
import { APP_ID } from 'constants/index'
import { registerOnWindow } from './misc'

/**
 * See Swagger documentation:
 *    https://protocol-rinkeby.dev.gnosisdev.com/api/
 */
const API_BASE_URL: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: 'https://protocol-mainnet.dev.gnosisdev.com/api/v1',
  [ChainId.RINKEBY]: 'https://protocol-rinkeby.dev.gnosisdev.com/api/v1'
  // [ChainId.xDAI]: 'https://protocol-xdai.dev.gnosisdev.com/api/v2'
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-AppId': APP_ID.toString()
}

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string

export interface OrderPostError {
  errorType: 'MissingOrderData' | 'InvalidSignature' | 'DuplicateOrder' | 'InsufficientFunds'
  description: string
}

export interface FeeInformation {
  expirationDate: string
  minimalFee: string
  feeRatio: number
}

function _getApiBaseUrl(chainId: ChainId): string {
  const baseUrl = API_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error('Unsupported Network. The operator API is not deployed in the Network ' + chainId)
  } else {
    return baseUrl
  }
}

function _post(chainId: ChainId, url: string, data: any): Promise<Response> {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method: 'POST',
    body: JSON.stringify(data)
  })
}

function _get(chainId: ChainId, url: string) {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS
  })
}

async function _getErrorForBadPostOrderRequest(response: Response): Promise<string> {
  let errorMessage: string
  try {
    const orderPostError: OrderPostError = await response.json()

    switch (orderPostError.errorType) {
      case 'DuplicateOrder':
        errorMessage = 'There was another identical order already submitted'
        break

      case 'InsufficientFunds':
        errorMessage = "The account doesn't have enough funds"
        break

      case 'InvalidSignature':
        errorMessage = 'The order signature is invalid'
        break

      case 'MissingOrderData':
        errorMessage = 'The order has missing information'
        break

      default:
        console.error('Unknown reason for bad order submission', orderPostError)
        errorMessage = orderPostError.description
        break
    }
  } catch (error) {
    console.error('Error handling a 400 error. Likely a problem deserialising the JSON response')
    errorMessage = 'The order was not accepted by the operator'
  }

  return errorMessage
}

async function _getErrorForUnsuccessfulPostOrder(response: Response): Promise<string> {
  let errorMessage: string
  switch (response.status) {
    case 400:
      errorMessage = await _getErrorForBadPostOrderRequest(response)
      break

    case 403:
      errorMessage = 'The order cannot be accepted. Your account is deny-listed.'
      break

    case 429:
      errorMessage = 'The order cannot be accepted. Too many order placements. Please, retry in a minute'
      break

    case 500:
    default:
      errorMessage = 'Error adding an order'
  }
  return errorMessage
}

export async function postSignedOrder(params: { chainId: ChainId; order: OrderCreation }): Promise<OrderID> {
  const { chainId, order } = params
  console.log('[utils:operator] Post signed order for network', chainId, order)

  // Call API
  const response = await _post(chainId, `/orders`, order)

  // Handle respose
  if (!response.ok) {
    // Raise an exception
    const errorMessage = await _getErrorForUnsuccessfulPostOrder(response)
    throw new Error(errorMessage)
  }

  const uid = (await response.json()) as string
  console.log('[util:operator] Success posting the signed order', uid)
  return uid
}

function checkIfEther(tokenAddress: string, chainId: ChainId) {
  let checkedAddress = tokenAddress
  if (tokenAddress === ETHER.symbol) {
    checkedAddress = WETH[chainId].address
  }

  return checkedAddress
}

export async function getFeeQuote(chainId: ChainId, tokenAddress: string): Promise<FeeInformation> {
  const checkedAddress = checkIfEther(tokenAddress, chainId)
  // TODO: I commented out the implementation because the API is not yet implemented. Review the code in the comment below
  console.log('[util:operator] Get fee for ', chainId, checkedAddress)

  // TODO: Let see if we can incorporate the PRs from the Fee, where they cache stuff and keep it in sync using redux.
  // if that part is delayed or need more review, we can easily add the cache in this file (we check expiration and cache here)

  let response: Response | undefined
  try {
    const responseMaybeOk = await _get(chainId, `/tokens/${checkedAddress}/fee`)
    response = responseMaybeOk.ok ? responseMaybeOk : undefined
  } catch (error) {
    // do nothing
  }

  if (!response) {
    throw new Error('Error getting the fee')
  } else {
    return response.json()
  }
}

// Register some globals for convenience
registerOnWindow({ operator: { getFeeQuote, postSignedOrder, apiGet: _get, apiPost: _post } })
