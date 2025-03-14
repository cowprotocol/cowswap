import { useMemo } from 'react'

import { BaseChainInfo, getChainInfo } from '@cowprotocol/common-const'

import { useBridgeSupportedNetworks } from '../../../../../apps/cowswap-frontend/src/modules/bridge/hooks/useBridgeSupportedNetworks'

export function useNetworkLogo(chainId?: number) {
  if (!chainId) {
    return { isLoading: false, logoUrl: undefined }
  }

  const baseNetworkInfo: BaseChainInfo | undefined = useMemo(() => {
    if (!chainId) {
      return undefined
    }

    return getChainInfo(chainId)
  }, [chainId])

  const bridgeNetworkInfo = useBridgeSupportedNetworks()

  if (!chainId) {
    return {
      isLoading: false,
      logoUrl: undefined,
    }
  }

  if (baseNetworkInfo) {
    return {
      isLoading: false,
      logoUrl: baseNetworkInfo.logo.light,
    }
  }

  return {
    isLoading: bridgeNetworkInfo?.isLoading,
    logoUrl: bridgeNetworkInfo?.data?.find((network) => network.id === chainId)?.logoUrl?.light,
    error: bridgeNetworkInfo?.error,
  }
}
