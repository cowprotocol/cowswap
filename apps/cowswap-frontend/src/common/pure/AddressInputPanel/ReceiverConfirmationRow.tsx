import { ReactElement } from 'react'

import { Trans } from '@lingui/react/macro'

import { ConfirmationLabel, ConfirmationRow } from './styled'

interface Props {
  chainName: string
  confirmed: boolean
  onConfirmChange(v: boolean): void
}

const CHECKBOX_ID = 'non-evm-receiver-confirmation'

export function ReceiverConfirmationRow({ chainName, confirmed, onConfirmChange }: Props): ReactElement {
  return (
    <ConfirmationRow>
      <input id={CHECKBOX_ID} type="checkbox" checked={confirmed} onChange={(e) => onConfirmChange(e.target.checked)} />
      <ConfirmationLabel htmlFor={CHECKBOX_ID} $confirmed={confirmed}>
        <Trans>I confirm this {chainName} address is correct.</Trans>
      </ConfirmationLabel>
    </ConfirmationRow>
  )
}
