import { ReactElement, ReactNode, useCallback } from 'react'

import { TargetChainId } from '@cowprotocol/cow-sdk'

import { MAX_RECIPIENT_LENGTH } from './const'
import { ReceiverPanelBody } from './ReceiverPanelBody.container'
import { ReceiverPanelHeader } from './ReceiverPanelHeader.container'
import { ReceiverPanel } from './styled'

export interface AddressInputPanelProps {
  id?: string
  label?: ReactNode
  placeholder?: string
  value: string
  onChange: (value: string) => void
  targetChainId?: TargetChainId
  isBridging?: boolean
  isSmartContractWalletBridging?: boolean
  onNonEvmReceiverConfirmedChange?: (confirmed: boolean) => void
}

export function AddressInputPanel({
  id,
  label,
  value,
  onChange,
  targetChainId,
  placeholder,
  isBridging = false,
  isSmartContractWalletBridging,
  onNonEvmReceiverConfirmedChange,
}: AddressInputPanelProps): ReactElement {
  // Single choke point for every way `value` can change - typing (native maxLength also applies),
  // the header's Paste button (reads the clipboard directly) and QR scan both call this, so none
  // of them can push an unbounded string into state. See MAX_RECIPIENT_LENGTH for why this matters.
  const handleChange = useCallback(
    (next: string) => onChange(next.length > MAX_RECIPIENT_LENGTH ? next.slice(0, MAX_RECIPIENT_LENGTH) : next),
    [onChange],
  )

  return (
    <ReceiverPanel id={id}>
      <ReceiverPanelHeader onChange={handleChange} value={value} targetChainId={targetChainId} label={label} />
      <ReceiverPanelBody
        value={value}
        onChange={handleChange}
        targetChainId={targetChainId}
        placeholder={placeholder}
        isBridging={isBridging}
        isSmartContractWalletBridging={isSmartContractWalletBridging}
        onNonEvmReceiverConfirmedChange={onNonEvmReceiverConfirmedChange}
      />
    </ReceiverPanel>
  )
}
