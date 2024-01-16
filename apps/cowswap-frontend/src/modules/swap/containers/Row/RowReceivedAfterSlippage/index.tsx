import { useMemo } from 'react'

import { Percent, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'
import { Field } from 'legacy/state/types'
import { computeSlippageAdjustedAmounts } from 'legacy/utils/prices'

import { RowReceivedAfterSlippageContent } from 'modules/swap/pure/Row/RowReceivedAfterSlippageContent'
import { RowWithShowHelpersProps } from 'modules/swap/pure/Row/typings'

export interface RowReceivedAfterSlippageProps extends RowWithShowHelpersProps {
  trade: TradeGp
  allowedSlippage: Percent
  withoutFee?: boolean
}

export function RowReceivedAfterSlippage({
  trade,
  allowedSlippage,
  showHelpers,
  withoutFee,
}: RowReceivedAfterSlippageProps) {
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage, withoutFee)

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
