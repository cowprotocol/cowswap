import { TargetChainId } from '@cowprotocol/cow-sdk'
import { AutoRow } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { ArrowDown } from 'react-feather'

import { AddressInputPanel } from 'common/pure/AddressInputPanel'

export interface SetRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
  // Target chain ID for recipient address validation. For cross-chain swaps, this should be the output token's chain.
  targetChainId?: TargetChainId
  isMandatory?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SetRecipient(props: SetRecipientProps) {
  const { recipient, onChangeRecipient, className, targetChainId, isMandatory } = props

  return (
    <>
      <AutoRow className={className} justify="center">
        <ArrowDown size="16" />
      </AutoRow>
      <AddressInputPanel
        id="recipient"
        value={recipient}
        onChange={onChangeRecipient}
        targetChainId={targetChainId}
        label={isMandatory ? <Trans>Receiver address (required)</Trans> : undefined}
      />
    </>
  )
}
