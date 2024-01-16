import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { parsedQueryString } from '@cowprotocol/common-hooks'
import { getIsNativeToken, getIsWrapOrUnwrap } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { createReducer } from '@reduxjs/toolkit'

import {
  replaceOnlyTradeRawState,
  replaceSwapState,
  selectCurrency,
  setRecipient,
  setRecipientAddress,
  switchCurrencies,
  typeInput,
} from './actions'
import { queryParametersToSwapState } from './utils'

import { Field } from '../types'

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

  // this only stores address or null, not ENS
  readonly recipientAddress: string | null
}

// Mod: added second parameter
const initialState: SwapState = queryParametersToSwapState(parsedQueryString(), '', null)

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    // Mod: renamed field => independentField, added chainId
    .addCase(replaceSwapState, (state, { payload }) => {
      const {
        chainId,
        typedValue: originalTypedValue,
        recipient,
        recipientAddress,
        independentField: originalIndependentField,
        inputCurrencyId,
        outputCurrencyId,
      } = payload

      const { independentField, typedValue } = getEthFlowOverridesOnSelect(
        inputCurrencyId,
        originalIndependentField,
        originalTypedValue,
        state
      )

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
        recipientAddress,
      }
    })
    .addCase(replaceOnlyTradeRawState, (state, { payload }) => {
      const { chainId, recipient, inputCurrencyId, outputCurrencyId, inputCurrencyAmount, outputCurrencyAmount } =
        payload

      const defaultTypedValue = state.independentField === Field.INPUT ? inputCurrencyAmount : outputCurrencyAmount

      const { independentField, typedValue } = getEthFlowOverridesOnSelect(
        inputCurrencyId,
        state.independentField,
        defaultTypedValue || state.typedValue,
        state
      )

      return {
        ...state,
        typedValue,
        independentField,
        chainId,
        [Field.INPUT]: {
          currencyId: inputCurrencyId ?? null,
        },
        [Field.OUTPUT]: {
          currencyId: outputCurrencyId ?? null,
        },
        recipient,
      }
    })
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        const { independentField, typedValue } = getEthFlowOverridesOnSwitch(state)
        return {
          ...state,
          independentField,
          typedValue,
          [field]: { currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        }
      } else {
        // the normal case
        const { independentField, typedValue } = getEthFlowOverridesOnSelect(
          state[Field.INPUT].currencyId,
          state.independentField,
          state.typedValue,
          state
        )
        return {
          ...state,
          independentField,
          typedValue,
          [field]: { currencyId },
        }
      }
    })
    .addCase(switchCurrencies, (state) => {
      const { independentField, typedValue } = getEthFlowOverridesOnSwitch(state)
      return {
        ...state,
        independentField,
        typedValue,
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
    .addCase(setRecipientAddress, (state, { payload: { recipientAddress } }) => {
      state.recipientAddress = recipientAddress
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
function getEthFlowOverridesOnSwitch(state: SwapState): Pick<SwapState, 'independentField' | 'typedValue'> {
  const chainId: ChainId = state.chainId || ChainId.MAINNET

  const inputCurrencyId = state[Field.INPUT].currencyId?.toUpperCase()
  const outputCurrencyId = state[Field.OUTPUT].currencyId?.toUpperCase()

  const isNativeOut = getIsNativeToken(chainId, outputCurrencyId || '')
  const isWrapUnwrap = getIsWrapOrUnwrap(chainId, inputCurrencyId, outputCurrencyId)
  const isWrappedIn = inputCurrencyId === WRAPPED_NATIVE_CURRENCIES[chainId].symbol?.toUpperCase()

  if (isWrapUnwrap) {
    return state
  }

  const formerIndependentField = state.independentField

  // If the sell token was Native, and it's not a wrap, and it was a SELL order
  if (isNativeOut && !isWrappedIn && formerIndependentField === Field.INPUT) {
    // It would normally become a buy order, but there are no Native buy orders!
    // Set order type to SELL and reset the input
    return { independentField: Field.INPUT, typedValue: '' }
  }
  // Otherwise (it was a buy order and will become a sell order)
  // Keep the same typed in value. Pretty much keeping the original behaviour
  return {
    independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
    typedValue: state.typedValue,
  }
}

/**
 * Calculates the independent field when replacing the swap state
 *
 * Checks if input field is ETH.
 * If so, set independent field to input.
 * Otherwise, keep it as is
 */
function getEthFlowOverridesOnSelect(
  inputCurrencyId: string | undefined | null,
  originalIndependentField: SwapState['independentField'],
  originalTypedValue: SwapState['typedValue'],
  state: SwapState
): Pick<SwapState, 'independentField' | 'typedValue'> {
  if (
    inputCurrencyId?.toUpperCase() ===
    NATIVE_CURRENCIES[(state.chainId as ChainId) || ChainId.MAINNET]?.symbol?.toUpperCase()
  ) {
    const independentField = Field.INPUT
    const formerIndependentField = state.independentField

    if (inputCurrencyId !== state[Field.INPUT].currencyId && formerIndependentField !== Field.INPUT) {
      // Only reset the typedValue if native token was not already selected and it was a SELL order
      return { independentField, typedValue: '' }
    }
    // Otherwise, keep the typedValue to avoid resetting input on every change
    return { independentField, typedValue: originalTypedValue }
  }

  return { independentField: originalIndependentField, typedValue: originalTypedValue }
}
