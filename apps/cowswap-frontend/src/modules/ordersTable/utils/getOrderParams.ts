import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { isEnoughAmount } from '@cowprotocol/common-utils'
import { getAddressKey, type SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Token } from '@cowprotocol/currency'

import { getRemainderAmountsWithoutSurplus } from 'legacy/state/orders/utils'

import { RateInfoParams } from 'common/pure/RateInfo'
import { getOrderPermitAmount } from 'utils/orderUtils/getOrderPermitAmount'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { PendingOrdersPermitValidityState } from '../state/permit/pendingOrdersPermitValidity.atom'

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
  order: ParsedOrder,
  pendingOrdersPermitValidityState?: PendingOrdersPermitValidityState,
): OrderParams {
  const isOrderAtLeastOnceFilled = order.executionData.filledAmount.gt(0)
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount)
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount)

  const isPermitInvalid = pendingOrdersPermitValidityState
    ? pendingOrdersPermitValidityState[order.id] === false
    : false
  const permitAmount = isPermitInvalid ? undefined : getOrderPermitAmount(chainId, order) || undefined

  const rateInfoParams: RateInfoParams = {
    chainId,
    inputCurrencyAmount: sellAmount,
    outputCurrencyAmount: buyAmount,
    activeRateFiatAmount: null,
    invertedActiveRateFiatAmount: null,
  }

  const { balances, allowances } = balancesAndAllowances
  const balance = balances[getAddressKey(order.inputToken.address)]
  const allowance = allowances?.[getAddressKey(order.inputToken.address)]

  // After the first fill, the permit is spent, so we only use the on-chain allowance from then on.
  // Before the first fill, we use the bigger of the on-chain approve allowance, or permit amount (once validated on-chain).
  const effectiveAllowance = isOrderAtLeastOnceFilled ? allowance : getBiggerAmount(allowance, permitAmount)

  const sellAmountRemaining = isOrderAtLeastOnceFilled
    ? CurrencyAmount.fromRawAmount(order.inputToken, getRemainderAmountsWithoutSurplus(order).sellAmount)
    : sellAmount

  const { hasEnoughBalance, hasEnoughAllowance } = _hasEnoughBalanceAndAllowance({
    balance,
    allowance: effectiveAllowance,
    partiallyFillable: order.partiallyFillable,
    sellAmount,
    sellAmountRemaining,
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

interface HasEnoughBalanceAndAllowanceParams {
  balance: bigint | undefined
  allowance: bigint | undefined
  partiallyFillable: boolean
  sellAmount: CurrencyAmount<Token>
  sellAmountRemaining: CurrencyAmount<Token>
}

function _hasEnoughBalanceAndAllowance({
  balance,
  allowance,
  partiallyFillable,
  sellAmount,
  sellAmountRemaining,
}: HasEnoughBalanceAndAllowanceParams): {
  hasEnoughBalance: boolean | undefined
  hasEnoughAllowance: boolean | undefined
} {
  // For partially fillable orders, we want to check there's at least `PERCENTAGE_FOR_PARTIAL_FILLS` of balance instead
  // of the full amount:
  const balanceAmount = partiallyFillable ? sellAmount.multiply(PERCENTAGE_FOR_PARTIAL_FILLS) : sellAmount
  const hasEnoughBalance = isEnoughAmount(balanceAmount, balance)

  // However, for allowance, we probably want to check if the allowance covers the full sell amount remaining:
  const hasEnoughAllowance = isEnoughAmount(sellAmountRemaining, allowance)

  // Otherwise, a fillable order with full balance available but just some dust allowance would be considered fillable,
  // and the user would falsely expect it to be fully fillable, which would not be the case.

  return { hasEnoughBalance, hasEnoughAllowance }
}

function getBiggerAmount(a: bigint | undefined, b: bigint | undefined): bigint | undefined {
  if (a === undefined) return b
  if (b === undefined) return a

  return a > b ? a : b
}
