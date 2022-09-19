import { Trans } from '@lingui/macro'
import { LinkStyledButton } from 'theme'

export interface AddRecipientProps {
  onChangeRecipient(value: string | null): void
}

export function AddRecipient(props: AddRecipientProps) {
  return (
    <>
      <LinkStyledButton id="add-recipient-button" onClick={() => props.onChangeRecipient('')}>
        <Trans>+ Add a recipient (optional)</Trans>
      </LinkStyledButton>
    </>
  )
}
