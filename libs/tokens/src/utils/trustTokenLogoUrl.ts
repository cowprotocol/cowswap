import { SupportedChainId } from '@cowprotocol/cow-sdk'

const chainIdToName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'xdai',
  [SupportedChainId.SEPOLIA]: 'ethereum',
}

export function trustTokenLogoUrl(address: string, chainId: SupportedChainId): string {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainIdToName[chainId]}/assets/${address}/logo.png`
}
