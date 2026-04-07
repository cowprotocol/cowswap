import { useCallback } from 'react'

import { isCoinbaseWalletBrowser, isMobile, withTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar, useRemoveSnackbar } from '@cowprotocol/snackbars'
import { ConnectionType, useConnectionType, useSwitchNetwork } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

const COINBASE_MOBILE_SWITCH_SNACKBAR_ID = 'coinbase-mobile-network-switch'
const COINBASE_MOBILE_SWITCH_SNACKBAR_DELAY_MS = 500
const COINBASE_MOBILE_SWITCH_TIMEOUT_MS = 60_000

// Module-scoped: shared across ALL hook instances (useOnSelectNetwork + useSetupTradeState)
let inFlightPromise: Promise<void> | null = null

/** Exported for test cleanup only */
export function _resetInFlightState(): void {
  inFlightPromise = null
}

export class SwitchInProgressError extends Error {
  constructor() {
    super('Network switch already in progress')
    this.name = 'SwitchInProgressError'
  }
}

export function useSwitchNetworkWithGuidance(): (targetChain: SupportedChainId) => Promise<void> {
  const switchNetwork = useSwitchNetwork()
  const connectionType = useConnectionType()
  const isCoinbaseWallet = connectionType === ConnectionType.COINBASE_WALLET
  const addSnackbar = useAddSnackbar()
  const removeSnackbar = useRemoveSnackbar()

  return useCallback(
    async (targetChain: SupportedChainId) => {
      const isCoinbaseMobile = isMobile && isCoinbaseWallet
      const shouldShowGuidance = isCoinbaseMobile && !isCoinbaseWalletBrowser

      if (isCoinbaseMobile && inFlightPromise) {
        throw new SwitchInProgressError()
      }

      let guidanceTimeout: ReturnType<typeof setTimeout> | undefined

      try {
        if (isCoinbaseMobile) {
          if (shouldShowGuidance) {
            guidanceTimeout = setTimeout(() => {
              addSnackbar({
                id: COINBASE_MOBILE_SWITCH_SNACKBAR_ID,
                icon: 'alert',
                content: <Trans>Please open the Coinbase Wallet app to complete the network switch.</Trans>,
                duration: COINBASE_MOBILE_SWITCH_TIMEOUT_MS + 5_000,
              })
            }, COINBASE_MOBILE_SWITCH_SNACKBAR_DELAY_MS)
          }

          const promise = withTimeout(switchNetwork(targetChain), COINBASE_MOBILE_SWITCH_TIMEOUT_MS, 'Network switch')
          inFlightPromise = promise
          await promise
        } else {
          await switchNetwork(targetChain)
        }
      } finally {
        if (isCoinbaseMobile) {
          if (guidanceTimeout) clearTimeout(guidanceTimeout)
          if (shouldShowGuidance) {
            removeSnackbar(COINBASE_MOBILE_SWITCH_SNACKBAR_ID)
          }
          inFlightPromise = null
        }
      }
    },
    [switchNetwork, isCoinbaseWallet, addSnackbar, removeSnackbar],
  )
}
