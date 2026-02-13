import { useCallback, useMemo } from 'react'

import { V_COW } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useLingui } from '@lingui/react/macro'
import { encodeFunctionData } from 'viem'
import { useConfig, useReadContract } from 'wagmi'
import { estimateGas, writeContract } from 'wagmi/actions'

import { GAS_LIMIT_DEFAULT } from 'common/constants/common'
import { useVCowContractData } from 'common/hooks/useContract'

import { setSwapVCowStatus, SwapVCowStatus } from './actions'

import { useTransactionAdder } from '../enhancedTransactions/hooks'
import { useAppDispatch, useAppSelector } from '../hooks'
import { AppState } from '../index'

export type SetSwapVCowStatusCallback = (payload: SwapVCowStatus) => void

type VCowData = {
  isLoading: boolean
  total: CurrencyAmount<Currency> | undefined | null
  unvested: CurrencyAmount<Currency> | undefined | null
  vested: CurrencyAmount<Currency> | undefined | null
}

interface SwapVCowCallbackParams {
  openModal: (message: string) => void
  closeModal: Command
}

/**
 * Hook that parses the result input with bigint value to CurrencyAmount
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useParseVCowResult(result: bigint | undefined) {
  const { chainId } = useWalletInfo()

  const vCowToken = V_COW[chainId]

  return useMemo(() => {
    if (!vCowToken || !result) {
      return
    }

    return CurrencyAmount.fromRawAmount(vCowToken, `0x${result.toString(16)}`)
  }, [result, vCowToken])
}

/**
 * Hook that fetches the needed vCow data and returns it in VCowData type
 */
export function useVCowData(): VCowData {
  const vCowContract = useVCowContractData()
  const { account } = useWalletInfo()

  const { data: vestedResult, isLoading: isVestedLoading } = useReadContract({
    abi: vCowContract.abi,
    address: vCowContract.address!,
    functionName: 'swappableBalanceOf',
    args: [account!],
    query: { enabled: !!vCowContract.address && !!account },
  })
  const { data: totalResult, isLoading: isTotalLoading } = useReadContract({
    abi: vCowContract.abi,
    address: vCowContract.address!,
    functionName: 'balanceOf',
    args: [account!],
    query: { enabled: !!vCowContract.address && !!account },
  })

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

  return useMemo(() => ({ isLoading, vested, unvested, total }), [isLoading, vested, unvested, total])
}

/**
 * Hook used to swap vCow to Cow token
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSwapVCowCallback({ openModal, closeModal }: SwapVCowCallbackParams) {
  const config = useConfig()
  const { account } = useWalletInfo()
  const { chainId, ...vCowContract } = useVCowContractData()
  const { t } = useLingui()

  const addTransaction = useTransactionAdder()
  const vCowToken = chainId ? V_COW[chainId] : undefined

  return useCallback(async () => {
    if (!account) {
      throw new Error(t`Not connected`)
    }
    if (!chainId) {
      throw new Error(t`No chainId`)
    }
    if (!vCowContract.address) {
      throw new Error(t`vCOW contract not present`)
    }
    if (!vCowToken) {
      throw new Error(t`vCOW token not present`)
    }

    const estimatedGas = await estimateGas(config, {
      to: vCowContract.address,
      account,
      data: encodeFunctionData({ abi: vCowContract.abi, functionName: 'swapAll' }),
    }).catch(() => {
      // general fallback for tokens who restrict approval amounts
      return estimateGas(config, {
        to: vCowContract.address,
        data: encodeFunctionData({ abi: vCowContract.abi, functionName: 'swapAll' }),
      }).catch((error) => {
        console.log(
          '[useSwapVCowCallback] Error estimating gas for swapAll. Using default gas limit ' +
            GAS_LIMIT_DEFAULT.toString(),
          error,
        )
        return GAS_LIMIT_DEFAULT
      })
    })

    const summary = `Convert vCOW to COW`
    openModal(summary)

    return writeContract(config, {
      abi: vCowContract.abi,
      address: vCowContract.address,
      functionName: 'swapAll',
      gas: estimatedGas,
    })
      .then((hash) => {
        addTransaction({
          swapVCow: true,
          hash,
          summary,
        })
      })
      .finally(closeModal)
  }, [account, config, addTransaction, chainId, closeModal, openModal, t, vCowContract, vCowToken])
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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSwapVCowStatus() {
  return useAppSelector((state: AppState) => state.cowToken.swapVCowStatus)
}
