import { createReducer } from '@reduxjs/toolkit'
import { parsedQueryString } from 'hooks/useParsedQueryString'

import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from 'state/swap/actions'
import { queryParametersToSwapState } from 'state/swap/hooks'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { ChainId } from 'state/lists/actions/actionsMod'

export interface SwapState {
  // Mod: added chainId
  chainId: number | null
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined | null
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined | null
  }
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
}

// Mod: added second parameter
const initialState: SwapState = queryParametersToSwapState(parsedQueryString(), '', null)

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    // Mod: ranamed field => independentField, added chainId
    .addCase(replaceSwapState, (state, { payload }) => {
      const { chainId, typedValue, recipient, independentField, inputCurrencyId, outputCurrencyId } = payload
      return {
        chainId,
        [Field.INPUT]: {
          currencyId: inputCurrencyId ?? null,
        },
        [Field.OUTPUT]: {
          currencyId: outputCurrencyId ?? null,
        },
        independentField,
        typedValue,
        recipient,
      }
    })
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        const independentField = getIndependentField(state)
        return {
          ...state,
          independentField,
          [field]: { currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId },
        }
      }
    })
    .addCase(switchCurrencies, (state) => {
      const independentField = getIndependentField(state)
      return {
        ...state,
        independentField,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
)

/**
 * Calculates the independent field when switching the tokens
 *
 * We don't support native token BUY orders
 * So if BUY currency is native and user is inverting tokens, force independentField to INPUT
 * to not end up with a BUY order
 * Special case when opposite token is wrapped native, then it's fine to invert as it's a wrap
 */
function getIndependentField(state: SwapState): Field {
  const chainId = state.chainId || ChainId.MAINNET

  const isNativeOut =
    state[Field.OUTPUT].currencyId?.toUpperCase() === NATIVE_CURRENCY_BUY_TOKEN[chainId].symbol?.toUpperCase()
  const isWrappedIn =
    state[Field.INPUT].currencyId?.toUpperCase() === WRAPPED_NATIVE_CURRENCY[chainId].symbol?.toUpperCase()

  return isNativeOut && !isWrappedIn ? Field.INPUT : state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
}
