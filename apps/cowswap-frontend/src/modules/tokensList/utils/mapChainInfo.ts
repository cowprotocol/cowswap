import { BaseChainInfo, RPC_URLS } from '@cowprotocol/common-const'
import { ChainInfo, isEvmChain, SupportedChainId, TargetChainId } from '@cowprotocol/cow-sdk'

export function mapChainInfo(chainId: TargetChainId, info: BaseChainInfo): ChainInfo {
  return isEvmChain(chainId)
    ? {
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
        eip155Label: info.eip155Label,
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
    : {
        addressPrefix: info.addressPrefix,
        contracts: {},
        docs: {
          url: info.docs,
          name: `${info.label} Docs`,
        },
        isTestnet: false,
        rpcUrls: {
          default: {
            http: [],
          },
        },
        website: {
          url: info.infoLink,
          name: info.label,
        },
        id: chainId,
        label: info.label,
        eip155Label: info.eip155Label,
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
