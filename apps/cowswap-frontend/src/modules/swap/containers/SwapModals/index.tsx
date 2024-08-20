import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'

import { SurplusModalSetup } from '../SurplusModalSetup'

export interface SwapModalsProps {
  showNativeWrapModal: boolean
  showCowSubsidyModal: boolean
}

export const SwapModals = React.memo(function ({ showNativeWrapModal }: SwapModalsProps) {
  return (
    <>
      {/* TODO: Re-enable modal once subsidy is back  */}
      {/*<CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} /> */}
      {!showNativeWrapModal && <SurplusModalSetup />}
    </>
  )
}, genericPropsChecker)
