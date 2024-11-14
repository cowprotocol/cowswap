import { percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import { useTradeSlippage, useIsSmartSlippageApplied } from 'modules/tradeSlippage'

import { SwapAmountsFromUrlUpdater } from '../../updaters/SwapAmountsFromUrlUpdater'
import { SwapDerivedStateUpdater } from '../../updaters/SwapDerivedStateUpdater'

export function SwapUpdaters({ allowSameToken }: { allowSameToken: boolean }) {
  const slippage = useTradeSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()

  return (
    <>
      <AppDataUpdater
        orderClass="market"
        slippageBips={percentToBps(slippage)}
        isSmartSlippage={isSmartSlippageApplied}
      />
      <SwapDerivedStateUpdater />
      <SwapAmountsFromUrlUpdater allowSameToken={allowSameToken} />
    </>
  )
}
