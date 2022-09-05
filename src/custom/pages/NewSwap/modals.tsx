import { ConfirmSwapModalSetup, ConfirmSwapModalSetupProps } from 'pages/Swap/components/ConfirmSwapModalSetup'
import EthFlowModal, { EthFlowProps } from 'components/swap/EthFlow'
import React from 'react'
import { swapModalPropsChecker } from 'pages/NewSwap/propsChecker'

export interface NewSwapModalsProps {
  showNativeWrapModal: boolean
  confirmSwapProps: ConfirmSwapModalSetupProps
  ethFlowProps: EthFlowProps
}

export const NewSwapModals = React.memo(function (props: NewSwapModalsProps) {
  const { showNativeWrapModal, confirmSwapProps, ethFlowProps } = props

  console.log('RENDER SWAP MODALS: ', props)

  return (
    <>
      {<ConfirmSwapModalSetup {...confirmSwapProps} />}
      {showNativeWrapModal && <EthFlowModal {...ethFlowProps} />}
    </>
  )
}, swapModalPropsChecker)
