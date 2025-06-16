import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import ms from 'ms.macro'
import useSWR, { SWRResponse } from 'swr'

import { useWidgetProviderMetaInfo } from './useWidgetProviderMetaInfo'

import { useIsWalletConnect } from '../../web3-react/hooks/useIsWalletConnect'
import { useWalletInfo } from '../hooks'

export type WalletCapabilities = {
  atomicBatch?: { supported: boolean }
}

const requestTimeout = ms`10s`

/**
 * Walletconnect in mobile browsers initiates a request with confirmation to the wallet
 * to get the capabilities. It breaks the flow with perpetual reuqests.
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
  const isWalletConnect = useIsWalletConnect()
  const widgetProviderMetaInfo = useWidgetProviderMetaInfo()
  const { chainId, account } = useWalletInfo()

  return useSWR(
    shouldCheckCapabilities(isWalletConnect, widgetProviderMetaInfo) && provider && account && chainId
      ? [provider, account, chainId]
      : null,
    ([provider, account, chainId]) => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(undefined)
        }, requestTimeout)

        provider
          .send('wallet_getCapabilities', [account])
          .then((result: { [chainIdHex: string]: WalletCapabilities }) => {
            clearInterval(timeout)

            if (!result) {
              resolve(undefined)
              return
            }

            const chainIdHex = '0x' + (+chainId).toString(16)

            resolve(result[chainIdHex])
          })
          .catch(() => {
            clearInterval(timeout)
            resolve(undefined)
          })
      })
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
