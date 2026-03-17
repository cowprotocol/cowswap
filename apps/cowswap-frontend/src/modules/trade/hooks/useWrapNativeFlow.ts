import { useCallback, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Nullish } from 'types'
import { usePublicClient, useWalletClient } from 'wagmi'

import {
  wrapUnwrapCallback,
  WrapUnwrapCallback,
  WrapUnwrapCallbackParams,
  WrapUnwrapContext,
} from 'legacy/hooks/useWrapCallback'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useWethContractData } from 'common/hooks/useContract'

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

function useWrapNativeContext(amount: Nullish<CurrencyAmount<Currency>>): WrapUnwrapContext | null {
  const { account } = useWalletInfo()
  const wethContract = useWethContractData()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const addTransaction = useTransactionAdder()
  const [, setWrapNativeState] = useWrapNativeScreenState()
  const analytics = useCowAnalytics()

  const wethChainId = wethContract.chainId

  return useMemo(() => {
    if (!wethContract || !amount || !account) {
      return null
    }

    return {
      chainId: wethChainId,
      account,
      wethContract,
      walletClient: walletClient ?? undefined,
      publicClient: publicClient ?? undefined,
      amount,
      addTransaction,
      analytics,
      closeModals() {
        setWrapNativeState({ isOpen: false })
      },
      openTransactionConfirmationModal() {
        setWrapNativeState({ isOpen: true })
      },
    }
  }, [
    wethChainId,
    wethContract,
    walletClient,
    publicClient,
    amount,
    addTransaction,
    setWrapNativeState,
    account,
    analytics,
  ])
}
