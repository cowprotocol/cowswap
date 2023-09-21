import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import { changeWalletAnalytics } from '@cowprotocol/analytics'
import { usePrevious } from '@cowprotocol/common-hooks'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { useWalletInfo, ConnectionType, getIsHardWareWallet, getWeb3ReactConnection } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { useModalIsOpen, useToggleWalletModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { updateConnectionError } from 'legacy/state/connection/reducer'
import { useAppDispatch, useAppSelector } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

import { WalletModal as WalletModalPure, WalletModalView } from '../../pure/WalletModal'
import { toggleAccountSelectorModalAtom } from '../AccountSelectorModal/state'

export function WalletModal() {
  const dispatch = useAppDispatch()
  const { connector } = useWeb3React()
  const { chainId, account, active: isActive } = useWalletInfo()

  const [walletView, setWalletView] = useState<WalletModalView>('account')

  const [pendingConnector, setPendingConnector] = useState<Connector | undefined>()
  const pendingError = useAppSelector((state) =>
    pendingConnector ? state.connection.errorByConnectionType[getWeb3ReactConnection(pendingConnector).type] : undefined
  )

  const walletModalOpen = useModalIsOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useToggleWalletModal()
  const toggleAccountSelectorModal = useSetAtom(toggleAccountSelectorModalAtom)

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
      const connection = getWeb3ReactConnection(connector)
      const connectionType = connection.type
      const isHardWareWallet = getIsHardWareWallet(connectionType)

      // Skips wallet connection if the connection should override the default
      // behavior, i.e. install MetaMask or launch Coinbase app
      if (connection.overrideActivate?.(chainId)) return

      changeWalletAnalytics('Todo: wallet name')

      try {
        setPendingConnector(connector)
        setWalletView('pending')
        dispatch(updateConnectionError({ connectionType, error: undefined }))

        await connector.activate(getCurrentChainIdFromUrl())

        const connection = getWeb3ReactConnection(connector)

        // Important for balances to load when connected to Gnosis-chain via WalletConnect
        if (connection.type === ConnectionType.WALLET_CONNECT) {
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

        if (isHardWareWallet) {
          toggleAccountSelectorModal()
        }
      } catch (error: any) {
        console.error(`[tryActivation] web3-react connection error`, error)
        dispatch(updateSelectedWallet({ wallet: undefined }))
        dispatch(
          updateConnectionError({
            connectionType,
            error:
              typeof error === 'string'
                ? error
                : error.message || (typeof error === 'object' ? JSON.stringify(error) : error.toString()),
          })
        )
      }
    },
    [chainId, dispatch, toggleAccountSelectorModal]
  )

  return (
    <WalletModalPure
      isOpen={walletModalOpen}
      toggleModal={toggleWalletModal}
      openOptions={openOptions}
      pendingConnector={pendingConnector}
      pendingError={pendingError}
      tryActivation={tryActivation}
      tryConnection={() => pendingConnector && tryActivation(pendingConnector)}
      view={walletView}
      account={account}
    />
  )
}
