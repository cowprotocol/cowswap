import { useMemo } from 'react'

import { LAUNCH_DARKLY_VIEM_MIGRATION, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import type { Web3Provider } from '@ethersproject/providers'

import ms from 'ms.macro'
import useSWR from 'swr'
import { useCapabilities } from 'wagmi'

import { useWidgetProviderMetaInfo } from './useWidgetProviderMetaInfo'

import { useIsWalletConnect } from '../../wagmi/hooks/useIsWalletConnect'
import { useIsWalletConnect as legacyUseIsWalletConnect } from '../../web3-react/hooks/useIsWalletConnect'
import { useWalletInfo } from '../hooks'

export type WalletCapabilities = {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
}

export type CapabilitiesPerChain = Record<number, WalletCapabilities>

const requestTimeout = ms`10s`

/**
 * Walletconnect in mobile browsers initiates a request with confirmation to the wallet
 * to get the capabilities. It breaks the flow with perpetual requests.
 */
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

export function useWalletCapabilities(): {
  data: WalletCapabilities | undefined
  allChains: CapabilitiesPerChain | undefined
  isLoading: boolean
} {
  const provider = useWalletProvider()
  const newIsWalletConnect = useIsWalletConnect()
  const legacyIsWalletConnect = legacyUseIsWalletConnect()
  const widgetProviderMetaInfo = useWidgetProviderMetaInfo()
  const { chainId, account } = useWalletInfo()

  // Wagmi path: omit chainId to get the full per-chain capabilities map
  const capabilities = useCapabilities({ account })

  let isWalletConnect = legacyIsWalletConnect
  if (LAUNCH_DARKLY_VIEM_MIGRATION) {
    isWalletConnect = newIsWalletConnect
  }

  const shouldFetchCapabilities = Boolean(
    shouldCheckCapabilities(isWalletConnect, widgetProviderMetaInfo) && provider && account && chainId,
  )

  // Legacy (SWR) path: fetch the full per-chain capabilities map.
  // chainId stays in the key to trigger refetch on chain switch.
  const swrResponse = useSWR<
    CapabilitiesPerChain | undefined,
    unknown,
    readonly [Web3Provider, string, SupportedChainId] | null
  >(
    shouldFetchCapabilities ? [provider!, account!, chainId] : null,
    ([provider, account, _chainId]) => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(undefined)
        }, requestTimeout)

        provider
          .send('wallet_getCapabilities', [account])
          .then((result: { [chainIdHex: string]: WalletCapabilities }) => {
            clearTimeout(timeout)

            if (!result) {
              resolve(undefined)
              return
            }

            // Convert hex chain ID keys to numeric
            const numericMap: CapabilitiesPerChain = {}
            for (const [hexKey, caps] of Object.entries(result)) {
              numericMap[parseInt(hexKey, 16)] = caps
            }
            resolve(numericMap)
          })
          .catch((error) => {
            console.error('useWalletCapabilities() error', error)
            clearTimeout(timeout)
            resolve(undefined)
          })
      })
    },
    SWR_NO_REFRESH_OPTIONS,
  )

  // Determine the full per-chain map based on the active code path
  const allChains = useMemo((): CapabilitiesPerChain | undefined => {
    if (LAUNCH_DARKLY_VIEM_MIGRATION) {
      return capabilities.data as CapabilitiesPerChain | undefined
    }
    return swrResponse.data
  }, [capabilities.data, swrResponse.data])

  // Derive current chain's capabilities from the full map (backward-compat for existing consumers)
  const data = useMemo((): WalletCapabilities | undefined => {
    if (!allChains || !chainId) return undefined
    // fallback for Safe wallets https://github.com/safe-global/safe-wallet-monorepo/issues/6906
    return allChains[chainId] || allChains[Number(Object.keys(allChains)[0])]
  }, [allChains, chainId])

  let isLoading: boolean
  if (LAUNCH_DARKLY_VIEM_MIGRATION) {
    isLoading = capabilities.isLoading
  } else if (!shouldFetchCapabilities && widgetProviderMetaInfo.isLoading) {
    isLoading = true
  } else {
    isLoading = swrResponse.isLoading
  }

  return { data, allChains, isLoading }
}
