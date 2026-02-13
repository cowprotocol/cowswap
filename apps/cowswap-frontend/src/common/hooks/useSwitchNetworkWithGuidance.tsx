import { useCallback } from 'react'

import { isMobile, withTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar, useRemoveSnackbar } from '@cowprotocol/snackbars'
import { useIsCoinbaseWallet, useSwitchNetwork } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

const COINBASE_MOBILE_SWITCH_SNACKBAR_ID = 'coinbase-mobile-network-switch'
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
  const isCoinbaseWallet = useIsCoinbaseWallet()
  const addSnackbar = useAddSnackbar()
  const removeSnackbar = useRemoveSnackbar()

  return useCallback(
    async (targetChain: SupportedChainId) => {
      const isCoinbaseMobile = isMobile && isCoinbaseWallet

      if (isCoinbaseMobile && inFlightPromise) {
        throw new SwitchInProgressError()
      }

      try {
        if (isCoinbaseMobile) {
          addSnackbar({
            id: COINBASE_MOBILE_SWITCH_SNACKBAR_ID,
            icon: 'alert',
            content: <Trans>Please open the Coinbase Wallet app to complete the network switch.</Trans>,
            duration: COINBASE_MOBILE_SWITCH_TIMEOUT_MS + 5_000,
          })

          const promise = withTimeout(switchNetwork(targetChain), COINBASE_MOBILE_SWITCH_TIMEOUT_MS, 'Network switch')
          inFlightPromise = promise
          await promise
        } else {
          await switchNetwork(targetChain)
        }
      } finally {
        if (isCoinbaseMobile) {
          removeSnackbar(COINBASE_MOBILE_SWITCH_SNACKBAR_ID)
          inFlightPromise = null
        }
      }
    },
    [switchNetwork, isCoinbaseWallet, addSnackbar, removeSnackbar],
  )
}
