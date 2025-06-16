import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { isMobile } from '@cowprotocol/common-utils'
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

export function useWalletCapabilities(): SWRResponse<WalletCapabilities | undefined> {
  const provider = useWalletProvider()
  const isWalletConnect = useIsWalletConnect()
  const widgetProviderMetaInfo = useWidgetProviderMetaInfo()
  const { chainId, account } = useWalletInfo()

  const isWalletConnectViaWidget = Boolean(widgetProviderMetaInfo?.providerWcMetadata)
  /**
   * Walletconnect in mobile browsers initiates a request with confirmation to the wallet
   * to get the capabilities. It breaks the flow with perpetual reuqests.
   */
  const shouldCheckCapabilities = !((isWalletConnect || isWalletConnectViaWidget) && isMobile)

  return useSWR(
    shouldCheckCapabilities && provider && account && chainId ? [provider, account, chainId] : null,
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
