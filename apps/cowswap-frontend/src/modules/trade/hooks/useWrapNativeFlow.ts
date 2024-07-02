import { useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import {
  wrapUnwrapCallback,
  WrapUnwrapCallback,
  WrapUnwrapCallbackParams,
  WrapUnwrapContext,
} from 'legacy/hooks/useWrapCallback'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useWETHContract } from 'common/hooks/useContract'

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
    [wrapCallback]
  )
}

function useWrapNativeContext(amount: Nullish<CurrencyAmount<Currency>>): WrapUnwrapContext | null {
  const { chainId } = useWalletInfo()
  const wethContract = useWETHContract()
  const addTransaction = useTransactionAdder()
  const [, setWrapNativeState] = useWrapNativeScreenState()

  return useMemo(() => {
    if (!wethContract || !chainId || !amount) {
      return null
    }

    return {
      chainId,
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
  }, [chainId, wethContract, amount, addTransaction, setWrapNativeState])
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
