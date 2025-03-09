import type { AppData, AppDataHash, EnrichedOrder, PriceQuality, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

/**
 * https://github.com/rndlabs/composable-cow/blob/main/src/ComposableCoW.sol
 * Information about ComposableCoW conditional orders
 *
 * id - this parameter is specified when it's a conditional (parent) order
 * parentId - this parameter is specified when it's a discrete (child) order
 */
export type ComposableCowInfo = {
  id?: string
  parentId?: string
  isVirtualPart?: boolean
  isTheLastPart?: boolean
}

export type SafeTransactionParams = {
  submissionDate: string
  executionDate: string | null
  isExecuted: boolean
  nonce: number
  confirmationsRequired: number
  confirmations: number
  safeTxHash: string
}

export interface TradeAmounts {
  readonly inputAmount: CurrencyAmount<Currency>
  readonly outputAmount: CurrencyAmount<Currency>
}

export interface FeeQuoteParams extends Pick<EnrichedOrder, 'sellToken' | 'buyToken' | 'kind'> {
  amount: string
  userAddress?: string | null
  receiver?: string | null
  validFor?: number
  fromDecimals?: number
  toDecimals?: number
  chainId: SupportedChainId
  priceQuality: PriceQuality
  isBestQuote?: boolean
  isEthFlow: boolean
  appData?: AppData
  appDataHash?: AppDataHash
}
