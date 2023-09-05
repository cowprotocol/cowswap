import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useWETHContract } from '@cowswap/common-hooks'
import { useWalletInfo } from '@cowswap/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import {
  wrapUnwrapCallback,
  WrapUnwrapCallback,
  WrapUnwrapCallbackParams,
  WrapUnwrapContext,
} from 'legacy/hooks/useWrapCallback'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useTradeState } from './useTradeState'

import { wrapNativeStateAtom } from '../state/wrapNativeStateAtom'

export function useWrapNativeFlow(): WrapUnwrapCallback {
  const derivedTradeState = useDerivedTradeState()
  const wrapCallback = useWrapNativeCallback(derivedTradeState.state?.inputCurrencyAmount)

  return useCallback(
    (params?: WrapUnwrapCallbackParams) => {
      if (!wrapCallback) return Promise.resolve(null)

      return wrapCallback(params)
    },
    [wrapCallback]
  )
}

function useWrapNativeContext(amount: Nullish<CurrencyAmount<Currency>>): WrapUnwrapContext | null {
  const { chainId } = useWalletInfo()
  const wethContract = useWETHContract()
  const addTransaction = useTransactionAdder()
  const { updateState } = useTradeState()
  const setWrapNativeState = useSetAtom(wrapNativeStateAtom)

  if (!wethContract || !chainId || !amount || !updateState) {
    return null
  }

  return {
    chainId,
    wethContract,
    amount,
    addTransaction,
    updateTradeState: updateState,
    closeModals() {
      setWrapNativeState({ isOpen: false })
    },
    openTransactionConfirmationModal() {
      setWrapNativeState({ isOpen: true })
    },
  }
}

function useWrapNativeCallback(inputAmount: Nullish<CurrencyAmount<Currency>>): WrapUnwrapCallback | null {
  const context = useWrapNativeContext(inputAmount)

  if (!context) {
    return null
  }

  return (params?: WrapUnwrapCallbackParams) => {
    return wrapUnwrapCallback(context, params)
  }
}
