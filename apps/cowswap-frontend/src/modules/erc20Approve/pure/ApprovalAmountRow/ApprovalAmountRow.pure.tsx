import { ReactNode, useCallback } from 'react'

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
  children: ReactNode
}

export function ApprovalAmountRow({
  isOpen,
  onToggle,
  isPartialApproveSelected,
  amountToApprove,
  children,
}: ApprovalAmountRowProps): ReactNode {
  const handleKeyDown = useCallback(
    (e: { key: string; preventDefault: () => void }): void => {
      if (['Enter', ' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        onToggle()
      }
    },
    [onToggle],
  )

  return (
    <styledEl.Wrapper>
      <styledEl.Header type="button" onClick={onToggle} onKeyDown={handleKeyDown} aria-expanded={isOpen}>
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
      <styledEl.Details $isVisible={isOpen}>{children}</styledEl.Details>
    </styledEl.Wrapper>
  )
}
