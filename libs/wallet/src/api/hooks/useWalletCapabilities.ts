import { LAUNCH_DARKLY_VIEM_MIGRATION, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import type { Web3Provider } from '@ethersproject/providers'

import ms from 'ms.macro'
import useSWR, { SWRResponse } from 'swr'
import { useCapabilities } from 'wagmi'

import { useWidgetProviderMetaInfo } from './useWidgetProviderMetaInfo'

import { useIsWalletConnect } from '../../wagmi/hooks/useIsWalletConnect'
import { useIsWalletConnect as legacyUseIsWalletConnect } from '../../web3-react/hooks/useIsWalletConnect'
import { useWalletInfo } from '../hooks'

export type WalletCapabilities = {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
}

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

export function useWalletCapabilities(): SWRResponse<WalletCapabilities | undefined> {
  const provider = useWalletProvider()
  const newIsWalletConnect = useIsWalletConnect()
  const legacyIsWalletConnect = legacyUseIsWalletConnect()
  const widgetProviderMetaInfo = useWidgetProviderMetaInfo()
  const { chainId, account } = useWalletInfo()

  const capabilities = useCapabilities({ account, chainId })

  let isWalletConnect = legacyIsWalletConnect
  if (LAUNCH_DARKLY_VIEM_MIGRATION) {
    isWalletConnect = newIsWalletConnect
  }

  const shouldFetchCapabilities = Boolean(
    shouldCheckCapabilities(isWalletConnect, widgetProviderMetaInfo) && provider && account && chainId,
  )

  const swrResponse = useSWR<
    WalletCapabilities | undefined,
    unknown,
    readonly [Web3Provider, string, SupportedChainId] | null
  >(
    shouldFetchCapabilities ? [provider!, account!, chainId] : null,
    ([provider, account, chainId]) => {
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
            const chainIdHex = '0x' + (+chainId).toString(16)

            // fallback for Safe wallets https://github.com/safe-global/safe-wallet-monorepo/issues/6906
            resolve(result[chainIdHex] || result[Object.keys(result)[0]])
          })
          .catch(() => {
            clearTimeout(timeout)
            resolve(undefined)
          })
      })
    },
    SWR_NO_REFRESH_OPTIONS,
  )

  if (LAUNCH_DARKLY_VIEM_MIGRATION) {
    // TODO the return type for this function will be adjusted on M-7 COW-572
    return { ...capabilities, mutate: async () => undefined, isValidating: false }
  } else if (!shouldFetchCapabilities && widgetProviderMetaInfo.isLoading) {
    return { ...swrResponse, isLoading: true }
  }

  return swrResponse
}
