import React from 'react'

import { getIsMetaMask, getWeb3ReactConnection, injectedConnection } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { useModalState } from './useModalState'

import { MediumAndUp, useMediaQuery } from '../../legacy/hooks/useMediaQuery'
import { ConfirmationPendingContent } from '../pure/ConfirmationPendingContent'
import { MetamaskApproveBanner } from '../pure/MetamaskApproveBanner'

function useIsMetaMaskDesktop(): boolean {
  const { connector } = useWeb3React()
  const connectionType = getWeb3ReactConnection(connector)
  const isMetaMask = getIsMetaMask()
  const isNotMobile = useMediaQuery(MediumAndUp)

  return isMetaMask && isNotMobile && connectionType === injectedConnection
}

export function usePendingApprovalModal() {
  const state = useModalState<string>()
  const { closeModal, context } = state

  const isMetaMaskDesktop = useIsMetaMaskDesktop()

  const Modal = (
    <ConfirmationPendingContent
      onDismiss={closeModal}
      title={
        <>
          Approving <strong>{context}</strong> for trading
        </>
      }
      description="Approving token"
      operationLabel="token approval"
      CustomBody={isMetaMaskDesktop ? <MetamaskApproveBanner /> : undefined}
      CustomDescription={
        isMetaMaskDesktop ? (
          <>
            Review and select the ideal <br /> spending cap in your wallet
          </>
        ) : undefined
      }
    />
  )

  return { Modal, state }
}
