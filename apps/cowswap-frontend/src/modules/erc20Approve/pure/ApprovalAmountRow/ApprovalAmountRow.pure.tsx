import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { ToggleArrow } from 'common/pure/ToggleArrow'

import * as styledEl from './ApprovalAmountRow.styled'

export interface ApprovalAmountRowProps {
  isOpen: boolean
  onToggle: () => void
  isPartialApproveSelected: boolean
  amountToApprove: CurrencyAmount<Currency>
  /** Break expanded controls out of TradeRows horizontal padding (trade forms only). */
  wideDetails?: boolean
  children: ReactNode
}

export function ApprovalAmountRow({
  isOpen,
  onToggle,
  isPartialApproveSelected,
  amountToApprove,
  wideDetails = false,
  children,
}: ApprovalAmountRowProps): ReactNode {
  return (
    <styledEl.Wrapper data-approval-amount-row>
      <styledEl.Header type="button" onClick={onToggle} aria-expanded={isOpen}>
        <styledEl.Label>
          <Trans>Approval amount</Trans>
        </styledEl.Label>
        <styledEl.Value>
          {isPartialApproveSelected ? (
            <>
              <TokenAmount amount={amountToApprove} /> <TokenSymbol token={amountToApprove.currency} />
            </>
          ) : (
            <Trans>Unlimited</Trans>
          )}
          <ToggleArrow isOpen={isOpen} />
        </styledEl.Value>
      </styledEl.Header>
      {isOpen && <styledEl.Details $wide={wideDetails}>{children}</styledEl.Details>}
    </styledEl.Wrapper>
  )
}
