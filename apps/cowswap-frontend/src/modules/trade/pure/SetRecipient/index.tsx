import { AutoRow } from '@cowprotocol/ui'

import { ArrowDown } from 'react-feather'

import { AddressInputPanel } from 'common/pure/AddressInputPanel'

export interface SetRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SetRecipient(props: SetRecipientProps) {
  const { recipient, onChangeRecipient, className } = props

  return (
    <>
      <AutoRow className={className} justify="center">
        <ArrowDown size="16" />
      </AutoRow>
      <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
    </>
  )
}
