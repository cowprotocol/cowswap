import React from 'react'

import { HighFeeWarning, MetamaskTransactionWarning } from 'modules/tradeWidgetAddons'
import { SellNativeWarningBanner } from 'modules/tradeWidgetAddons'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { SwapFormState, useSwapFormState } from '../../hooks/useSwapFormState'

export function Warnings() {
  const { inputCurrency } = useSwapDerivedState()
  const localFormValidation = useSwapFormState()
  const isNativeSellInHooksStore = localFormValidation === SwapFormState.SellNativeInHooks

  return (
    <>
      {inputCurrency && !isNativeSellInHooksStore && <MetamaskTransactionWarning sellToken={inputCurrency} />}
      {isNativeSellInHooksStore && <SellNativeWarningBanner />}
      <HighFeeWarning />
    </>
  )
}
