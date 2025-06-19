import { BaseChainInfo, RPC_URLS } from '@cowprotocol/common-const'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

export function mapChainInfo(chainId: SupportedChainId, info: BaseChainInfo): ChainInfo {
  return {
    addressPrefix: info.addressPrefix,
    contracts: {},
    docs: {
      url: info.docs,
      name: `${info.label} Docs`,
    },
    isTestnet: chainId === SupportedChainId.SEPOLIA,
    rpcUrls: {
      default: {
        http: [RPC_URLS[chainId]],
      },
    },
    website: {
      url: info.infoLink,
      name: info.label,
    },
    id: chainId,
    label: info.label,
    nativeCurrency: {
      ...info.nativeCurrency,
      name: info.nativeCurrency.name || '',
      symbol: info.nativeCurrency.symbol || '',
    },
    blockExplorer: {
      url: info.explorer,
      name: info.explorerTitle,
    },
    logo: {
      light: info.logo.light,
      dark: info.logo.dark,
    },
    color: info.color,
  }
}
