import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { getReceiveAmountInfo } from './getReceiveAmountInfo'
import { BridgeFeeAmounts, CrossChainReceiveAmountInfoParams } from './types'

import { ReceiveAmountInfo, BridgeFee } from '../types'

export function getCrossChainReceiveAmountInfo(params: CrossChainReceiveAmountInfoParams): ReceiveAmountInfo {
  const { outputCurrency, intermediateCurrency, bridgeFeeAmounts, expectedToReceiveAmount } = params

  const data = getReceiveAmountInfo(params, expectedToReceiveAmount)
  const bridgeFee = calculateBridgeFee(outputCurrency, intermediateCurrency, bridgeFeeAmounts)

  return {
    ...data,
    costs: {
      ...data.costs,
      bridgeFee,
    },
  }
}

/**
 * Maps `BridgeQuoteAmountsAndCosts.costs.bridgingFee` (cow-sdk `BridgeCosts`):
 * - `amountInSellCurrency`: bridge input-side fee in token units (same as `beforeFee.sellAmount` / intermediate)
 * - `amountInBuyCurrency`: bridge output-side fee in token units (same as `beforeFee.buyAmount` / destination)
 *
 * Example 100 USDC bridge:
 *
 * - bridge input (sell→intermediate) = USDC on BNB 18 decimals
 *   - `beforeFee.sellAmount` might be `100e18` units (~100 USDC on input side);
 *
 * - bridge output (buy→destination) = USDC on Base 6 decimals.
 *   - `beforeFee.buyAmount` might be `99500000` units (~99.5 USDC on Base).
 *
 * - Same-scale bridge fee:
 *   - `amountInSellCurrency` = `5e15` units → 0.005 on the 18-dec input token (use `intermediateCurrency`).
 *   - `amountInBuyCurrency` = `5000` units → 0.005 on the 6-dec output token (use `outputCurrency`).
 */
function calculateBridgeFee(
  outputCurrency: Currency,
  intermediateCurrency: Currency,
  bridgeFeeAmounts: BridgeFeeAmounts,
): BridgeFee {
  return {
    amountInIntermediateCurrency: CurrencyAmount.fromRawAmount(
      intermediateCurrency,
      bridgeFeeAmounts.amountInSellCurrency.toString(),
    ),
    amountInDestinationCurrency: CurrencyAmount.fromRawAmount(
      outputCurrency,
      bridgeFeeAmounts.amountInBuyCurrency.toString(),
    ),
  }
}
