import { percentToBps } from '@cowprotocol/common-utils'

import { useIsSmartSlippageApplied } from 'modules/swap/hooks/useIsSmartSlippageApplied'

import { AppDataUpdater } from '../../../appData'
import { useSwapSlippage } from '../../hooks/useSwapSlippage'
import { BaseFlowContextUpdater } from '../../updaters/BaseFlowContextUpdater'
import { SmartSlippageUpdater } from '../../updaters/SmartSlippageUpdater'
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
