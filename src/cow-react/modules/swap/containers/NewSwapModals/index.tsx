import { ConfirmSwapModalSetup, ConfirmSwapModalSetupProps } from '@cow/modules/swap/containers/ConfirmSwapModalSetup'
import { EthFlowModal, EthFlowProps } from 'components/swap/EthFlow'
import React from 'react'
import { genericPropsChecker } from '@cow/modules/swap/containers/NewSwapWidget/propsChecker'
import { ImportTokenModal } from '@cow/modules/swap/containers/ImportTokenModal'
import CowSubsidyModal from 'components/CowSubsidyModal'
import { useCloseModals } from 'state/application/hooks'
import { useHistory } from 'react-router-dom'
import { Routes } from '@cow/constants/routes'

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
      {chainId && <ImportTokenModal chainId={chainId} onDismiss={() => history.push(Routes.SWAP)} />}
      <CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} />
      {<ConfirmSwapModalSetup {...confirmSwapProps} />}
      {showNativeWrapModal && <EthFlowModal {...ethFlowProps} />}
    </>
  )
}, genericPropsChecker)
