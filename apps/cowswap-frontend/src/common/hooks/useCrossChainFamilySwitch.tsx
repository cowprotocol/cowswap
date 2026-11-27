import { useCallback } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { isSameChainFamily } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useDisconnectWallet, useOpenWalletConnectionModal, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { useConfirmationRequest } from './useConfirmationRequest'
import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

export enum CrossChainFamilySwitchState {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  NOT_CROSSING_CHAIN = 'NOT_CROSSING_CHAIN',
  HOST_OWNS_WALLET = 'HOST_OWNS_WALLET',
  NOT_CONFIRMED = 'NOT_CONFIRMED',
  DISCONNECT_FAILED = 'DISCONNECT_FAILED',
  FINISHED = 'FINISHED',
}

/**
 * Handles switching to a network that belongs to a different chain family than the
 * currently connected wallet (EVM ↔ non-EVM, e.g. Ethereum → Solana).
 *
 * These families use different wallets, so we can't hot-swap the chain. Instead we
 * confirm the user's intent, disconnect the current wallet and open the connection
 * modal so they can connect a wallet compatible with the target network.
 *
 * A widget in dapp mode is the exception: the host owns the wallet, the namespaces can be lent
 * side by side, and the widget's own connect modal must never open there — so the switch is left
 * to the regular path.
 *
 * Returns a function that resolves to `true` when it took over the switch (target
 * crosses the family boundary while a wallet is connected — whether the user then
 * confirmed or cancelled), and `false` when the caller should perform a regular
 * same-family network switch.
 */
export function useCrossChainFamilySwitch(): (
  chainId: SupportedChainId,
  skipClose?: boolean,
) => Promise<CrossChainFamilySwitchState> {
  const { chainId: currentChainId, account } = useWalletInfo()
  const { standaloneMode } = useInjectedWidgetParams()
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const disconnectWallet = useDisconnectWallet()
  const openWalletConnectionModal = useOpenWalletConnectionModal()
  const triggerConfirmation = useConfirmationRequest({})

  return useCallback(
    async (targetChainId: SupportedChainId, skipClose?: boolean) => {
      const isWalletConnected = !!account
      const crossingChainFamily = !isSameChainFamily(currentChainId, targetChainId)

      if (!crossingChainFamily) {
        return CrossChainFamilySwitchState.NOT_CROSSING_CHAIN
      }

      if (standaloneMode === false) {
        return CrossChainFamilySwitchState.HOST_OWNS_WALLET
      }

      if (!isWalletConnected) {
        return CrossChainFamilySwitchState.WALLET_NOT_CONNECTED
      }

      const sourceChainLabel = CHAIN_INFO[currentChainId].label
      const targetChainLabel = CHAIN_INFO[targetChainId].label

      const confirmed = await triggerConfirmation({
        confirmWord: t`confirm`,
        title: t`Switching network type`,
        description: (
          <>
            <p>
              <Trans>
                You're switching from {sourceChainLabel} to {targetChainLabel}.
              </Trans>
            </p>
            <p>
              <Trans>This requires connecting a different wallet, so your current wallet will be disconnected.</Trans>
            </p>
          </>
        ),
        action: t`switch network type`,
        callToAction: t`Connect wallet`,
        skipInput: true,
        bottomContent: null,
      })

      if (!confirmed) {
        return CrossChainFamilySwitchState.NOT_CONFIRMED
      }

      try {
        // Only change the URL after the wallet is actually disconnected, so URL and wallet
        // stay in sync if the disconnect fails.
        await disconnectWallet()
      } catch (error) {
        console.error('Failed to disconnect wallet while switching network type', error)
        return CrossChainFamilySwitchState.DISCONNECT_FAILED
      }

      setChainIdToUrl(targetChainId)
      openWalletConnectionModal()

      if (!skipClose) {
        closeModal()
      }

      return CrossChainFamilySwitchState.FINISHED
    },
    [
      account,
      currentChainId,
      standaloneMode,
      triggerConfirmation,
      disconnectWallet,
      openWalletConnectionModal,
      setChainIdToUrl,
      closeModal,
    ],
  )
}
