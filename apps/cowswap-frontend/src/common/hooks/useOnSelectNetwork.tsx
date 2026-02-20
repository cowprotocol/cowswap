/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { Trans } from '@lingui/react/macro'

import { useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { useSetWalletConnectionError } from 'modules/wallet/hooks/useSetWalletConnectionError'

import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'
import { SwitchInProgressError, useSwitchNetworkWithGuidance } from './useSwitchNetworkWithGuidance'

export function useOnSelectNetwork(): (chainId: SupportedChainId, skipClose?: boolean) => Promise<void> {
  const addSnackbar = useAddSnackbar()
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const setWalletConnectionError = useSetWalletConnectionError()
  const switchNetwork = useSwitchNetworkWithGuidance()

  return useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      try {
        setWalletConnectionError(undefined)
        await switchNetwork(targetChain, { source: 'networkSelector' })

        setChainIdToUrl(targetChain)
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (isRejectRequestProviderError(error) || error instanceof SwitchInProgressError) {
          return
        }

        console.error('Failed to switch networks', error)

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

        setWalletConnectionError(error.message)
      }

      if (!skipClose) {
        closeModal()
      }
    },
    [switchNetwork, setWalletConnectionError, addSnackbar, closeModal, setChainIdToUrl],
  )
}
