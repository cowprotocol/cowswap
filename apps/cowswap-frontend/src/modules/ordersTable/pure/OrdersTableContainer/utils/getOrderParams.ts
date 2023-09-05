import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'

import { BalancesAndAllowances } from 'modules/tokens'

import { RateInfoParams } from 'common/pure/RateInfo'
import { isEnoughAmount } from 'utils/isEnoughAmount'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export interface OrderParams {
  chainId: SupportedChainId | undefined
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
  rateInfoParams: RateInfoParams
  hasEnoughBalance: boolean | undefined
  hasEnoughAllowance: boolean | undefined
}

const PERCENTAGE_FOR_PARTIAL_FILLS = new Percent(5, 10000) // 0.05%

export function getOrderParams(
  chainId: SupportedChainId | undefined,
  balancesAndAllowances: BalancesAndAllowances,
  order: ParsedOrder
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

  const { hasEnoughBalance, hasEnoughAllowance } = _hasEnoughBalanceAndAllowance({
    partiallyFillable: order.partiallyFillable,
    sellAmount,
    balance,
    allowance,
  })

  return {
    chainId,
    sellAmount,
    buyAmount,
    rateInfoParams,
    hasEnoughBalance,
    hasEnoughAllowance,
  }
}

function _hasEnoughBalanceAndAllowance(params: {
  balance: CurrencyAmount<Token> | undefined
  partiallyFillable: boolean
  sellAmount: CurrencyAmount<Token>
  allowance: CurrencyAmount<Token> | undefined
}): {
  hasEnoughBalance: boolean | undefined
  hasEnoughAllowance: boolean | undefined
} {
  const { allowance, balance, partiallyFillable, sellAmount } = params
  // Check there's at least PERCENTAGE_FOR_PARTIAL_FILLS of balance/allowance to consider it as enough
  const amount = partiallyFillable ? sellAmount.multiply(PERCENTAGE_FOR_PARTIAL_FILLS) : sellAmount
  const hasEnoughBalance = isEnoughAmount(amount, balance)
  const hasEnoughAllowance = isEnoughAmount(amount, allowance)

  return { hasEnoughBalance, hasEnoughAllowance }
}
