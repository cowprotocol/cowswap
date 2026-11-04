import type { SolanaQuoteCosts } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { positiveIntegerAtom } from './positiveIntegerAtom'

import type { ReceiveAmountInfo } from '../types'

/**
 * The SDK reports a Solana quote's buy token account rent inside `costs.networkFee`. It is a one-off
 * deposit rather than a network cost, so it is moved out into `accountRentFee`, in atoms of
 * `costs.token`, and the network fee keeps only the `networkFees` share in both currencies.
 */
export function splitSolanaAccountRent(info: ReceiveAmountInfo, costs?: SolanaQuoteCosts): ReceiveAmountInfo {
  if (!costs) return info

  const networkFeeAtoms = positiveIntegerAtom(costs.networkFees) ?? 0n
  const accountRentAtoms = positiveIntegerAtom(costs.buyTokenAtaCosts) ?? 0n

  if (accountRentAtoms === 0n) return info

  const total = networkFeeAtoms + accountRentAtoms
  const { networkFee } = info.costs
  const costsCurrency = info.isSell ? info.beforeAllFees.buyAmount.currency : info.beforeAllFees.sellAmount.currency

  return {
    ...info,
    costs: {
      ...info.costs,
      networkFee: {
        amountInSellCurrency: shareOf(networkFee.amountInSellCurrency, networkFeeAtoms, total),
        amountInBuyCurrency: shareOf(networkFee.amountInBuyCurrency, networkFeeAtoms, total),
      },
      accountRentFee: CurrencyAmount.fromRawAmount(costsCurrency, accountRentAtoms),
    },
  }
}

function shareOf(amount: CurrencyAmount<Currency>, part: bigint, total: bigint): CurrencyAmount<Currency> {
  return CurrencyAmount.fromRawAmount(amount.currency, (amount.quotient * part) / total)
}
