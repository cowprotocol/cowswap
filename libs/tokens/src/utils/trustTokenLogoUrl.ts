import { SupportedChainId } from '@cowprotocol/cow-sdk'

const chainIdToName: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'xdai',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: 'ethereum',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.AVALANCHE]: 'avalanche',
  [SupportedChainId.LENS]: null, // As of now (2025/07/16), Lens is not on Trust Wallet assets repo
  [SupportedChainId.BNB]: 'smartchain',
  [SupportedChainId.LINEA]: 'linea',
  [SupportedChainId.PLASMA]: 'plasma',
}

/**
 * @deprecated TODO5(daniel)
 */
export function trustTokenLogoUrl(address: string, chainId: SupportedChainId): string | null {
  const trustChainName = chainIdToName[chainId]

  if (!trustChainName) {
    return null
  }

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustChainName}/assets/${address}/logo.png`
}
