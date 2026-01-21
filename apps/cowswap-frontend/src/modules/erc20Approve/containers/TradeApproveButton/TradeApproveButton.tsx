import React, { ReactNode } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { usePreventDoubleExecution } from '@cowprotocol/common-hooks'
import { ButtonSize, HoverTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useHasCachedPermit } from 'modules/permit'
import { useGetConfirmButtonLabel, useIsCurrentTradeBridging } from 'modules/trade'

import * as styledEl from './styled'
import { ButtonWrapper } from './styled'

import { MAX_APPROVE_AMOUNT } from '../../constants'
import { useApprovalStateForSpender, useApproveCurrency } from '../../hooks'
import { useApproveAndSwap } from '../../hooks/useApproveAndSwap'
import { ApprovalTooltip } from '../../pure/ApprovalTooltip'
import { LegacyApproveButton } from '../../pure/LegacyApproveButton'
import { ApprovalState } from '../../types'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  minAmountToSignForSwap?: CurrencyAmount<Currency>
  children?: ReactNode
  isDisabled?: boolean
  supportsPartialApprove?: boolean
  onApproveConfirm?: (txHash?: string) => void
  label?: string
  buttonSize?: ButtonSize
  useModals?: boolean
  clickEvent?: string
}

export function TradeApproveButton(props: TradeApproveButtonProps): ReactNode {
  const {
    amountToApprove,
    children,
    supportsPartialApprove,
    isDisabled,
    buttonSize = ButtonSize.DEFAULT,
    useModals = true,
    clickEvent,
  } = props
  const handleApprove = useApproveCurrency(amountToApprove, useModals)

  const spender = useTradeSpenderAddress()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const { approvalState } = useApprovalStateForSpender(amountToApprove, spender)
  const approveAndSwap = useApproveAndSwap(props)
  const { callback: approveWithPreventedDoubleExecution, isExecuting } = usePreventDoubleExecution(approveAndSwap)
  const { data: cachedPermit, isLoading: cachedPermitLoading } = useHasCachedPermit(amountToApprove)
  const approveLabel = useGetConfirmButtonLabel('approve', isCurrentTradeBridging)
  const swapLabel = useGetConfirmButtonLabel('swap', isCurrentTradeBridging)

  if (!supportsPartialApprove) {
    return (
      <>
        <LegacyApproveButton
          currency={amountToApprove.currency}
          state={approvalState}
          isDisabled={isDisabled}
          onClick={() => handleApprove(MAX_APPROVE_AMOUNT)}
          clickEvent={clickEvent}
        />
        {children}
      </>
    )
  }

  const isPending = isExecuting || approvalState === ApprovalState.PENDING
  const noCachedPermit = !cachedPermitLoading && !cachedPermit

  const label = props.label || (noCachedPermit ? approveLabel : swapLabel)

  return (
    <ButtonWrapper
      disabled={isPending || isDisabled}
      buttonSize={buttonSize}
      onClick={approveWithPreventedDoubleExecution}
      altDisabledStyle={isPending}
      id="approve-trade-button"
      data-click-event={clickEvent}
    >
      <styledEl.ButtonLabelWrapper buttonSize={buttonSize}>
        {label}{' '}
        {noCachedPermit ? (
          <HoverTooltip wrapInContainer content={<ApprovalTooltip currency={amountToApprove.currency} />}>
            {isPending ? <styledEl.StyledLoader /> : <styledEl.StyledAlert size={24} />}
          </HoverTooltip>
        ) : null}
      </styledEl.ButtonLabelWrapper>
    </ButtonWrapper>
  )
}
