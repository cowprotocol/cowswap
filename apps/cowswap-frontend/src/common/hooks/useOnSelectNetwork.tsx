// TODO: Don't use 'modules' import
import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { useSwitchNetwork } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { CrossChainFamilySwitchState, useCrossChainFamilySwitch } from './useCrossChainFamilySwitch'
import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

export function useOnSelectNetwork(): (chainId: SupportedChainId, skipClose?: boolean) => Promise<void> {
  const addSnackbar = useAddSnackbar()
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const switchNetwork = useSwitchNetwork()
  const handleCrossChainFamilySwitch = useCrossChainFamilySwitch()

  return useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      // Switching between EVM and non-EVM networks requires a different wallet and is handled
      // separately (confirm + disconnect + reconnect) instead of a regular network switch.
      const switchChainState = await handleCrossChainFamilySwitch(targetChain, skipClose)

      if (
        !(
          switchChainState === CrossChainFamilySwitchState.FINISHED ||
          switchChainState === CrossChainFamilySwitchState.WALLET_NOT_CONNECTED
        )
      ) {
        return
      }

      try {
        await switchNetwork(targetChain)

        setChainIdToUrl(targetChain)
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Failed to switch networks', error)

        const causeIsRejection = !error.cause || isRejectRequestProviderError(error.cause)
        if (isRejectRequestProviderError(error) && causeIsRejection) {
          return
        }

        const chainInfoLabel = getChainInfo(targetChain)?.label

        addSnackbar({
          id: 'failed-network-switch',
          icon: 'alert',
          content: (
            <Trans>
              Failed to switch networks from the CoW Swap Interface. In order to use CoW Swap on {chainInfoLabel}, you
              must change the network in your wallet.
            </Trans>
          ),
        })
      }

      if (!skipClose) {
        closeModal()
      }
    },
    [handleCrossChainFamilySwitch, switchNetwork, addSnackbar, closeModal, setChainIdToUrl],
  )
}
