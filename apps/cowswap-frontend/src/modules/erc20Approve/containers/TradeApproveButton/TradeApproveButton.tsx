import React, { ReactNode } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { usePreventDoubleExecution } from '@cowprotocol/common-hooks'
import { ButtonSize, HoverTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useLingui } from '@lingui/react/macro'

import { useHasCachedPermit } from 'modules/permit'
import { useIsCurrentTradeBridging } from 'modules/trade'

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
  enablePartialApprove?: boolean
  onApproveConfirm?: (txHash?: string) => void
  label?: string
  dataClickEvent?: string
  buttonSize?: ButtonSize
  useModals?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps): ReactNode {
  const { t } = useLingui()
  const {
    amountToApprove,
    children,
    enablePartialApprove,
    isDisabled,
    dataClickEvent,
    buttonSize = ButtonSize.DEFAULT,
    useModals = true,
  } = props
  const handleApprove = useApproveCurrency(amountToApprove, useModals)

  const spender = useTradeSpenderAddress()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const { approvalState } = useApprovalStateForSpender(amountToApprove, spender)
  const approveAndSwap = useApproveAndSwap(props)
  const { callback: approveWithPreventedDoubleExecution, isExecuting } = usePreventDoubleExecution(approveAndSwap)
  const { data: cachedPermit, isLoading: cachedPermitLoading } = useHasCachedPermit(amountToApprove)

  if (!enablePartialApprove) {
    return (
      <>
        <LegacyApproveButton
          currency={amountToApprove.currency}
          state={approvalState}
          isDisabled={isDisabled}
          onClick={() => {
            if (dataClickEvent) {
              console.info('[analytics][cta][approve-legacy]', dataClickEvent)
            }

            handleApprove(MAX_APPROVE_AMOUNT)
          }}
          dataClickEvent={dataClickEvent}
        />
        {children}
      </>
    )
  }

  const isPending = isExecuting || approvalState === ApprovalState.PENDING
  const noCachedPermit = !cachedPermitLoading && !cachedPermit

  const label =
    props.label ||
    (noCachedPermit ? (isCurrentTradeBridging ? t`Approve, Swap & Bridge` : t`Approve and Swap`) : t`Swap`)

  const handleApproveClick = (): void => {
    if (dataClickEvent) {
      console.info('[analytics][cta][approve]', dataClickEvent)
    }

    approveWithPreventedDoubleExecution()
  }

  return (
    <ButtonWrapper
      disabled={isPending || isDisabled}
      buttonSize={buttonSize}
      onClick={handleApproveClick}
      altDisabledStyle={isPending}
      data-click-event={dataClickEvent}
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
