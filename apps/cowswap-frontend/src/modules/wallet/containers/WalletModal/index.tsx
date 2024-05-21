import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useWalletInfo, useActivateConnector, ConnectionType } from '@cowprotocol/wallet'

import { useCloseModal, useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

import { useSetWalletConnectionError } from '../../hooks/useSetWalletConnectionError'
import { useWalletConnectionError } from '../../hooks/useWalletConnectionError'
import { WalletModal as WalletModalPure, WalletModalView } from '../../pure/WalletModal'
import { toggleAccountSelectorModalAtom } from '../AccountSelectorModal/state'

export function WalletModal() {
  const dispatch = useAppDispatch()
  const { account } = useWalletInfo()
  const setWalletConnectionError = useSetWalletConnectionError()

  const [walletView, setWalletView] = useState<WalletModalView>('options')
  const isPendingView = walletView === 'pending'

  const pendingError = useWalletConnectionError()

  const walletModalOpen = useModalIsOpen(ApplicationModal.WALLET)
  const closeWalletModal = useCloseModal(ApplicationModal.WALLET)
  const toggleAccountSelectorModal = useSetAtom(toggleAccountSelectorModalAtom)

  const openOptions = useCallback(() => setWalletView('options'), [setWalletView])

  useEffect(() => {
    if (walletModalOpen) {
      setWalletView(account ? 'account' : 'options')
    }
  }, [walletModalOpen, setWalletView, account])

  useEffect(() => {
    if (!isPendingView) {
      setWalletConnectionError(undefined)
    }
  }, [isPendingView, setWalletConnectionError])

  const { tryActivation, retryPendingActivation } = useActivateConnector(
    useMemo(
      () => ({
        beforeActivation() {
          setWalletView('pending')
          setWalletConnectionError(undefined)
        },
        afterActivation(isHardWareWallet: boolean, connectionType: ConnectionType) {
          dispatch(updateSelectedWallet({ wallet: connectionType }))

          if (isHardWareWallet) {
            toggleAccountSelectorModal()
          }

          closeWalletModal()
          setWalletView('account')
        },
        onActivationError(error: any) {
          dispatch(updateSelectedWallet({ wallet: undefined }))
          setWalletConnectionError(
            typeof error === 'string'
              ? error
              : error.message || (typeof error === 'object' ? JSON.stringify(error) : error.toString())
          )
        },
      }),
      []
    )
  )

  return (
    <WalletModalPure
      isOpen={walletModalOpen}
      onDismiss={closeWalletModal}
      openOptions={openOptions}
      pendingError={pendingError}
      tryActivation={tryActivation}
      tryConnection={retryPendingActivation}
      view={walletView}
      account={account}
    />
  )
}
