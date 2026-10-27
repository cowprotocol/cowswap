import type { SolanaQuoteCosts } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { getSolanaCostAtoms } from './getSolanaCostAtoms'

import type { ReceiveAmountInfo } from '../types'

/**
 * Restores the amounts a Solana quote had before the costs it already netted out of them.
 *
 * The API answers with the amounts the trade settles at — a sell order's `buyAmount` has the costs
 * subtracted, a buy order's `sellAmount` has them added on top — and reports those costs separately,
 * in atoms of the token they were taken from. Only the pre-cost stages move here: `afterNetworkCosts`
 * onwards, the signed amounts included, is what the quote already said.
 */
export function applySolanaQuoteCosts(info: ReceiveAmountInfo, costs?: SolanaQuoteCosts): ReceiveAmountInfo {
  if (!costs) return info

  const { isSell } = info
  const costsCurrency = isSell ? info.beforeAllFees.buyAmount.currency : info.beforeAllFees.sellAmount.currency
  const { networkFeeAtoms, accountRentAtoms, total } = getSolanaCostAtoms(costs)

  if (total === 0n) return info

  const networkFee = CurrencyAmount.fromRawAmount(costsCurrency, networkFeeAtoms)
  const accountRentFee = CurrencyAmount.fromRawAmount(costsCurrency, accountRentAtoms)

  const withCosts: ReceiveAmountInfo = {
    ...info,
    costs: {
      ...info.costs,
      networkFee: isSell
        ? { ...info.costs.networkFee, amountInBuyCurrency: networkFee }
        : { ...info.costs.networkFee, amountInSellCurrency: networkFee },
      accountRentFee,
    },
  }

  if (isSell) {
    const buyAmount = info.beforeAllFees.buyAmount.add(CurrencyAmount.fromRawAmount(costsCurrency, total))

    return {
      ...withCosts,
      beforeAllFees: { ...info.beforeAllFees, buyAmount },
      beforeNetworkCosts: { ...info.beforeNetworkCosts, buyAmount },
    }
  }

  const sellAmount = subtractAtMostAll(info.beforeAllFees.sellAmount, total)

  return {
    ...withCosts,
    beforeAllFees: { ...info.beforeAllFees, sellAmount },
    beforeNetworkCosts: { ...info.beforeNetworkCosts, sellAmount },
  }
}

/** A buy order's quoted sell amount covers the costs, but a malformed one must not take it negative. */
function subtractAtMostAll(amount: CurrencyAmount<Currency>, atoms: bigint): CurrencyAmount<Currency> {
  const rest = amount.quotient - atoms

  return CurrencyAmount.fromRawAmount(amount.currency, rest > 0n ? rest : 0n)
}
