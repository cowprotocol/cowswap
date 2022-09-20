import { ConfirmSwapModalSetup, ConfirmSwapModalSetupProps } from 'pages/Swap/components/ConfirmSwapModalSetup'
import EthFlowModal, { EthFlowProps } from 'components/swap/EthFlow'
import React from 'react'
import { genericPropsChecker } from 'pages/NewSwap/propsChecker'
import { ImportTokenModal } from 'pages/Swap/components/ImportTokenModal'
import CowSubsidyModal from 'components/CowSubsidyModal'
import { useCloseModals } from 'state/application/hooks'
import { useHistory } from 'react-router-dom'
import { Routes } from 'constants/routes'

export interface NewSwapModalsProps {
  chainId: number | undefined
  showNativeWrapModal: boolean
  showCowSubsidyModal: boolean
  confirmSwapProps: ConfirmSwapModalSetupProps
  ethFlowProps: EthFlowProps
}

export const NewSwapModals = React.memo(function (props: NewSwapModalsProps) {
  const { chainId, showNativeWrapModal, showCowSubsidyModal, confirmSwapProps, ethFlowProps } = props

  const closeModals = useCloseModals()
  const history = useHistory()

  console.debug('RENDER SWAP MODALS: ', props)

  return (
    <>
      {chainId && <ImportTokenModal chainId={chainId} onDismiss={() => history.push(Routes.NEW_SWAP)} />}
      <CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} />
      {<ConfirmSwapModalSetup {...confirmSwapProps} />}
      {showNativeWrapModal && <EthFlowModal {...ethFlowProps} />}
    </>
  )
}, genericPropsChecker)
