import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BalancesAndAllowances } from '@cow/modules/tokens'
import { Order } from 'state/orders/actions'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { RateInfoParams } from '@cow/common/pure/RateInfo'
import { ZERO_FRACTION } from 'constants/index'

export interface OrderParams {
  chainId: SupportedChainId | undefined
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
  rateInfoParams: RateInfoParams
  hasEnoughBalance: boolean
  hasEnoughAllowance: boolean
}

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
    hasEnoughBalance = balance === undefined || balance.greaterThan(ZERO_FRACTION)
    hasEnoughAllowance = allowance === undefined || allowance.greaterThan(ZERO_FRACTION)
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

function isEnoughAmount(
  sellAmount: CurrencyAmount<Currency>,
  targetAmount: CurrencyAmount<Currency> | undefined
): boolean {
  if (!targetAmount) return true

  if (targetAmount.equalTo(sellAmount)) return true

  return sellAmount.lessThan(targetAmount)
}
