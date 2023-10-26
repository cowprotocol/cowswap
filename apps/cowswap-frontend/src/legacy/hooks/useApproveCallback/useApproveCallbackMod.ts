import { useCallback, useMemo } from 'react'

import { useTokenContract, usePrevious } from '@cowprotocol/common-hooks'
import { calculateGasMargin, getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { useTokenBySymbolOrAddress } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'
import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTokenAllowance } from 'legacy/hooks/useTokenAllowance'
import { useHasPendingApproval, useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { ConfirmOperationType } from '../../state/types'

import { ApproveCallbackState, OptionalApproveCallbackParams } from './index'

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
export const APPROVE_GAS_LIMIT_DEFAULT = BigNumber.from('150000')

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export interface ApproveCallbackParams {
  openTransactionConfirmationModal: (message: string, operationType: ConfirmOperationType) => void
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

/**
 * returns a variable indicating the state of the approval and a function which approves if necessary or early returns
 * @deprecated use `common/hooks/useApproveCallback` + `common/hooks/useApproveState`
 */
export function useApproveCallback({
  openTransactionConfirmationModal,
  closeModals,
  amountToApprove,
  spender,
  amountToCheckAgainstAllowance,
}: ApproveCallbackParams): ApproveCallbackState {
  const { account, chainId } = useWalletInfo()
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const spenderCurrency = useTokenBySymbolOrAddress(spender)

  // check the current approval status
  const approvalStateBase: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (getIsNativeToken(amountToApprove.currency)) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToCheckAgainstAllowance || amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, amountToCheckAgainstAllowance, currentAllowance, pendingApproval, spender])

  // ApprovalState is sometimes incorrectly returned AFTER a successful approval
  const approvalState = useAuxApprovalState(approvalStateBase, currentAllowance)

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(
    async (
      optionalParams: OptionalApproveCallbackParams = { useModals: true }
    ): Promise<TransactionResponse | undefined> => {
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
        return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString()).catch((error: Error) => {
          console.log(
            '[useApproveCallbackMod] Error estimating gas for approval. Using default gas limit ' +
              APPROVE_GAS_LIMIT_DEFAULT.toString(),
            error
          )
          useExact = false
          return APPROVE_GAS_LIMIT_DEFAULT
        })
      })

      optionalParams.useModals &&
        openTransactionConfirmationModal?.(
          optionalParams?.modalMessage || `Approving ${amountToApprove.currency.symbol} for trading`,
          ConfirmOperationType.APPROVE_TOKEN
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
            return response
          })
          // .catch((error: Error) => {
          //   console.debug('Failed to approve token', error)
          //   throw error
          // })
          .finally(() => {
            optionalParams.useModals && closeModals?.()
          })
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
    async (optionalParams: OptionalApproveCallbackParams = { useModals: true }): Promise<void> => {
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

      optionalParams.useModals &&
        openTransactionConfirmationModal?.(
          optionalParams?.modalMessage || `Revoke ${token.symbol} approval from ${spenderCurrency?.symbol || spender}`,
          ConfirmOperationType.REVOKE_APPROVE_TOKEN
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
              approval: { tokenAddress: getWrappedToken(token).address, spender },
            })
          })
          // .catch((error: Error) => {
          //   console.debug('Failed to approve token', error)
          //   throw error
          // })
          .finally(() => {
            optionalParams.useModals && closeModals?.()
          })
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

/**
 *
 * ApprovalState is sometimes incorrectly returned AFTER a successful approval
 * causing incorrect UI display around the app because of incorrect pending check
 *
 * Solution: we check the prev approval state and also check if the allowance has been updated
 */
function useAuxApprovalState(approvalStateBase: ApprovalState, currentAllowance: CurrencyAmount<Currency> | undefined) {
  const previousApprovalState = usePrevious(approvalStateBase)
  const currentAllowanceString = currentAllowance?.quotient.toString()
  const previousAllowanceString = usePrevious(currentAllowanceString)
  // Has allowance actually updated?
  const allowanceHasNotChanged = previousAllowanceString === currentAllowanceString

  return useMemo(() => {
    return previousApprovalState === ApprovalState.PENDING && allowanceHasNotChanged
      ? ApprovalState.PENDING
      : approvalStateBase
  }, [previousApprovalState, allowanceHasNotChanged, approvalStateBase])
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
