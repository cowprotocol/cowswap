import { useMemo } from 'react'
import { Percent, TradeType } from '@uniswap/sdk-core'

import { RowReceivedAfterSlippageContent } from 'modules/swap/pure/Row/RowReceivedAfterSlippageContent'

import { Field } from 'state/swap/actions'
import TradeGp from 'state/swap/TradeGp'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { RowWithShowHelpersProps } from 'modules/swap/pure/Row/typings'

export interface RowReceivedAfterSlippageProps extends RowWithShowHelpersProps {
  trade: TradeGp
  allowedSlippage: Percent
}

export function RowReceivedAfterSlippage({ trade, allowedSlippage, showHelpers }: RowReceivedAfterSlippageProps) {
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  const props = useMemo(
    () => ({
      showHelpers,
      trade,
      allowedSlippage,
      slippageOut: slippageAdjustedAmounts[Field.OUTPUT],
      slippageIn: slippageAdjustedAmounts[Field.INPUT],
      isExactIn: trade.tradeType === TradeType.EXACT_INPUT,
      get swapAmount() {
        return this.isExactIn ? this.slippageOut : this.slippageIn
      },
    }),
    [trade, allowedSlippage, slippageAdjustedAmounts, showHelpers]
  )

  return <RowReceivedAfterSlippageContent {...props} />
}
