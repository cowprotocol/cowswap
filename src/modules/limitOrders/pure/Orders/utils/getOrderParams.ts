import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BalancesAndAllowances } from 'modules/tokens'
import { Order } from 'legacy/state/orders/actions'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { RateInfoParams } from 'common/pure/RateInfo'
import { isEnoughAmount } from 'utils/isEnoughAmount'

export interface OrderParams {
  chainId: SupportedChainId | undefined
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
  rateInfoParams: RateInfoParams
  hasEnoughBalance: boolean
  hasEnoughAllowance: boolean
}

const PERCENTAGE_FOR_PARTIAL_FILLS = new Percent(5, 10000) // 0.05%

export function getOrderParams(
  chainId: SupportedChainId | undefined,
  balancesAndAllowances: BalancesAndAllowances,
  order: Order
): OrderParams {
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())

  const rateInfoParams: RateInfoParams = {
    chainId,
    inputCurrencyAmount: sellAmount,
    outputCurrencyAmount: buyAmount,
    activeRateFiatAmount: null,
    invertedActiveRateFiatAmount: null,
  }

  const { balances, allowances } = balancesAndAllowances
  const balance = balances[order.inputToken.address]?.value
  const allowance = allowances[order.inputToken.address]?.value

  let hasEnoughBalance, hasEnoughAllowance

  if (order.partiallyFillable) {
    // When balance or allowance are undefined (loading state), show as true
    // When loaded, check there's at least PERCENTAGE_FOR_PARTIAL_FILLS of balance/allowance to consider it as enough
    const amount = sellAmount.multiply(PERCENTAGE_FOR_PARTIAL_FILLS)
    hasEnoughBalance = balance === undefined || isEnoughAmount(amount, balance)
    hasEnoughAllowance = allowance === undefined || isEnoughAmount(amount, allowance)
  } else {
    hasEnoughBalance = isEnoughAmount(sellAmount, balance)
    hasEnoughAllowance = isEnoughAmount(sellAmount, allowance)
  }

  return {
    chainId,
    sellAmount,
    buyAmount,
    rateInfoParams,
    hasEnoughBalance,
    hasEnoughAllowance,
  }
}
