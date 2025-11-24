import { ReactNode } from 'react'

import { ButtonPrimary, ButtonSize, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import { AdvancedApprove, HelpTooltip } from './AdvancedApprove'
import * as styledEl from './styledEl'

export interface ApproveConfirmationProps {
  amountToApprove: CurrencyAmount<Currency>
  currentAllowance: bigint | undefined

  handleApprove(amount: bigint): void

  maxApprovalAmount: bigint
}

export function ApproveConfirmation({
  amountToApprove,
  handleApprove,
  maxApprovalAmount,
}: ApproveConfirmationProps): ReactNode {
  const currency = amountToApprove.currency

  const tokenSymbol = <TokenSymbol token={currency} />

  return (
    <styledEl.Wrapper>
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={() => handleApprove(maxApprovalAmount)}>
        <styledEl.ButtonWrapper>
          <span>
            <Trans>Default approve</Trans>
          </span>
          <HelpTooltip>
            <Trans>
              You must give the CoW Protocol smart contracts permission to use your {tokenSymbol}. If you approve the
              default amount, you will only have to do this once per token.
            </Trans>
          </HelpTooltip>
        </styledEl.ButtonWrapper>
      </ButtonPrimary>
      <AdvancedApprove amountToApprove={amountToApprove} handleApprove={handleApprove} />
    </styledEl.Wrapper>
  )
}
