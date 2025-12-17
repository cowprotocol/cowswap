import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'

import { formatPercent } from './amountFormat'

export function getMinimumReceivedTooltip(allowedSlippage: Percent, isExactIn: boolean): string {
  const allowedSlippagePercentage = formatPercent(allowedSlippage)

  return (
    (isExactIn ? t`Minimum tokens you'll receive.` : t`Maximum tokens you'll sell.`) +
    ' ' +
    t`This accounts for the current price and the slippage tolerance (${allowedSlippagePercentage}%). If the price moves beyond the slippage tolerance, you won't trade but also you won't pay any fees or gas.`
  )
}
