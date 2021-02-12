import { ChainId } from '@uniswap/sdk'
import { OrderID } from 'utils/operator'

// TODO: using dev endpoint for now. Update to staging/prod when available
const EXPLORER_BASE_URL: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: 'https://protocol-explorer.dev.gnosisdev.com',
  [ChainId.RINKEBY]: 'https://protocol-explorer.dev.gnosisdev.com/rinkeby',
  [ChainId.XDAI]: 'https://protocol-explorer.dev.gnosisdev.com/xdai'
}

function _getExplorerBaseUrl(chainId: ChainId): string {
  const baseUrl = EXPLORER_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error('Unsupported Network. The operator API is not deployed in the Network ' + chainId)
  } else {
    return baseUrl
  }
}

export function getExplorerOrderLink(chainId: ChainId, orderId: OrderID): string {
  const baseUrl = _getExplorerBaseUrl(chainId)

  return baseUrl + `/orders/${orderId}`
}
