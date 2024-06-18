import { isEnoughAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'

import { BalancesAndAllowances } from 'modules/tokens'

import { RateInfoParams } from 'common/pure/RateInfo'
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
  chainId: SupportedChainId,
  balancesAndAllowances: BalancesAndAllowances,
  order: ParsedOrder
): OrderParams {
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount)
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount)

  const rateInfoParams: RateInfoParams = {
    chainId,
    inputCurrencyAmount: sellAmount,
    outputCurrencyAmount: buyAmount,
    activeRateFiatAmount: null,
    invertedActiveRateFiatAmount: null,
  }

  const { balances, allowances } = balancesAndAllowances
  const balance = balances[order.inputToken.address.toLowerCase()]
  const allowance = allowances[order.inputToken.address.toLowerCase()]

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
  balance: BigNumber | undefined
  allowance: BigNumber | undefined
  partiallyFillable: boolean
  sellAmount: CurrencyAmount<Token>
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
