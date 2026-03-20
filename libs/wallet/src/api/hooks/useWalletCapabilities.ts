import { useMemo } from 'react'

import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'

import { useCapabilities } from 'wagmi'

import { useWidgetProviderMetaInfo } from './useWidgetProviderMetaInfo'

import { useIsWalletConnect } from '../../wagmi/hooks/useIsWalletConnect'
import { useWalletInfo } from '../hooks'

export type WalletCapabilities = {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
}

function shouldCheckCapabilities(
  isWalletConnect: boolean,
  { data, isLoading }: ReturnType<typeof useWidgetProviderMetaInfo>,
): boolean {
  // When widget in the mobile device, wait till providerWcMetadata is loaded
  // In order to detect if is connected to WalletConnect
  if (isInjectedWidget() && isMobile && isLoading) {
    return false
  }

  const isWalletConnectViaWidget = Boolean(data?.providerWcMetadata)

  return !((isWalletConnect || isWalletConnectViaWidget) && isMobile)
}

export function useWalletCapabilities(): { data: WalletCapabilities | undefined; isLoading: boolean } {
  const isWalletConnect = useIsWalletConnect()
  const widgetProviderMetaInfo = useWidgetProviderMetaInfo()
  const { chainId, account } = useWalletInfo()

  const shouldFetchCapabilities = useMemo(
    () => Boolean(shouldCheckCapabilities(isWalletConnect, widgetProviderMetaInfo) && account && chainId),
    [isWalletConnect, widgetProviderMetaInfo, account, chainId],
  )

  return useCapabilities({
    account,
    chainId,
    query: { enabled: shouldFetchCapabilities, retry: false },
  })
}
