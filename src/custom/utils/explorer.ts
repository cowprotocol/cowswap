import { SupportedChainId as ChainId } from 'constants/chains'
import { OrderID } from 'api/cow'
import { isLocal, isDev, isPr, isStaging, isBarn } from './environments'

function _getExplorerUrlByEnvironment() {
  let baseUrl: string | undefined
  if (isLocal || isDev || isPr) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_DEV || 'https://protocol-explorer.dev.gnosisdev.com'
  } else if (isStaging) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_STAGING || 'https://protocol-explorer.staging.gnosisdev.com'
  } else if (isBarn) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_BARN || 'https://barn.explorer.cow.fi'
  } else {
    // Production by default
    baseUrl = process.env.REACT_APP_EXPLORER_URL_PROD || 'https://explorer.cow.fi'
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

export function getExplorerAddressLink(chainId: ChainId, address: string): string {
  const baseUrl = _getExplorerBaseUrl(chainId)

  return baseUrl + `/address/${address}`
}
