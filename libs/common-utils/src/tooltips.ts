import { Percent } from '@uniswap/sdk-core'

import { formatPercent } from './amountFormat'

export function getMinimumReceivedTooltip(allowedSlippage: Percent, isExactIn: boolean): string {
  return `${
    isExactIn ? "Minimum tokens you'll receive." : "Maximum tokens you'll sell."
  } This accounts for the current price and the slippage tolerance (${formatPercent(
    allowedSlippage
  )}%). If the price moves beyond the slippage tolerance, you won't trade but also you won't pay any fees or gas.`
}
