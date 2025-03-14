import { useMemo } from 'react'

import { BaseChainInfo, getChainInfo } from '@cowprotocol/common-const'

import { useBridgeSupportedNetworkById } from '../../../../../apps/cowswap-frontend/src/modules/bridge/hooks/useBridgeSupportedNetworks'

export function useNetworkLogo(chainId?: number) {
  if (!chainId) {
    return { isLoading: false, logoUrl: undefined }
  }


  const baseNetworkInfo: BaseChainInfo = useMemo(() => {
    return getChainInfo(chainId)
  }, [chainId])

  if (baseNetworkInfo) {
    return {
      isLoading: false,
      logoUrl: baseNetworkInfo.logo.light,
    }
  }


  const bridgeNetworkInfo = useBridgeSupportedNetworkById(chainId)

  console.log('bridgeNetworkInfo ==>', bridgeNetworkInfo)
  return {
    isLoading: bridgeNetworkInfo?.isLoading,
    logoUrl: bridgeNetworkInfo?.data,
    error: bridgeNetworkInfo?.error,
  }
}
