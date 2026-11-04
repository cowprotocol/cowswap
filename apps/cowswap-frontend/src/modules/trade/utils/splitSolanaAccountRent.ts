import type { SolanaQuoteCosts } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { positiveIntegerAtom } from './positiveIntegerAtom'

import type { ReceiveAmountInfo } from '../types'

/**
 * The SDK reports a Solana quote's buy token account rent inside `costs.networkFee`. It is a one-off
 * deposit rather than a network cost, so it is moved out into `accountRentFee`, in atoms of
 * `costs.token`, and the network fee keeps only the `networkFees` share in both currencies.
 *
 * In `costs.token` the network fee is taken from `costs` as is: a quote carrying `feeAmount` has it
 * converted from the sell token, which would be off by the rounding of that conversion.
 */
export function splitSolanaAccountRent(info: ReceiveAmountInfo, costs?: SolanaQuoteCosts): ReceiveAmountInfo {
  if (!costs) return info

  const networkFeeAtoms = positiveIntegerAtom(costs.networkFees) ?? 0n
  const accountRentAtoms = positiveIntegerAtom(costs.buyTokenAtaCosts) ?? 0n

  const total = networkFeeAtoms + accountRentAtoms

  if (total === 0n) return info

  const { isSell } = info
  const { networkFee } = info.costs
  const costsCurrency = isSell ? info.beforeAllFees.buyAmount.currency : info.beforeAllFees.sellAmount.currency
  const exactNetworkFee = CurrencyAmount.fromRawAmount(costsCurrency, networkFeeAtoms)

  return {
    ...info,
    costs: {
      ...info.costs,
      networkFee: {
        amountInSellCurrency: isSell
          ? shareOf(networkFee.amountInSellCurrency, networkFeeAtoms, total)
          : exactNetworkFee,
        amountInBuyCurrency: isSell ? exactNetworkFee : shareOf(networkFee.amountInBuyCurrency, networkFeeAtoms, total),
      },
      accountRentFee: accountRentAtoms > 0n ? CurrencyAmount.fromRawAmount(costsCurrency, accountRentAtoms) : undefined,
    },
  }
}

function shareOf(amount: CurrencyAmount<Currency>, part: bigint, total: bigint): CurrencyAmount<Currency> {
  return CurrencyAmount.fromRawAmount(amount.currency, (amount.quotient * part) / total)
}
