import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { useTransactionAdder, useHasPendingApproval } from '@src/state/transactions/hooks'
import { calculateGasMargin } from '@src/utils/calculateGasMargin'
import { useTokenContract } from './useContract'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { useActiveWeb3React } from '@src/hooks/web3'
import { Field } from '@src/state/swap/actions'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useMemo, useCallback } from 'react'
import { GP_VAULT_RELAYER } from 'constants/index'
import TradeGp from 'state/swap/TradeGp'
import { ZERO_PERCENT } from 'constants/misc'
import { Overrides } from 'ethers'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string
): [ApprovalState, (options: Overrides) => Promise<void>] {
  const { account } = useActiveWeb3React()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(
    async (options): Promise<void> => {
      if (approvalState !== ApprovalState.NOT_APPROVED) {
        console.error('approve was called unnecessarily')
        return
      }
      if (!token) {
        console.error('no token')
        return
      }

      if (!tokenContract) {
        console.error('tokenContract is null')
        return
      }

      if (!amountToApprove) {
        console.error('missing amount to approve')
        return
      }

      if (!spender) {
        console.error('no spender')
        return
      }

      let useExact = false
      const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
        // general fallback for tokens who restrict approval amounts
        useExact = true
        return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())
      })

      return tokenContract
        .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
          ...options,
          gasLimit: calculateGasMargin(estimatedGas),
        })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Approve ' + amountToApprove.currency.symbol,
            approval: { tokenAddress: token.address, spender: spender },
          })
        })
        .catch((error: Error) => {
          console.debug('Failed to approve token', error)
          throw error
        })
    },
    [approvalState, token, tokenContract, amountToApprove, spender, addTransaction]
  )

  return [approvalState, approve]
}

// export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
export function useApproveCallbackFromTrade(trade?: TradeGp, allowedSlippage = ZERO_PERCENT) {
  const { chainId } = useActiveWeb3React()

  const amountToApprove = useMemo(() => {
    if (trade) {
      const slippageForTrade = computeSlippageAdjustedAmounts(trade, allowedSlippage)
      return slippageForTrade[Field.INPUT]
    }
    return undefined
  }, [trade, allowedSlippage])

  const vaultRelayer = chainId ? GP_VAULT_RELAYER[chainId] : undefined

  return useApproveCallback(amountToApprove, vaultRelayer)
}
