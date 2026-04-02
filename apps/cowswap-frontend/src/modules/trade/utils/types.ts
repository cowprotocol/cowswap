import type { OrderParameters } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@cowprotocol/currency'

/**
 * Mirrors cow-sdk `bridgingFee`:
 * - sell = bridge input (intermediate) units
 * - buy = bridge output (destination) units
 *
 * Example 100 USDC bridge:
 *
 * - bridge input = USDC on BNB 18 decimals:
 *   - `amountInSellCurrency` = `100e18` units (~100 USDC on input side).
 *
 * - bridge output = USDC on Base 6 decimals:
 *   - `amountInBuyCurrency` = `99500000` units (~99.5 USDC on Base).
 */
export interface BridgeFeeAmounts {
  amountInSellCurrency: bigint
  amountInBuyCurrency: bigint
}

export interface CrossChainReceiveAmountInfoParams extends ReceiveAmountInfoParams {
  intermediateCurrency: Currency
  bridgeFeeAmounts: BridgeFeeAmounts
  expectedToReceiveAmount: CurrencyAmount<Currency>
}

export interface ReceiveAmountInfoParams {
  orderParams: OrderParameters
  inputCurrency: Currency
  outputCurrency: Currency
  slippagePercent: Percent
  partnerFeeBps: number | undefined
  protocolFeeBps: number | undefined
}
