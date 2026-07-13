import { useCallback } from 'react'

import { isSameChainFamily } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useDisconnectWallet, useOpenWalletConnectionModal, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { useConfirmationRequest } from './useConfirmationRequest'
import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

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
export function useCrossChainFamilySwitch(): (chainId: SupportedChainId, skipClose?: boolean) => Promise<boolean> {
  const { chainId: currentChainId, account } = useWalletInfo()
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const disconnectWallet = useDisconnectWallet()
  const openWalletConnectionModal = useOpenWalletConnectionModal()
  const triggerConfirmation = useConfirmationRequest({})

  return useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      const isWalletConnected = !!account
      const crossingChainFamily = !isSameChainFamily(currentChainId, targetChain)

      if (!isWalletConnected || !crossingChainFamily) {
        return false
      }

      const confirmed = await triggerConfirmation({
        confirmWord: t`confirm`,
        title: t`Switching network type`,
        description: t`You're switching between EVM and non-EVM networks. This requires connecting a different wallet. Your current wallet will be disconnected. Are you sure?`,
        action: t`switch network type`,
        callToAction: t`Confirm`,
        skipInput: true,
      })

      if (!confirmed) {
        return true
      }

      try {
        // Only change the URL after the wallet is actually disconnected, so URL and wallet
        // stay in sync if the disconnect fails.
        await disconnectWallet()
      } catch (error) {
        console.error('Failed to disconnect wallet while switching network type', error)
        return true
      }

      setChainIdToUrl(targetChain)
      openWalletConnectionModal()

      if (!skipClose) {
        closeModal()
      }

      return true
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
