import { AutoRow } from '@cowprotocol/ui'

import { ArrowDown } from 'react-feather'

import { AddressInputPanel } from 'legacy/components/AddressInputPanel'
import { ArrowWrapper } from 'legacy/components/swap/styleds'

export interface SetRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
}

export function SetRecipient(props: SetRecipientProps) {
  const { recipient, onChangeRecipient, className } = props

  return (
    <>
      <AutoRow className={className} justify="space-between" style={{ padding: '0 rem', margin: '1rem 0' }}>
        <ArrowWrapper clickable={false}>
          <ArrowDown size="16" />
        </ArrowWrapper>
      </AutoRow>
      <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
    </>
  )
}
