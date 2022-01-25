import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount /* , Percent, TradeType */ } from '@uniswap/sdk-core'
// import { Trade as V2Trade } from '@uniswap/v2-sdk'
// import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { useCallback, useMemo } from 'react'

// import { SWAP_ROUTER_ADDRESSES, V2_ROUTER_ADDRESS } from 'constants/addresses'
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

  // TODO: Nice to have, can be deleted
  {
    process.env.NODE_ENV !== 'production' &&
      console.debug(`
    $$$$Approval metrics:
    ====
    CurrentAllowance: ${currentAllowance?.toExact()}
    raw: ${currentAllowance?.quotient.toString()}
    ====
    amountToCheckAgainstApproval: ${amountToCheckAgainstAllowance?.toExact()}
    raw: ${amountToCheckAgainstAllowance?.quotient.toString()}
    ====
    amountToApprove: ${amountToApprove?.toExact()}
    raw: ${amountToApprove?.quotient.toString()}
    ====
    Needs approval?: ${
      !amountToCheckAgainstAllowance && !amountToApprove
        ? 'Unknown - no amounts'
        : currentAllowance && amountToApprove
        ? currentAllowance.lessThan(amountToCheckAgainstAllowance || amountToApprove)
        : 'unknown no currentAllowance'
    }
  `)
  }
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
            gasLimit: calculateGasMargin(chainId, estimatedGas),
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
            gasLimit: calculateGasMargin(chainId, estimatedGas),
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

// wraps useApproveCallback in the context of a swap
// export function useApproveCallbackFromTrade(
//   openTransactionConfirmationModal: (message: string) => void,
//   closeModals: () => void,
//   trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined,
//   allowedSlippage: Percent
// ) {
//   const { chainId } = useActiveWeb3React()
//   const v3SwapRouterAddress = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined

//   const amountToApprove = useMemo(
//     () => (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined),
//     [trade, allowedSlippage]
//   )
//   return useApproveCallback(
//     openTransactionConfirmationModal,
//     closeModals,
//     amountToApprove,
//     chainId
//       ? trade instanceof V2Trade
//         ? V2_ROUTER_ADDRESS[chainId]
//         : trade instanceof V3Trade
//         ? v3SwapRouterAddress
//         : undefined
//       : undefined
//   )
// }
