import { useCallback, useMemo } from 'react'

import { useWETHContract } from '@cowprotocol/common-hooks'
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

import { useDerivedTradeState } from './useDerivedTradeState'
import { useWrapNativeScreenState } from './useWrapNativeScreenState'

export function useWrapNativeFlow(): WrapUnwrapCallback {
  const derivedTradeState = useDerivedTradeState()

  return useWrapNativeCallback(derivedTradeState.state?.inputCurrencyAmount)
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
  }, [wethContract, chainId, amount, addTransaction, setWrapNativeState])
}

function useWrapNativeCallback(inputAmount: Nullish<CurrencyAmount<Currency>>): WrapUnwrapCallback {
  const context = useWrapNativeContext(inputAmount)

  return useCallback(
    (params?: WrapUnwrapCallbackParams) => {
      if (!context) {
        return Promise.resolve(null)
      }

      return wrapUnwrapCallback(context, params)
    },
    [context]
  )
}
