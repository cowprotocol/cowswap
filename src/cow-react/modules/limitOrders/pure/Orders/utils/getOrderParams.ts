import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BalancesAndAllowances } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useOrdersBalancesAndAllowances'
import { Order } from 'state/orders/actions'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { RateInfoParams } from '@cow/common/pure/RateInfo'

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
    inversedActiveRateFiatAmount: null,
  }

  const { balances, allowances } = balancesAndAllowances
  const balance = balances[order.inputToken.address]
  const allowance = allowances[order.inputToken.address]

  const hasEnoughBalance = isEnoughAmount(sellAmount, balance)
  const hasEnoughAllowance = isEnoughAmount(sellAmount, allowance)

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
