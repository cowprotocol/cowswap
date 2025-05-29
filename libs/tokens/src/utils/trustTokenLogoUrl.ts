import { SupportedChainId } from '@cowprotocol/cow-sdk'

const chainIdToName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'xdai',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: 'ethereum',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.AVALANCHE]: 'avalanche',
}

export function trustTokenLogoUrl(address: string, chainId: SupportedChainId): string {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainIdToName[chainId]}/assets/${address}/logo.png`
}
