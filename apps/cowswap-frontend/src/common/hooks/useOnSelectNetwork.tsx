import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { switchChain } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { useSetWalletConnectionError } from 'modules/wallet/hooks/useSetWalletConnectionError'

import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

export function useOnSelectNetwork(): (chainId: SupportedChainId, skipClose?: boolean) => Promise<void> {
  const { connector } = useWeb3React()
  const addSnackbar = useAddSnackbar()
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const setWalletConnectionError = useSetWalletConnectionError()

  return useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      if (!connector) return

      try {
        setWalletConnectionError(undefined)
        await switchChain(connector, targetChain)

        setChainIdToUrl(targetChain)
      } catch (error: any) {
        console.error('Failed to switch networks', error)

        if (isRejectRequestProviderError(error)) {
          return
        }

        addSnackbar({
          id: 'failed-network-switch',
          icon: 'alert',
          content: (
            <>
              Failed to switch networks from the CoW Swap Interface. In order to use CoW Swap on{' '}
              {getChainInfo(targetChain)?.label}, you must change the network in your wallet.
            </>
          ),
        })

        setWalletConnectionError(error.message)
      }

      if (!skipClose) {
        closeModal()
      }
    },
    [connector, setWalletConnectionError, addSnackbar, closeModal, setChainIdToUrl]
  )
}
