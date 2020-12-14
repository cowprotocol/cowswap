import { ChainId } from '@uniswap/sdk'
import { OrderCreation, ORDER_KIND_SELL } from 'utils/signatures'

/**
 * See Swagger documentation:
 *    https://protocol-rinkeby.dev.gnosisdev.com/api/
 */
const API_BASE_URL: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: 'https://protocol.gnosis.io/api/v1',
  [ChainId.RINKEBY]: 'https://protocol-rinkeby.dev.gnosisdev.com/api/v1'
  // [ChainId.xDAI]: 'https://protocol-xdai.dev.gnosisdev.com/api/v2'
}

const DEFAULT_HEADERS = {
  headers: {
    'Content-Type': 'application/json'
    // TODO: Maybe add a custom header for the AppId (same as the signing tx)
  }
}

const POST_HEADERS = {
  method: 'POST',
  ...DEFAULT_HEADERS
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

function _getApiBaseUrl(chainId: ChainId): string {
  const baseUrl = API_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error('Unsupported Network. The operator API is not deployed in the Network ' + chainId)
  } else {
    return baseUrl
  }
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

  const orderRaw: Omit<OrderCreation, 'kind'> & { kind: string } = {
    ...order,
    // TODO: The NPM module will use the same structure as the API soon, this is temporal code too
    kind: order.kind === ORDER_KIND_SELL ? 'sell' : 'buy'
  }

  // Call API
  const baseUrl = _getApiBaseUrl(chainId)
  const response = await fetch(`${baseUrl}/orders`, {
    ...POST_HEADERS,
    body: JSON.stringify(orderRaw)
  })

  // Handle respose
  if (!response.ok) {
    // Raise an exception
    const errorMessage = await _getErrorForUnsuccessfulPostOrder(response)
    throw new Error(errorMessage)
  }

  const uid = response.json()
  console.log('[util:operator] Success posting the signed order', uid)
  return uid
}
