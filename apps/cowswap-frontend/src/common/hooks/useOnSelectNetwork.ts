import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getWeb3ReactConnection } from '@cowprotocol/wallet'
import { switchChain } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { useAddPopup, useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { updateConnectionError } from 'legacy/state/connection/reducer'
import { useAppDispatch } from 'legacy/state/hooks'

import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

export function useOnSelectNetwork(): (chainId: SupportedChainId, skipClose?: boolean) => Promise<void> {
  const { connector } = useWeb3React()
  const dispatch = useAppDispatch()
  const addPopup = useAddPopup()
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

        dispatch(updateConnectionError({ connectionType, error: error.message }))
        addPopup({ failedSwitchNetwork: targetChain }, 'failed-network-switch')
      }

      if (!skipClose) {
        closeModal()
      }
    },
    [connector, dispatch, addPopup, closeModal, setChainIdToUrl]
  )
}
