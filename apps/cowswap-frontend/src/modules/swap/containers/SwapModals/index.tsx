import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'

import { EthFlowModal, EthFlowProps } from 'modules/swap/containers/EthFlow'

import { SurplusModalSetup } from '../SurplusModalSetup'

export interface SwapModalsProps {
  showNativeWrapModal: boolean
  showCowSubsidyModal: boolean
  ethFlowProps: EthFlowProps
}

export const SwapModals = React.memo(function (props: SwapModalsProps) {
  const { showNativeWrapModal, ethFlowProps } = props

  console.debug('RENDER SWAP MODALS: ', props)

  return (
    <>
      {/* TODO: Re-enable modal once subsidy is back  */}
      {/*<CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} /> */}
      {showNativeWrapModal && <EthFlowModal {...ethFlowProps} />}
      {!showNativeWrapModal && <SurplusModalSetup />}
    </>
  )
}, genericPropsChecker)
