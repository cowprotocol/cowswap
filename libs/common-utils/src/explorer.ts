import { SupportedChainId as ChainId, UID } from '@cowprotocol/cow-sdk'

import { isBarn, isDev, isLocal, isPr, isStaging } from './environments'

function _getExplorerUrlByEnvironment(): Record<ChainId, string> {
  let baseUrl: string | undefined
  if (isLocal || isDev || isPr) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_DEV || 'https://dev.explorer.cow.fi'
  } else if (isStaging) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_STAGING || 'https://staging.explorer.cow.fi'
  } else if (isBarn) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_BARN || 'https://barn.explorer.cow.fi'
  } else {
    // Production by default
    baseUrl = process.env.REACT_APP_EXPLORER_URL_PROD || 'https://explorer.cow.fi'
  }

  return {
    [ChainId.MAINNET]: baseUrl,
    [ChainId.GNOSIS_CHAIN]: `${baseUrl}/gc`,
    [ChainId.ARBITRUM_ONE]: `${baseUrl}/arb1`,
    [ChainId.BASE]: `${baseUrl}/base`,
    [ChainId.SEPOLIA]: `${baseUrl}/sepolia`,
    [ChainId.POLYGON]: `${baseUrl}/pol`,
    [ChainId.AVALANCHE]: `${baseUrl}/avax`,
  }
}

const EXPLORER_BASE_URL: Record<ChainId, string> = _getExplorerUrlByEnvironment()

export function getExplorerBaseUrl(chainId: ChainId): string {
  const baseUrl = EXPLORER_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error('Unsupported Network. The operator API is not deployed in the Network ' + chainId)
  } else {
    return baseUrl
  }
}

export function getExplorerOrderLink(chainId: ChainId, orderId: UID): string {
  const baseUrl = getExplorerBaseUrl(chainId)

  return baseUrl + `/orders/${orderId}`
}

export function getExplorerAddressLink(chainId: ChainId, address: string): string {
  const baseUrl = getExplorerBaseUrl(chainId)

  return baseUrl + `/address/${address}`
}

enum Explorers {
  Explorer = 'Explorer',
  Blockscout = 'Blockscout',
  Etherscan = 'Etherscan',
  Arbiscan = 'Arbiscan',
  GnosisScan = 'GnosisScan',
}

// Used for GA ExternalLink detection
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function detectExplorer(href: string) {
  if (href.includes('explorer.cow.fi')) {
    return Explorers.Explorer
  } else if (href.includes('blockscout.com')) {
    return Explorers.Blockscout
  } else if (href.includes('etherscan.io')) {
    return Explorers.Etherscan
  } else if (href.includes('arbiscan.io')) {
    return Explorers.Arbiscan
  } else if (href.includes('gnosisscan.io')) {
    return Explorers.GnosisScan
  } else {
    return undefined
  }
}
