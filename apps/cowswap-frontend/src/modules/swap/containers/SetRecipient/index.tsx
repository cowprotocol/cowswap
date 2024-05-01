import { AutoRow } from '@cowprotocol/ui'

import { ArrowDown } from 'react-feather'

import { AddressInputPanel } from 'legacy/components/AddressInputPanel'

export interface SetRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
}

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
