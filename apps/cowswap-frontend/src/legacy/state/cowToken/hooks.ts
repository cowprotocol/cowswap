import { useCallback, useMemo } from 'react'

import { V_COW } from '@cowprotocol/common-const'
import { useVCowContract } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'
import type { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import useSWR from 'swr'

import { setSwapVCowStatus, SwapVCowStatus } from './actions'

import { APPROVE_GAS_LIMIT_DEFAULT } from '../../hooks/useApproveCallback/useApproveCallbackMod'
import { useTransactionAdder } from '../enhancedTransactions/hooks'
import { useAppDispatch, useAppSelector } from '../hooks'
import { AppState } from '../index'
import { ConfirmOperationType } from '../types'

export type SetSwapVCowStatusCallback = (payload: SwapVCowStatus) => void

type VCowData = {
  isLoading: boolean
  total: CurrencyAmount<Currency> | undefined | null
  unvested: CurrencyAmount<Currency> | undefined | null
  vested: CurrencyAmount<Currency> | undefined | null
}

interface SwapVCowCallbackParams {
  openModal: (message: string, operationType: ConfirmOperationType) => void
  closeModal: () => void
}

/**
 * Hook that parses the result input with BigNumber value to CurrencyAmount
 */
function useParseVCowResult(result: BigNumber | undefined) {
  const { chainId } = useWalletInfo()

  const vCowToken = V_COW[chainId]

  return useMemo(() => {
    if (!vCowToken || !result) {
      return
    }

    return CurrencyAmount.fromRawAmount(vCowToken, result.toString())
  }, [result, vCowToken])
}

/**
 * Hook that fetches the needed vCow data and returns it in VCowData type
 */
export function useVCowData(): VCowData {
  const vCowContract = useVCowContract()
  const { account } = useWalletInfo()

  const { data: vestedResult, isLoading: isVestedLoading } = useSWR(
    ['useVCowData.swappableBalanceOf', account, vCowContract],
    async () => {
      if (!account || !vCowContract) return undefined

      return vCowContract.swappableBalanceOf(account)
    }
  )

  const { data: totalResult, isLoading: isTotalLoading } = useSWR(
    ['useVCowData.balanceOf', account, vCowContract],
    async () => {
      if (!account || !vCowContract) return undefined

      return vCowContract.balanceOf(account)
    }
  )

  const vested = useParseVCowResult(vestedResult)
  const total = useParseVCowResult(totalResult)

  const unvested = useMemo(() => {
    if (!total || !vested) {
      return null
    }

    // Check if total < vested, if it is something is probably wrong and we return null
    if (total.lessThan(vested)) {
      return null
    }

    return total.subtract(vested)
  }, [total, vested])

  const isLoading = isVestedLoading || isTotalLoading

  return { isLoading, vested, unvested, total }
}

/**
 * Hook used to swap vCow to Cow token
 */
export function useSwapVCowCallback({ openModal, closeModal }: SwapVCowCallbackParams) {
  const { chainId, account } = useWalletInfo()
  const vCowContract = useVCowContract()

  const addTransaction = useTransactionAdder()
  const vCowToken = chainId ? V_COW[chainId] : undefined

  const swapCallback = useCallback(async () => {
    if (!account) {
      throw new Error('Not connected')
    }
    if (!chainId) {
      throw new Error('No chainId')
    }
    if (!vCowContract) {
      throw new Error('vCOW contract not present')
    }
    if (!vCowToken) {
      throw new Error('vCOW token not present')
    }

    const estimatedGas = await vCowContract.estimateGas.swapAll({ from: account }).catch(() => {
      // general fallback for tokens who restrict approval amounts
      return vCowContract.estimateGas.swapAll().catch((error) => {
        console.log(
          '[useSwapVCowCallback] Error estimating gas for swapAll. Using default gas limit ' +
            APPROVE_GAS_LIMIT_DEFAULT.toString(),
          error
        )
        return APPROVE_GAS_LIMIT_DEFAULT
      })
    })

    const summary = `Convert vCOW to COW`
    openModal(summary, ConfirmOperationType.CONVERT_VCOW)

    return vCowContract
      .swapAll({ from: account, gasLimit: estimatedGas })
      .then((tx: TransactionResponse) => {
        addTransaction({
          swapVCow: true,
          hash: tx.hash,
          summary,
        })
      })
      .finally(closeModal)
  }, [account, addTransaction, chainId, closeModal, openModal, vCowContract, vCowToken])

  return {
    swapCallback,
  }
}

/**
 * Hook that sets the swap vCow->Cow status
 */
export function useSetSwapVCowStatus(): SetSwapVCowStatusCallback {
  const dispatch = useAppDispatch()
  return useCallback((payload: SwapVCowStatus) => dispatch(setSwapVCowStatus(payload)), [dispatch])
}

/**
 * Hook that gets swap vCow->Cow status
 */
export function useSwapVCowStatus() {
  return useAppSelector((state: AppState) => state.cowToken.swapVCowStatus)
}
