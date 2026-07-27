import { ReactNode } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { ApproveLabel, NotDelegatedLabel } from './styled'

type SplDelegationCellProps = {
  balance: CurrencyAmount<Token> | undefined
  allowance: CurrencyAmount<Token> | undefined
}

/**
 * Read-only "Actions" cell for Solana rows. Solana has no manual approve flow: the SPL delegation to the
 * CoW settlement authority is fetched read-only (persisted as an allowance), so this mirrors the EVM row's
 * labels without any action button.
 */
export function SplDelegationCell({ balance, allowance }: SplDelegationCellProps): ReactNode {
  // No delegation to the CoW settlement authority — neutral placeholder, not a green "approved" state.
  if (isFractionFalsy(allowance)) {
    return <NotDelegatedLabel>—</NotDelegatedLabel>
  }

  // Delegation covers the whole balance → surface it as fully approved, like the EVM row does.
  const fullyDelegated = !!balance && !!allowance && !balance.greaterThan(allowance)

  if (fullyDelegated) {
    return (
      <ApproveLabel>
        <Trans>Approved</Trans> ✓
      </ApproveLabel>
    )
  }

  return (
    <ApproveLabel>
      <Trans>Approved</Trans>:{' '}
      <strong>
        <TokenAmount amount={allowance} />
      </strong>
    </ApproveLabel>
  )
}
