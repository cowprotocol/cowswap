import React, { ReactNode } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { usePreventDoubleExecution } from '@cowprotocol/common-hooks'
import { ButtonSize, HoverTooltip, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import * as styledEl from './styled'
import { ButtonWrapper } from './styled'

import { MAX_APPROVE_AMOUNT } from '../../constants'
import { useApprovalStateForSpender, useApproveCurrency } from '../../hooks'
import { useApproveAndSwap } from '../../hooks/useApproveAndSwap'
import { LegacyApproveButton } from '../../pure/LegacyApproveButton'
import { ApprovalState } from '../../types'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: ReactNode
  isDisabled?: boolean
  enablePartialApprove?: boolean
  onApproveConfirm?: (txHash?: string) => void
  ignorePermit?: boolean
  label: string
  buttonSize?: ButtonSize
  useModals?: boolean
}

export function TradeApproveButton(props: TradeApproveButtonProps): ReactNode {
  const {
    amountToApprove,
    children,
    enablePartialApprove,
    label,
    isDisabled,
    buttonSize = ButtonSize.DEFAULT,
    useModals = true,
  } = props
  const handleApprove = useApproveCurrency(amountToApprove, useModals)

  const spender = useTradeSpenderAddress()
  const { approvalState } = useApprovalStateForSpender(amountToApprove, spender)
  const approveAndSwap = useApproveAndSwap(props)
  const approveWithPreventedDoubleExecution = usePreventDoubleExecution(approveAndSwap)

  if (!enablePartialApprove) {
    return (
      <>
        <LegacyApproveButton
          currency={amountToApprove.currency}
          state={approvalState}
          isDisabled={isDisabled}
          onClick={() => handleApprove(MAX_APPROVE_AMOUNT)}
        />
        {children}
      </>
    )
  }

  const isPending = approvalState === ApprovalState.PENDING

  return (
    <ButtonWrapper
      disabled={isPending || isDisabled}
      buttonSize={buttonSize}
      onClick={approveWithPreventedDoubleExecution}
      altDisabledStyle={isPending}
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
