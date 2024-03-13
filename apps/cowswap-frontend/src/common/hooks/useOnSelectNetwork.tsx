import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { getWeb3ReactConnection } from '@cowprotocol/wallet'
import { switchChain } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { updateConnectionError } from 'legacy/state/connection/reducer'
import { useAppDispatch } from 'legacy/state/hooks'

import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

export function useOnSelectNetwork(): (chainId: SupportedChainId, skipClose?: boolean) => Promise<void> {
  const { connector } = useWeb3React()
  const dispatch = useAppDispatch()
  const addSnackbar = useAddSnackbar()
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const setChainIdToUrl = useLegacySetChainIdToUrl()

  return useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      if (!connector) return

      const connectionType = getWeb3ReactConnection(connector).type

      try {
        dispatch(updateConnectionError({ connectionType, error: undefined }))
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

        dispatch(updateConnectionError({ connectionType, error: error.message }))
      }

      if (!skipClose) {
        closeModal()
      }
    },
    [connector, dispatch, addSnackbar, closeModal, setChainIdToUrl]
  )
}
