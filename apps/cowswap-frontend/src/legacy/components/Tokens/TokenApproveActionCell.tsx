import { ReactNode } from 'react'

import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { CardsSpinner } from 'pages/Account/styled'

import { TokenApproveActionState } from './getTokenApproveActionState'
import { ApproveLabel, CustomLimit, TableButton } from './styled'

type TokenApproveActionCellProps = {
  state: TokenApproveActionState
  allowance: CurrencyAmount<Token> | undefined
  onApprove: () => void
}

export function TokenApproveActionCell({ state, allowance, onApprove }: TokenApproveActionCellProps): ReactNode {
  if (state === 'pending') {
    return <CardsSpinner />
  }

  if (state === 'approved') {
    return (
      <ApproveLabel>
        <Trans>Approved</Trans> ✓
      </ApproveLabel>
    )
  }

  if (state === 'notApproved') {
    return (
      <TableButton onClick={onApprove}>
        <Trans>Approve</Trans>
      </TableButton>
    )
  }

  return (
    <CustomLimit>
      <TableButton onClick={onApprove}>
        <Trans>Approve all</Trans>
      </TableButton>
      <ApproveLabel>
        <Trans>Approved</Trans>:{' '}
        <strong>
          <TokenAmount amount={allowance} />
        </strong>
      </ApproveLabel>
    </CustomLimit>
  )
}
