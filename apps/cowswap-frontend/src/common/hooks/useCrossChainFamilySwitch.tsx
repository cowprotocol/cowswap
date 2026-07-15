import { useCallback } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { isSameChainFamily } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useDisconnectWallet, useOpenWalletConnectionModal, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { useConfirmationRequest } from './useConfirmationRequest'
import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

export enum CrossChainFamilySwitchState {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  NOT_CROSSING_CHAIN = 'NOT_CROSSING_CHAIN',
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

      if (!isWalletConnected) {
        return CrossChainFamilySwitchState.WALLET_NOT_CONNECTED
      }

      const sourceChainLabel = CHAIN_INFO[currentChainId].label
      const targetChainLabel = CHAIN_INFO[targetChainId].label

      const confirmed = await triggerConfirmation({
        confirmWord: t`confirm`,
        title: t`Switching network type`,
        description: (
          <span>
            <Trans>
              You're switching from {sourceChainLabel} to {targetChainLabel}.
            </Trans>
            <br />
            <Trans>This requires connecting a different wallet.</Trans>
            <br />
            <Trans>Your current wallet will be disconnected.</Trans>
          </span>
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
      triggerConfirmation,
      disconnectWallet,
      openWalletConnectionModal,
      setChainIdToUrl,
      closeModal,
    ],
  )
}
