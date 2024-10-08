import { percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import { SmartSlippageUpdater, useSwapSlippage, useIsSmartSlippageApplied } from 'modules/tradeSlippage'

import { BaseFlowContextUpdater } from '../../updaters/BaseFlowContextUpdater'
import { SwapAmountsFromUrlUpdater } from '../../updaters/SwapAmountsFromUrlUpdater'
import { SwapDerivedStateUpdater } from '../../updaters/SwapDerivedStateUpdater'

export function SwapUpdaters() {
  const slippage = useSwapSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()

  return (
    <>
      <AppDataUpdater
        orderClass="market"
        slippageBips={percentToBps(slippage)}
        isSmartSlippage={isSmartSlippageApplied}
      />
      <SwapDerivedStateUpdater />
      <SwapAmountsFromUrlUpdater />
      <SmartSlippageUpdater />
      <BaseFlowContextUpdater />
    </>
  )
}
