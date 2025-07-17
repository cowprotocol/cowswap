import { SupportedChainId } from '@cowprotocol/cow-sdk'

const chainIdToName: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'xdai',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: 'ethereum',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.AVALANCHE]: 'avalanche',
}

export function trustTokenLogoUrl(address: string, chainId: SupportedChainId): string | null {
  const trustChainName = chainIdToName[chainId]

  if (!trustChainName) {
    return null
  }

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustChainName}/assets/${address}/logo.png`
}
