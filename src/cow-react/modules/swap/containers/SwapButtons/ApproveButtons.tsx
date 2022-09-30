import { useCallback, useEffect } from 'react'

import { BigNumber } from '@ethersproject/bignumber'
import { Currency, Percent } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/providers'

import { ApprovalState, OptionalApproveCallbackParams } from 'hooks/useApproveCallback'
import { UseERC20PermitState } from 'hooks/useERC20Permit'
import { useERC20PermitFromTrade } from 'hooks/useERC20Permit'
import { HandleSwapCallback } from 'cow-react/modules/swap/hooks/useHandleSwap'
import { useSwapConfirmManager } from 'cow-react/modules/swap/hooks/useSwapConfirmManager'
import { ApproveButton } from 'cow-react/modules/swap/pure/ApproveButton'
import { SwapButton } from 'cow-react/modules/swap/pure/SwapButton'
import usePrevious from 'hooks/usePrevious'

import { getProviderErrorMessage, isRejectRequestProviderError } from 'utils/misc'
import { approvalAnalytics } from 'components/analytics'
import TradeGp from 'state/swap/TradeGp'

export interface ApproveButtonsProps {
  currencyIn: Currency | undefined | null
  trade: TradeGp | undefined
  allowedSlippage: Percent
  transactionDeadline: BigNumber | undefined
  isExpertMode: boolean
  handleSwap: HandleSwapCallback
  isValid: boolean
  approvalState: ApprovalState
  approveCallback: (params?: OptionalApproveCallbackParams) => Promise<TransactionResponse | undefined>
  approvalSubmitted: boolean
  setApprovalSubmitted: (state: boolean) => void
  children?: React.ReactNode
}

// TODO: should be refactored (need to separate context/logic/view)
export function ApproveButtons(props: ApproveButtonsProps) {
  const {
    trade,
    allowedSlippage,
    transactionDeadline,
    currencyIn,
    isExpertMode,
    handleSwap,
    isValid,
    approvalState,
    approveCallback,
    approvalSubmitted,
    setApprovalSubmitted,
    children,
  } = props

  const { state: signatureState, gatherPermitSignature } = useERC20PermitFromTrade(
    trade,
    allowedSlippage,
    transactionDeadline
  )

  const prevApprovalState = usePrevious(approvalState)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
      // mod
    } else if (prevApprovalState === ApprovalState.PENDING && approvalState === ApprovalState.NOT_APPROVED) {
      // user canceled the approval tx, reset the UI
      setApprovalSubmitted(false)
    }
  }, [approvalState, approvalSubmitted, prevApprovalState, setApprovalSubmitted])

  const { setSwapError, openSwapConfirmModal } = useSwapConfirmManager()

  const handleApprove = useCallback(async () => {
    let approveRequired = false // mod
    if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
      try {
        await gatherPermitSignature()
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (!isRejectRequestProviderError(error)) {
          approveRequired = true
        }
      }
    } else {
      approveRequired = true
    }

    if (approveRequired) {
      const symbol = trade?.inputAmount?.currency.symbol
      approvalAnalytics('Send', symbol)
      return approveCallback()
        .then(() => {
          approvalAnalytics('Sign', symbol)
        })
        .catch((error) => {
          console.error('Error setting the allowance for token', error)

          let swapErrorMessage, errorCode
          if (isRejectRequestProviderError(error)) {
            swapErrorMessage = 'User rejected approving the token'
            approvalAnalytics('Reject', symbol)
          } else {
            swapErrorMessage = getProviderErrorMessage(error)

            if (error?.code && typeof error.code === 'number') {
              errorCode = error.code
            }

            approvalAnalytics('Error', symbol, errorCode)
          }

          setSwapError(swapErrorMessage)
        })
    }
  }, [approveCallback, gatherPermitSignature, signatureState, trade?.inputAmount?.currency.symbol, setSwapError])

  const isApproved = approvalState === ApprovalState.APPROVED
  const hasPermittableTokenSignature = signatureState === UseERC20PermitState.SIGNED
  const isConfirmed = isApproved || hasPermittableTokenSignature

  const isPending = approvalState === ApprovalState.PENDING
  const recentlyApproved = (approvalSubmitted && isApproved) || hasPermittableTokenSignature
  const onSwapButtonClick = useCallback(() => {
    if (isExpertMode) {
      handleSwap()
    } else {
      trade && openSwapConfirmModal(trade)
    }
  }, [isExpertMode, handleSwap, trade, openSwapConfirmModal])

  return (
    <>
      <ApproveButton
        currency={currencyIn}
        onClick={handleApprove}
        disabled={approvalState !== ApprovalState.NOT_APPROVED || approvalSubmitted || hasPermittableTokenSignature}
        isPending={isPending}
        isConfirmed={isConfirmed}
        isRecentlyApproved={recentlyApproved}
      />

      <SwapButton disabled={!isValid || !isConfirmed} onClick={onSwapButtonClick}>
        {children}
      </SwapButton>
    </>
  )
}
