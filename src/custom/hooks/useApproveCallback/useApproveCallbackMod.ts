// import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount /* , Percent, TradeType */ } from '@uniswap/sdk-core'
// import { Trade as V2Trade } from '@uniswap/v2-sdk'
// import { Trade as V3Trade } from '@uniswap/v3-sdk'
// import useSwapApproval, { useSwapApprovalOptimizedTrade } from 'lib/hooks/swap/useSwapApproval'
// import { ApprovalState, useApproval } from 'lib/hooks/useApproval'
import { useCallback, useMemo } from 'react'

// import { TransactionType } from '../state/transactions/actions'
// import { useHasPendingApproval, useTransactionAdder } from '../state/transactions/hooks'
// export { ApprovalState } from 'lib/hooks/useApproval'

// MOD imports
import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'

import { useHasPendingApproval, useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useTokenContract } from 'hooks/useContract'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { useActiveWeb3React } from 'hooks/web3'
import { OptionalApproveCallbackParams } from '.'
import { useCurrency } from 'hooks/Tokens'
import { OperationType } from 'components/TransactionConfirmationModal'

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
export const APPROVE_GAS_LIMIT_DEFAULT = BigNumber.from('150000')

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export interface ApproveCallbackParams {
  openTransactionConfirmationModal: (message: string, operationType: OperationType) => void
  closeModals: () => void
  amountToApprove?: CurrencyAmount<Currency>
  spender?: string
  amountToCheckAgainstAllowance?: CurrencyAmount<Currency>
}

/* function useGetAndTrackApproval(getApproval: ReturnType<typeof useApproval>[1]) {
  const addTransaction = useTransactionAdder()
  return useCallback(() => {
    return getApproval().then((pending) => {
      if (pending) {
        const { response, tokenAddress, spenderAddress: spender } = pending
        addTransaction(response, { type: TransactionType.APPROVAL, tokenAddress, spender })
      }
    })
  }, [addTransaction, getApproval])
} */

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback({
  openTransactionConfirmationModal,
  closeModals,
  amountToApprove,
  spender,
  amountToCheckAgainstAllowance,
}: ApproveCallbackParams) {
  const { account, chainId } = useActiveWeb3React()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const spenderCurrency = useCurrency(spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToCheckAgainstAllowance || amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, amountToCheckAgainstAllowance, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(
    async (optionalParams?: OptionalApproveCallbackParams): Promise<void> => {
      if (approvalState !== ApprovalState.NOT_APPROVED) {
        console.error('approve was called unnecessarily')
        return
      }
      if (!chainId) {
        console.error('no chainId')
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
        return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString()).catch((error) => {
          console.log(
            '[useApproveCallbackMod] Error estimating gas for approval. Using default gas limit ' +
              APPROVE_GAS_LIMIT_DEFAULT.toString(),
            error
          )
          useExact = false
          return APPROVE_GAS_LIMIT_DEFAULT
        })
      })

      openTransactionConfirmationModal(
        optionalParams?.modalMessage || `Approving ${amountToApprove.currency.symbol} for trading`,
        OperationType.APPROVE_TOKEN
      )
      return (
        tokenContract
          .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
            gasLimit: calculateGasMargin(estimatedGas),
          })
          .then((response: TransactionResponse) => {
            addTransaction({
              hash: response.hash,
              summary: optionalParams?.transactionSummary || 'Approve ' + amountToApprove.currency.symbol,
              approval: { tokenAddress: token.address, spender },
            })
          })
          // .catch((error: Error) => {
          //   console.debug('Failed to approve token', error)
          //   throw error
          // })
          .finally(closeModals)
      )
    },
    [
      chainId,
      approvalState,
      token,
      tokenContract,
      amountToApprove,
      spender,
      addTransaction,
      openTransactionConfirmationModal,
      closeModals,
    ]
  )

  const revokeApprove = useCallback(
    async (optionalParams?: OptionalApproveCallbackParams): Promise<void> => {
      if (approvalState === ApprovalState.NOT_APPROVED) {
        console.error('Revoke approve was called unnecessarily')
        return
      }
      if (!chainId) {
        console.error('no chainId')
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

      if (!spender) {
        console.error('no spender')
        return
      }

      const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
        // general fallback for tokens who restrict approval amounts
        return tokenContract.estimateGas.approve(spender, '0').catch((error) => {
          console.log(
            '[useApproveCallbackMod] Error estimating gas for revoking approval. Using default gas limit ' +
              APPROVE_GAS_LIMIT_DEFAULT.toString(),
            error
          )
          return APPROVE_GAS_LIMIT_DEFAULT
        })
      })

      openTransactionConfirmationModal(
        optionalParams?.modalMessage || `Revoke ${token.symbol} approval from ${spenderCurrency?.symbol || spender}`,
        OperationType.REVOKE_APPROVE_TOKEN
      )
      return (
        tokenContract
          .approve(spender, '0', {
            gasLimit: calculateGasMargin(estimatedGas),
          })
          .then((response: TransactionResponse) => {
            addTransaction({
              hash: response.hash,
              summary: optionalParams?.transactionSummary || `Revoke ${token.symbol} approval from ${spender}`,
              approval: { tokenAddress: token.wrapped.address, spender },
            })
          })
          // .catch((error: Error) => {
          //   console.debug('Failed to approve token', error)
          //   throw error
          // })
          .finally(closeModals)
      )
    },
    [
      approvalState,
      chainId,
      token,
      tokenContract,
      spender,
      spenderCurrency?.symbol,
      openTransactionConfirmationModal,
      closeModals,
      addTransaction,
    ]
  )

  return { approvalState, approve, revokeApprove, isPendingApproval: pendingApproval }
}

/* export function useApprovalOptimizedTrade(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent
) {
  return useSwapApprovalOptimizedTrade(trade, allowedSlippage, useHasPendingApproval)
}

export function useApproveCallbackFromTrade(
  trade:
    | V2Trade<Currency, Currency, TradeType>
    | V3Trade<Currency, Currency, TradeType>
    | Trade<Currency, Currency, TradeType>
    | undefined,
  allowedSlippage: Percent
): [ApprovalState, () => Promise<void>] {
  const [approval, getApproval] = useSwapApproval(trade, allowedSlippage, useHasPendingApproval)
  return [approval, useGetAndTrackApproval(getApproval)]
} */
