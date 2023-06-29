import { MutableRefObject, useCallback, useMemo, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'

import { useAddPopup, useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { updateConnectionError } from 'legacy/state/connection/reducer'
import { useAppDispatch } from 'legacy/state/hooks'

import { getWeb3ReactConnection } from 'modules/wallet/web3-react/connection'
import { switchChain } from 'modules/wallet/web3-react/hooks/switchChain'

import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

export function useOnSelectNetwork(): {
  onSelectChain(chainId: SupportedChainId, skipClose?: boolean): Promise<void>
  isSwitching: MutableRefObject<boolean>
} {
  const { connector } = useWeb3React()
  const dispatch = useAppDispatch()
  const addPopup = useAddPopup()
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const setChainIdToUrl = useLegacySetChainIdToUrl()

  const isSwitching = useRef(false)

  const onSelectChain = useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      if (!connector) return

      isSwitching.current = true

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

      isSwitching.current = false
    },
    [connector, dispatch, setChainIdToUrl, addPopup, closeModal]
  )

  return useMemo(() => ({ onSelectChain, isSwitching }), [onSelectChain, isSwitching])
}
