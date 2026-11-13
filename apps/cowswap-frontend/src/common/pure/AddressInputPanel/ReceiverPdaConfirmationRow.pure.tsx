import { ReactElement } from 'react'

import { Trans } from '@lingui/react/macro'

import { ConfirmationLabel, ConfirmationRow } from './styled'

export interface ReceiverPdaConfirmationRowProps {
  confirmed: boolean
  onConfirmChange(v: boolean): void
}

const CHECKBOX_ID = 'receiver-pda-confirmation'

export function ReceiverPdaConfirmationRow({
  confirmed,
  onConfirmChange,
}: ReceiverPdaConfirmationRowProps): ReactElement {
  return (
    <ConfirmationRow $isConfirmed={confirmed}>
      <input id={CHECKBOX_ID} type="checkbox" checked={confirmed} onChange={(e) => onConfirmChange(e.target.checked)} />
      <ConfirmationLabel htmlFor={CHECKBOX_ID} $confirmed={confirmed}>
        <Trans>
          Recipient is a program address, not a wallet. Confirm the program that owns it can transfer the tokens it
          receives - otherwise they cannot be recovered.
        </Trans>
      </ConfirmationLabel>
    </ConfirmationRow>
  )
}
