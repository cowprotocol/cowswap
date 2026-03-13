import { BaseChainInfo, RPC_URLS } from '@cowprotocol/common-const'
import { ChainInfo, isEvmChain, SupportedChainId, TargetChainId } from '@cowprotocol/cow-sdk'

export function mapChainInfo(chainId: TargetChainId, info: BaseChainInfo): ChainInfo {
  const shared = {
    addressPrefix: info.addressPrefix,
    docs: {
      url: info.docs,
      name: `${info.label} Docs`,
    },
    isTestnet: chainId === SupportedChainId.SEPOLIA,
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

  if (isEvmChain(chainId)) {
    return {
      ...shared,
      eip155Label: info.eip155Label ?? '',
      contracts: {},
      rpcUrls: {
        default: {
          http: [RPC_URLS[chainId]],
        },
      },
    }
  }

  return {
    ...shared,
  }
}
