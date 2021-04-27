import { Percent } from '@uniswap/sdk'

import { BIPS_BASE, RADIX_DECIMAL } from 'constants/index'

export function getMinimumReceivedTooltip(allowedSlippage: number, isExactIn: boolean): string {
  const slippagePercent = new Percent(allowedSlippage.toString(RADIX_DECIMAL), BIPS_BASE)

  return `${
    isExactIn ? "Minimum tokens you'll receive." : "Maximum tokens you'll sell."
  } This accounts for the current price and your chosen slippage (${slippagePercent.toSignificant(
    3
  )}%). If the price moves beyond your slippage, you won't trade but also you won't pay any fees or gas.`
}
