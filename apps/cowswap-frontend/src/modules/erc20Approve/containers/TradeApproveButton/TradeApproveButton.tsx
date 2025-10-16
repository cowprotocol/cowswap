import React, { ReactNode } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { usePreventDoubleExecution } from '@cowprotocol/common-hooks'
import { ButtonSize, HoverTooltip, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

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
  buttonSize?: ButtonSize
  useModals?: boolean
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
  const amountToApproveCurrency = amountToApprove.currency

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
              <TokenSymbol token={amountToApproveCurrency} />. If you approve the default amount, you will only have to
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
