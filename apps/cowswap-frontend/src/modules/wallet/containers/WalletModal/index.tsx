import { useSetAtom } from 'jotai'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { errorToString, isMobile } from '@cowprotocol/common-utils'
import { useWalletInfo, useActivateConnector, ConnectionType } from '@cowprotocol/wallet'

import { useCloseModal, useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

import { useAccountModalState } from 'modules/account'

import { sendCoinbaseConnectionFlowEvent } from 'common/analytics/coinbaseConnectionFlow'

import { useSetWalletConnectionError } from '../../hooks/useSetWalletConnectionError'
import { useWalletConnectionError } from '../../hooks/useWalletConnectionError'
import { WalletModal as WalletModalPure, WalletModalView } from '../../pure/WalletModal'
import { toggleAccountSelectorModalAtom } from '../AccountSelectorModal/state'

interface WalletActivationContextParams {
  chainId: number | undefined
  closeWalletModal: () => void
  cowAnalytics: ReturnType<typeof useCowAnalytics>
  dispatch: ReturnType<typeof useAppDispatch>
  isWalletChangingFlow: boolean
  setWalletConnectionError: (error: string | undefined) => void
  setWalletView: Dispatch<SetStateAction<WalletModalView>>
  toggleAccountSelectorModal: () => void
}

interface WalletActivationContext {
  skipNetworkChanging: boolean
  beforeActivation(connectionType: ConnectionType): void
  afterActivation(isHardWareWallet: boolean, connectionType: ConnectionType): void
  onActivationError(error: unknown, connectionType: ConnectionType): void
}

function emitCoinbaseConnectionEvent(
  cowAnalytics: ReturnType<typeof useCowAnalytics>,
  chainId: number | undefined,
  stage: 'connectStart' | 'connectSuccess' | 'connectError',
  result: 'started' | 'success' | 'error',
  error?: unknown,
): void {
  sendCoinbaseConnectionFlowEvent(cowAnalytics, {
    stage,
    result,
    source: 'walletModal',
    chainId,
    isMobile,
    isCoinbaseWallet: true,
    error,
  })
}

function useWalletActivationContext({
  chainId,
  closeWalletModal,
  cowAnalytics,
  dispatch,
  isWalletChangingFlow,
  setWalletConnectionError,
  setWalletView,
  toggleAccountSelectorModal,
}: WalletActivationContextParams): WalletActivationContext {
  return useMemo(
    () => ({
      skipNetworkChanging: isWalletChangingFlow,
      beforeActivation(connectionType: ConnectionType) {
        setWalletView('pending')
        setWalletConnectionError(undefined)

        if (connectionType === ConnectionType.COINBASE_WALLET) {
          emitCoinbaseConnectionEvent(cowAnalytics, chainId, 'connectStart', 'started')
        }
      },
      afterActivation(isHardWareWallet: boolean, connectionType: ConnectionType) {
        if (connectionType === ConnectionType.COINBASE_WALLET) {
          emitCoinbaseConnectionEvent(cowAnalytics, chainId, 'connectSuccess', 'success')
        }

        dispatch(updateSelectedWallet({ wallet: connectionType }))

        if (isHardWareWallet) {
          toggleAccountSelectorModal()
        }

        closeWalletModal()
        setWalletView('account')
      },
      onActivationError(error: unknown, connectionType: ConnectionType) {
        if (connectionType === ConnectionType.COINBASE_WALLET) {
          emitCoinbaseConnectionEvent(cowAnalytics, chainId, 'connectError', 'error', error)
        }

        dispatch(updateSelectedWallet({ wallet: undefined }))
        setWalletConnectionError(errorToString(error))
      },
    }),
    [
      isWalletChangingFlow,
      setWalletView,
      setWalletConnectionError,
      cowAnalytics,
      chainId,
      dispatch,
      toggleAccountSelectorModal,
      closeWalletModal,
    ],
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WalletModal() {
  const dispatch = useAppDispatch()
  const cowAnalytics = useCowAnalytics()
  const { account, chainId } = useWalletInfo()
  const setWalletConnectionError = useSetWalletConnectionError()
  const pendingError = useWalletConnectionError()

  const [walletView, setWalletView] = useState<WalletModalView>('options')
  const isPendingView = walletView === 'pending'
  const walletModalOpen = useModalIsOpen(ApplicationModal.WALLET)
  const closeWalletModal = useCloseModal(ApplicationModal.WALLET)
  const toggleAccountSelectorModal = useSetAtom(toggleAccountSelectorModalAtom)

  const openOptions = useCallback(() => setWalletView('options'), [setWalletView])
  const { isOpen: isAccountModalOpen } = useAccountModalState()
  const isWalletChangingFlow = isAccountModalOpen

  useEffect(() => {
    if (walletModalOpen) {
      setWalletView(account ? 'account' : 'options')
    }
  }, [walletModalOpen, account])

  useEffect(() => {
    if (!isPendingView) {
      setWalletConnectionError(undefined)
    }
  }, [isPendingView, setWalletConnectionError])

  const activationContext = useWalletActivationContext({
    chainId,
    closeWalletModal,
    cowAnalytics,
    dispatch,
    isWalletChangingFlow,
    setWalletConnectionError,
    setWalletView,
    toggleAccountSelectorModal,
  })

  const { tryActivation, retryPendingActivation } = useActivateConnector(activationContext)

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
