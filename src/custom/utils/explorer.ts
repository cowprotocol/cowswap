import { SupportedChainId as ChainId } from 'constants/chains'
import { OrderID } from 'utils/operator'
import { isLocal, isDev, isPr, isStaging, isBarn } from './environments'

function _getExplorerUrlByEnvironment() {
  let baseUrl: string | undefined
  if (isLocal || isDev || isPr || isBarn) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_DEV || 'https://protocol-explorer.dev.gnosisdev.com'
  } else if (isStaging) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_STAGING || 'https://protocol-explorer.staging.gnosisdev.com'
  } else {
    // Production by default
    baseUrl = process.env.REACT_APP_EXPLORER_URL_PROD || 'https://gnosis-protocol.io'
  }

  return {
    [ChainId.MAINNET]: baseUrl,
    [ChainId.RINKEBY]: `${baseUrl}/rinkeby`,
    [ChainId.XDAI]: `${baseUrl}/xdai`,
  }
}

const EXPLORER_BASE_URL: Partial<Record<ChainId, string>> = _getExplorerUrlByEnvironment()

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
