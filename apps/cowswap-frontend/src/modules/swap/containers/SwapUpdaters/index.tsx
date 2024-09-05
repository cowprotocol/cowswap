
import { percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from '../../../appData'
import { useSwapSlippage } from '../../hooks/useSwapSlippage'
import { SmartSlippageUpdater } from '../../updaters/SmartSlippageUpdater'
import { SwapAmountsFromUrlUpdater } from '../../updaters/SwapAmountsFromUrlUpdater'
import { SwapDerivedStateUpdater } from '../../updaters/SwapDerivedStateUpdater'

export function SwapUpdaters() {
  const slippage = useSwapSlippage()

  return (
    <>
      <AppDataUpdater orderClass="market" slippageBips={percentToBps(slippage)} />
      <SwapDerivedStateUpdater />
      <SwapAmountsFromUrlUpdater />
      <SmartSlippageUpdater />
    </>
  )
}
