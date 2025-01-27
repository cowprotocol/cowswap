import { useCallback, useMemo } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import {
  wrapUnwrapCallback,
  WrapUnwrapCallback,
  WrapUnwrapCallbackParams,
  WrapUnwrapContext,
} from 'legacy/hooks/useWrapCallback'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useWethContract } from 'common/hooks/useContract'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useWrapNativeScreenState } from './useWrapNativeScreenState'

export function useWrapNativeFlow(): WrapUnwrapCallback {
  const state = useDerivedTradeState()
  const wrapCallback = useWrapNativeCallback(state?.inputCurrencyAmount)

  return useCallback(
    (params?: WrapUnwrapCallbackParams) => {
      if (!wrapCallback) return Promise.resolve(null)

      return wrapCallback(params)
    },
    [wrapCallback],
  )
}

function useWrapNativeContext(amount: Nullish<CurrencyAmount<Currency>>): WrapUnwrapContext | null {
  const { contract: wethContract, chainId: wethChainId } = useWethContract()
  const addTransaction = useTransactionAdder()
  const [, setWrapNativeState] = useWrapNativeScreenState()

  return useMemo(() => {
    if (!wethContract || !amount) {
      return null
    }

    return {
      chainId: wethChainId,
      wethContract,
      amount,
      addTransaction,
      closeModals() {
        setWrapNativeState({ isOpen: false })
      },
      openTransactionConfirmationModal() {
        setWrapNativeState({ isOpen: true })
      },
    }
  }, [wethChainId, wethContract, amount, addTransaction, setWrapNativeState])
}

function useWrapNativeCallback(inputAmount: Nullish<CurrencyAmount<Currency>>): WrapUnwrapCallback | null {
  const context = useWrapNativeContext(inputAmount)

  return useMemo(() => {
    if (!context) {
      return null
    }

    return (params?: WrapUnwrapCallbackParams) => {
      return wrapUnwrapCallback(context, params)
    }
  }, [context])
}
