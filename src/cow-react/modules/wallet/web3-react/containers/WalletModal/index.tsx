import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { ConnectionType } from '@cow/modules/wallet'
import { getWeb3ReactConnection } from '@cow/modules/wallet/web3-react/connection'
import { useCallback, useEffect, useState } from 'react'
import { updateConnectionError } from 'state/connection/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { updateSelectedWallet } from 'state/user/reducer'

import { useModalIsOpen, useToggleWalletModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

import { changeWalletAnalytics } from 'components/analytics'
import usePrevious from 'hooks/usePrevious'
import { WalletModal as WalletModalPure, WalletModalView } from '@cow/modules/wallet/api/pure/WalletModal'
import { walletConnectConnection } from '@cow/modules/wallet/web3-react/connection/walletConnect'

export function WalletModal() {
  const dispatch = useAppDispatch()
  const { account, isActive, connector } = useWeb3React()

  const [walletView, setWalletView] = useState<WalletModalView>('account')

  const [pendingConnector, setPendingConnector] = useState<Connector | undefined>()
  const pendingError = useAppSelector((state) =>
    pendingConnector ? state.connection.errorByConnectionType[getWeb3ReactConnection(pendingConnector).type] : undefined
  )

  const walletModalOpen = useModalIsOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useToggleWalletModal()

  const openOptions = useCallback(() => {
    setWalletView('options')
  }, [setWalletView])

  useEffect(() => {
    if (walletModalOpen) {
      setWalletView(account ? 'account' : 'options')
    }
  }, [walletModalOpen, setWalletView, account])

  useEffect(() => {
    if (pendingConnector && walletView !== 'pending') {
      updateConnectionError({ connectionType: getWeb3ReactConnection(pendingConnector).type, error: undefined })
      setPendingConnector(undefined)
    }
  }, [pendingConnector, walletView])

  const activePrevious = usePrevious(isActive)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (
      walletModalOpen &&
      ((isActive && !activePrevious) || (connector && connector !== connectorPrevious && !pendingError))
    ) {
      setWalletView('account')
      toggleWalletModal()
    }
  }, [
    setWalletView,
    isActive,
    pendingError,
    connector,
    walletModalOpen,
    activePrevious,
    connectorPrevious,
    toggleWalletModal,
  ])

  const tryActivation = useCallback(
    async (connector: Connector) => {
      const connectionType = getWeb3ReactConnection(connector).type

      changeWalletAnalytics('Todo: wallet name')

      try {
        // Fortmatic opens it's own modal on activation to log in. This modal has a tabIndex
        // collision into the WalletModal, so we special case by closing the modal.
        if (connectionType === ConnectionType.FORTMATIC) {
          toggleWalletModal()
        }

        setPendingConnector(connector)
        setWalletView('pending')
        dispatch(updateConnectionError({ connectionType, error: undefined }))

        await connector.activate()

        // Important for balances to load when connected to Gnosis-chain via WalletConnect
        if (getWeb3ReactConnection(connector) === walletConnectConnection) {
          const provider: any = connector.provider

          if (provider && provider.isWalletConnect) {
            const { http, rpc, signer } = (connector as any).provider
            const chainId = signer.connection.chainId
            // don't default to SupportedChainId.Mainnet - throw instead
            if (!chainId) throw new Error('[WalletModal::activation error: No chainId')
            http.connection.url = rpc.custom[chainId]
          }
        }

        dispatch(updateSelectedWallet({ wallet: connectionType }))
      } catch (error: any) {
        console.debug(`web3-react connection error: ${error}`)
        dispatch(updateConnectionError({ connectionType, error: error.message }))
      }
    },
    [dispatch, toggleWalletModal]
  )

  return (
    <WalletModalPure
      isOpen={walletModalOpen}
      toggleModal={toggleWalletModal}
      openOptions={openOptions}
      pendingConnector={pendingConnector}
      pendingError={pendingError}
      tryActivation={tryActivation}
      tryConnection={() => tryActivation(connector)}
      view={walletView}
    />
  )
}
