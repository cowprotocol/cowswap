import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export interface ReplaceOnlyTradeRawStatePayload {
  readonly chainId: number | null
  readonly inputCurrencyId?: string
  readonly outputCurrencyId?: string
  readonly recipient: string | null
}

export interface ReplaceSwapStatePayload extends ReplaceOnlyTradeRawStatePayload {
  readonly typedValue: string
  readonly independentField: Field
}

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('swap/selectCurrency')
export const switchCurrencies = createAction<void>('swap/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('swap/typeInput')

/**
 * Replaces only a subset of the state corresponding to TradeRawState.
 */
export const replaceOnlyTradeRawState = createAction<ReplaceOnlyTradeRawStatePayload>('swap/replaceOnlyTradeRawState')
export const replaceSwapState = createAction<ReplaceSwapStatePayload>('swap/replaceSwapState')
export const setRecipient = createAction<{ recipient: string | null }>('swap/setRecipient')
