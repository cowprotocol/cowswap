import React from 'react'

import { ConfirmSwapModalSetup, ConfirmSwapModalSetupProps } from '../ConfirmSwapModalSetup'
import { EthFlowModal, EthFlowProps } from '../EthFlow'

import { genericPropsChecker } from '../../../../utils/genericPropsChecker'

import { SurplusModalSetup } from '../SurplusModalSetup'

export interface SwapModalsProps {
  showNativeWrapModal: boolean
  showCowSubsidyModal: boolean
  confirmSwapProps: ConfirmSwapModalSetupProps
  ethFlowProps: EthFlowProps
}

export const SwapModals = React.memo(function (props: SwapModalsProps) {
  const { showNativeWrapModal, confirmSwapProps, ethFlowProps } = props

  console.debug('RENDER SWAP MODALS: ', props)

  return (
    <>
      {/* TODO: Re-enable modal once subsidy is back  */}
      {/*<CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} /> */}
      {<ConfirmSwapModalSetup {...confirmSwapProps} />}
      {showNativeWrapModal && <EthFlowModal {...ethFlowProps} />}
      {!showNativeWrapModal && <SurplusModalSetup />}
    </>
  )
}, genericPropsChecker)
