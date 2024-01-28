import React from 'react'

import { getIsMetaMask, getWeb3ReactConnection, injectedConnection } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { useModalState } from './useModalState'

import { MediumAndUp, useMediaQuery } from '../../legacy/hooks/useMediaQuery'
import { PendingTransactionModal } from '../containers/PendingTransactionModal'
import {
  PENDING_TX_DESCRIPTIONS,
  PENDING_TX_NAMES,
  PENDING_TX_TITLES,
} from '../containers/PendingTransactionModal/const'
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
    <PendingTransactionModal
      title={PENDING_TX_TITLES.APPROVE(context || '')}
      description={PENDING_TX_DESCRIPTIONS.APPROVE}
      operationName={PENDING_TX_NAMES.APPROVE}
      onDismiss={closeModal}
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
