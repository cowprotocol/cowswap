import React, { ReactNode } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { usePreventDoubleExecution } from '@cowprotocol/common-hooks'
import { ButtonSize, HoverTooltip, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { useTokenSupportsPermit } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { useOnApproveClick } from './hooks/useOnApproveClick'
import * as styledEl from './styled'
import { ButtonWrapper } from './styled'

import { MAX_APPROVE_AMOUNT } from '../../constants'
import { useApprovalStateForSpender, useApproveCurrency, useGeneratePermitInAdvanceToTrade } from '../../hooks'
import { LegacyApproveButton } from '../../pure/LegacyApproveButton'
import { useIsPartialApproveSelectedByUser } from '../../state'
import { ApprovalState } from '../../types'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: ReactNode
  isDisabled?: boolean
  enablePartialApprove?: boolean
  onApproveConfirm?: (txHash?: string) => void
  ignorePermit?: boolean
  label: string
  dataClickEvent?: string
  buttonSize?: ButtonSize
  useModals?: boolean
}

function renderLegacyButton({
  amountToApprove,
  approvalState,
  isDisabled,
  handleApprove,
  children,
  dataClickEvent,
}: {
  amountToApprove: CurrencyAmount<Currency>
  approvalState: ApprovalState
  isDisabled?: boolean
  handleApprove: (amount: bigint) => Promise<unknown>
  children?: ReactNode
  dataClickEvent?: string
}): ReactNode {
  return (
    <>
      <LegacyApproveButton
        currency={amountToApprove.currency}
        state={approvalState}
        isDisabled={isDisabled}
        onClick={() => handleApprove(MAX_APPROVE_AMOUNT)}
        dataClickEvent={dataClickEvent}
      />
      {children}
    </>
  )
}

function renderPartialApproveButton({
  approvalState,
  isDisabled,
  buttonSize,
  approveAndSwap,
  dataClickEvent,
  label,
  amountToApprove,
}: {
  approvalState: ApprovalState
  isDisabled?: boolean
  buttonSize: ButtonSize
  approveAndSwap: () => Promise<void>
  dataClickEvent?: string
  label: string
  amountToApprove: CurrencyAmount<Currency>
}): ReactNode {
  const isPending = approvalState === ApprovalState.PENDING

  return (
    <ButtonWrapper
      disabled={isPending || isDisabled}
      buttonSize={buttonSize}
      onClick={approveAndSwap}
      altDisabledStyle={isPending}
      data-click-event={dataClickEvent}
    >
      <styledEl.ButtonLabelWrapper buttonSize={buttonSize}>
        {label}{' '}
        <HoverTooltip
          wrapInContainer
          content={
            <Trans>
              You must give the CoW Protocol smart contracts permission to use your{' '}
              <TokenSymbol token={amountToApprove.currency} />. If you approve the default amount, you will only have to
              do this once per token.
            </Trans>
          }
        >
          {isPending ? <styledEl.StyledLoader /> : <styledEl.StyledAlert size={24} />}
        </HoverTooltip>
      </styledEl.ButtonLabelWrapper>
    </ButtonWrapper>
  )
}

export function TradeApproveButton(props: TradeApproveButtonProps): ReactNode {
  const {
    amountToApprove,
    children,
    enablePartialApprove,
    onApproveConfirm,
    label,
    ignorePermit,
    isDisabled,
    dataClickEvent,
    buttonSize = ButtonSize.DEFAULT,
    useModals = true,
  } = props
  const isPartialApproveEnabledByUser = useIsPartialApproveSelectedByUser()
  const handleApprove = useApproveCurrency(amountToApprove, useModals)

  const spender = useTradeSpenderAddress()
  const { approvalState } = useApprovalStateForSpender(amountToApprove, spender)
  const isPermitSupported = useTokenSupportsPermit(amountToApprove.currency, TradeType.SWAP) && !ignorePermit
  const generatePermitToTrade = useGeneratePermitInAdvanceToTrade(amountToApprove)

  const approveAndSwap = useOnApproveClick({
    isPermitSupported,
    onApproveConfirm,
    isPartialApproveEnabledByUser,
    amountToApprove,
    handleApprove,
    generatePermitToTrade,
  })

  const approveWithPreventedDoubleExecution = usePreventDoubleExecution(approveAndSwap)

  if (!enablePartialApprove) {
    return renderLegacyButton({
      amountToApprove,
      approvalState,
      isDisabled,
      handleApprove,
      children,
      dataClickEvent,
    })
  }

  return renderPartialApproveButton({
    approvalState,
    isDisabled,
    buttonSize,
    approveAndSwap: approveWithPreventedDoubleExecution,
    dataClickEvent,
    label,
    amountToApprove,
  })
}
