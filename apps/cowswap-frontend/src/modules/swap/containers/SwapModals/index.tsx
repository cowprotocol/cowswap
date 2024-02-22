import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'

import { SurplusModalSetup } from '../SurplusModalSetup'

export interface SwapModalsProps {
  showNativeWrapModal: boolean
  showCowSubsidyModal: boolean
}

export const SwapModals = React.memo(function (props: SwapModalsProps) {
  const { showNativeWrapModal } = props

  console.debug('RENDER SWAP MODALS: ', props)

  return (
    <>
      {/* TODO: Re-enable modal once subsidy is back  */}
      {/*<CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} /> */}
      {!showNativeWrapModal && <SurplusModalSetup />}
    </>
  )
}, genericPropsChecker)
