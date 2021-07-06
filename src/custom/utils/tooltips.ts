import { Percent } from '@uniswap/sdk-core'

export function getMinimumReceivedTooltip(allowedSlippage: Percent, isExactIn: boolean): string {
  const slippagePercent = allowedSlippage

  return `${
    isExactIn ? "Minimum tokens you'll receive." : "Maximum tokens you'll sell."
  } This accounts for the current price and your chosen slippage (${slippagePercent.toSignificant(
    3
  )}%). If the price moves beyond your slippage, you won't trade but also you won't pay any fees or gas.`
}
