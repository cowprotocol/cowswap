import React from 'react'

import { HighFeeWarning } from 'modules/tradeWidgetAddons'
import { SellNativeWarningBanner } from 'modules/tradeWidgetAddons'

import { SwapFormState, useSwapFormState } from '../../hooks/useSwapFormState'

export function Warnings() {
  const localFormValidation = useSwapFormState()
  const isNativeSellInHooksStore = localFormValidation === SwapFormState.SellNativeInHooks

  return (
    <>
      {isNativeSellInHooksStore && <SellNativeWarningBanner />}
      <HighFeeWarning />
    </>
  )
}
