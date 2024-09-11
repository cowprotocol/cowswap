import React from 'react'

import { AppDataUpdater } from '../../../appData'
import { useSwapSlippage } from '../../hooks/useSwapSlippage'
import { SmartSlippageUpdater } from '../../updaters/SmartSlippageUpdater'
import { SwapAmountsFromUrlUpdater } from '../../updaters/SwapAmountsFromUrlUpdater'
import { SwapDerivedStateUpdater } from '../../updaters/SwapDerivedStateUpdater'

export function SwapUpdaters() {
  const slippage = useSwapSlippage()

  return (
    <>
      <AppDataUpdater orderClass="market" slippage={slippage} />
      <SwapDerivedStateUpdater />
      <SwapAmountsFromUrlUpdater />
      <SmartSlippageUpdater />
    </>
  )
}
