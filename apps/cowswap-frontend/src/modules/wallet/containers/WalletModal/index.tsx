import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { errorToString } from '@cowprotocol/common-utils'
import { useWalletInfo, useActivateConnector, ConnectionType } from '@cowprotocol/wallet'

import { useCloseModal, useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

import { useAccountModalState } from 'modules/account'

import { useSetWalletConnectionError } from '../../hooks/useSetWalletConnectionError'
import { useWalletConnectionError } from '../../hooks/useWalletConnectionError'
import { WalletModal as WalletModalPure, WalletModalView } from '../../pure/WalletModal'
import { toggleAccountSelectorModalAtom } from '../AccountSelectorModal/state'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
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

  const { isOpen: isAccountModalOpen } = useAccountModalState()
  // Wallet changing currently is only possible through the account modal
  const isWalletChangingFlow = isAccountModalOpen

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
        skipNetworkChanging: isWalletChangingFlow,
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
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onActivationError(error: any) {
          dispatch(updateSelectedWallet({ wallet: undefined }))
          setWalletConnectionError(errorToString(error))
        },
      }),
      [isWalletChangingFlow, closeWalletModal, dispatch, setWalletConnectionError, toggleAccountSelectorModal]
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
