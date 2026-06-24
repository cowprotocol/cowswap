import { useCallback, useMemo } from 'react'

import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'

import { useCapabilities } from 'wagmi'

import { shouldCheckCapabilities } from './useWalletCapabilities.utils'
import { useWidgetProviderMetaInfo } from './useWidgetProviderMetaInfo'

import { useIsWalletConnect } from '../../wagmi/hooks/useIsWalletConnect'
import { useIsSafeViaWc } from '../../wagmi/hooks/useWalletMetadata'
import { useWalletInfo } from '../hooks'
import { getIsInjectedMobileBrowser } from '../utils/connection'

import type { WalletCapabilitiesEnvironment } from './useWalletCapabilities.utils'
import type { GetCapabilitiesData } from '@wagmi/core/query'

export type WalletCapabilities = {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
  atomicBatch?: { supported: boolean }
}

function getWalletCapabilitiesEnvironment(): WalletCapabilitiesEnvironment {
  return {
    isInjectedMobileBrowser: getIsInjectedMobileBrowser(),
    isInjectedWidget: isInjectedWidget(),
    isMobile,
  }
}

export function useWalletCapabilities(): { data: WalletCapabilities | undefined; isLoading: boolean } {
  const isWalletConnect = useIsWalletConnect()
  const widgetProviderMetaInfo = useWidgetProviderMetaInfo()
  const { chainId, account } = useWalletInfo()
  const isSafeViaWc = useIsSafeViaWc()

  const shouldFetchCapabilities = useMemo(
    () =>
      Boolean(
        shouldCheckCapabilities(isWalletConnect, widgetProviderMetaInfo, getWalletCapabilitiesEnvironment()) &&
          account &&
          chainId,
      ),
    [isWalletConnect, widgetProviderMetaInfo, account, chainId],
  )

  const select = useCallback(
    (capabilities: GetCapabilitiesData) => {
      if (!capabilities || !chainId) return undefined as WalletCapabilities | undefined

      // Only apply the Safe wallet fallback (first-entry) when connected via Safe WalletConnect,
      // since Safe's wallet_getCapabilities response may omit the chain ID key.
      // For other wallets (e.g. MetaMask), a missing chain entry means the chain is not supported —
      // using a different chain's capabilities would incorrectly enable features like atomic bundling.
      return (capabilities[chainId] || (isSafeViaWc ? Object.values(capabilities)[0] : undefined)) as
        | WalletCapabilities
        | undefined
    },
    [chainId, isSafeViaWc],
  )

  // Fetch capabilities for all chains (no chainId filter) so we can apply
  // the Safe wallet fallback: if the exact chain is missing, use the first entry.
  // See https://github.com/safe-global/safe-wallet-monorepo/issues/6906
  return useCapabilities({
    account,
    query: {
      enabled: shouldFetchCapabilities,
      retry: false,
      retryOnMount: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      select,
    },
  })
}
