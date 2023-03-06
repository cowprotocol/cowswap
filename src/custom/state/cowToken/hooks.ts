import { useCallback, useMemo } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/providers'

import { useVCowContract } from 'hooks/useContract'
import { useSingleCallResult, CallStateResult as Result } from 'lib/hooks/multicall'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { V_COW, COW } from 'constants/tokens'
import { AppState } from 'state'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setSwapVCowStatus, SwapVCowStatus } from './actions'
import { OperationType } from 'components/TransactionConfirmationModal'
import { APPROVE_GAS_LIMIT_DEFAULT } from 'hooks/useApproveCallback/useApproveCallbackMod'
import { useTokenBalance } from 'state/connection/hooks'
// import { useCowFromLockedGnoBalances } from 'pages/Profile/LockedGnoVesting/hooks'
import { SupportedChainId } from 'constants/chains'
import JSBI from 'jsbi'
import { supportedChainId } from 'utils/supportedChainId'
import { useWalletInfo } from '@cow/modules/wallet'

export type SetSwapVCowStatusCallback = (payload: SwapVCowStatus) => void

type VCowData = {
  isLoading: boolean
  total: CurrencyAmount<Currency> | undefined | null
  unvested: CurrencyAmount<Currency> | undefined | null
  vested: CurrencyAmount<Currency> | undefined | null
}

interface SwapVCowCallbackParams {
  openModal: (message: string, operationType: OperationType) => void
  closeModal: () => void
}

/**
 * Hook that parses the result input with BigNumber value to CurrencyAmount
 */
function useParseVCowResult(result: Result | undefined) {
  const { chainId } = useWalletInfo()

  const vCowToken = chainId ? V_COW[chainId] : undefined

  return useMemo(() => {
    if (!chainId || !vCowToken || !result) {
      return
    }

    return CurrencyAmount.fromRawAmount(vCowToken, result[0].toString())
  }, [chainId, result, vCowToken])
}

/**
 * Hook that fetches the needed vCow data and returns it in VCowData type
 */
export function useVCowData(): VCowData {
  const vCowContract = useVCowContract()
  const { account } = useWalletInfo()

  const { loading: isVestedLoading, result: vestedResult } = useSingleCallResult(vCowContract, 'swappableBalanceOf', [
    account ?? undefined,
  ])
  const { loading: isTotalLoading, result: totalResult } = useSingleCallResult(vCowContract, 'balanceOf', [
    account ?? undefined,
  ])

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
    openModal(summary, OperationType.CONVERT_VCOW)

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

/**
 * Hook that returns COW balance
 */
export function useCowBalance() {
  const { chainId, account } = useWalletInfo()
  const cowToken = chainId ? COW[chainId] : undefined
  return useTokenBalance(account || undefined, cowToken)
}

/**
 * Hook that returns combined vCOW + COW balance + vCow from locked GNO
 */
export function useCombinedBalance() {
  const { chainId, account } = useWalletInfo()
  const { total: vCowBalance } = useVCowData()
  // const { allocated, claimed } = useCowFromLockedGnoBalances()
  const cowBalance = useCowBalance()

  // const lockedGnoBalance = useMemo(() => {
  //   if (!allocated || !claimed) {
  //     return
  //   }

  //   return JSBI.subtract(allocated.quotient, claimed.quotient)
  // }, [allocated, claimed])

  return useMemo(() => {
    let tmpBalance = JSBI.BigInt(0)

    const isLoading = account && (!vCowBalance /* || !lockedGnoBalance */ || !cowBalance) ? true : false

    const cow = COW[supportedChainId(chainId) || SupportedChainId.MAINNET]

    if (account) {
      if (vCowBalance) tmpBalance = JSBI.add(tmpBalance, vCowBalance.quotient)
      // if (lockedGnoBalance) tmpBalance = JSBI.add(tmpBalance, lockedGnoBalance)
      if (cowBalance) tmpBalance = JSBI.add(tmpBalance, cowBalance.quotient)
    }

    // TODO: check COW vs vCOW
    const balance = CurrencyAmount.fromRawAmount(cow, tmpBalance)

    return { balance, isLoading }
  }, [vCowBalance, /* lockedGnoBalance, */ cowBalance, chainId, account])
}
