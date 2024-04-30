import { OrderKind } from '@cowprotocol/cow-sdk'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'

export type AtomsAndUnits = { atoms: bigint; units: string }

export type OnTradeParamsPayload = { orderType: UiOrderType } & Partial<{
  sellToken: TokenInfo
  buyToken: TokenInfo
  sellTokenAmount: AtomsAndUnits
  buyTokenAmount: AtomsAndUnits
  sellTokenBalance: AtomsAndUnits
  buyTokenBalance: AtomsAndUnits
  sellTokenFiatAmount: string
  buyTokenFiatAmount: string
  /**
   * Sell amount including slippage and fees.
   * For sell orders, this value should be the same with inputCurrencyAmount
   */
  maximumSendSellAmount: AtomsAndUnits
  /**
   * Buy amount including slippage and fees.
   * For buy orders, this value should be the same with outputCurrencyAmount
   */
  minimumReceiveBuyAmount: AtomsAndUnits
  orderKind: OrderKind
  recipient: string
}>
