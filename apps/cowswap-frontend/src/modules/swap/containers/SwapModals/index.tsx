import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'

export interface SwapModalsProps {
  showNativeWrapModal: boolean
  showCowSubsidyModal: boolean
}

export const SwapModals = React.memo(function (_props: SwapModalsProps) {
  return (
    <>
      {/* TODO: Re-enable modal once subsidy is back  */}
      {/*<CowSubsidyModal isOpen={showCowSubsidyModal} onDismiss={closeModals} /> */}
    </>
  )
}, genericPropsChecker)
