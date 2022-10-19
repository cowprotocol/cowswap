import { useContext, useMemo } from 'react'
import { Percent, TradeType } from '@uniswap/sdk-core'
import { ThemeContext } from 'styled-components/macro'

import { RowReceivedAfterSlippageContent } from '@cow/modules/swap/pure/Row/RowReceivedAfterSlippageContent'
import { RowCommonProps } from '@cow/modules/swap/pure/Row/typings'

import { Field } from 'state/swap/actions'
import { formatMax } from 'utils/format'
import TradeGp from 'state/swap/TradeGp'
import { computeSlippageAdjustedAmounts } from 'utils/prices'

export interface RowReceivedAfterSlippageProps extends RowCommonProps {
  trade: TradeGp
  allowedSlippage: Percent
}

export function RowReceivedAfterSlippage({
  fontSize = 13,
  fontWeight = 500,
  showHelpers = true,
  rowHeight,
  trade,
  allowedSlippage,
}: Omit<RowReceivedAfterSlippageProps, 'theme'>) {
  const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  const props = useMemo(
    () => ({
      trade,
      allowedSlippage,
      slippageOut: slippageAdjustedAmounts[Field.OUTPUT],
      slippageIn: slippageAdjustedAmounts[Field.INPUT],
      isExactIn: trade.tradeType === TradeType.EXACT_INPUT,
      fontSize,
      fontWeight,
      rowHeight,
      showHelpers,
      get swapAmount() {
        return this.isExactIn ? this.slippageOut : this.slippageIn
      },
      get symbol() {
        return this.isExactIn ? trade.outputAmount.currency.symbol : trade.inputAmount.currency.symbol
      },
      get fullOutAmount() {
        return formatMax(this.swapAmount, this.swapAmount?.currency.decimals) || '-'
      },
    }),
    [trade, allowedSlippage, fontSize, fontWeight, rowHeight, showHelpers, slippageAdjustedAmounts]
  )

  return <RowReceivedAfterSlippageContent {...props} theme={theme} />
}
