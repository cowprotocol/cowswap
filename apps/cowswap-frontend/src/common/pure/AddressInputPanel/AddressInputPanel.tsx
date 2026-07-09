import { ReactElement, ReactNode } from 'react'

import { TargetChainId } from '@cowprotocol/cow-sdk'

import { ReceiverPanelBody } from './ReceiverPanelBody.container'
import { ReceiverPanelHeader } from './ReceiverPanelHeader.container'
import { ReceiverPanel } from './styled'

export interface AddressInputPanelProps {
  id?: string
  className?: string
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
  className = 'recipient-address-input',
  label,
  value,
  onChange,
  targetChainId,
  placeholder,
  isBridging = false,
  isSmartContractWalletBridging,
  onNonEvmReceiverConfirmedChange,
}: AddressInputPanelProps): ReactElement {
  return (
    <ReceiverPanel id={id}>
      <ReceiverPanelHeader onChange={onChange} value={value} targetChainId={targetChainId} label={label} />
      <ReceiverPanelBody
        className={className}
        value={value}
        onChange={onChange}
        targetChainId={targetChainId}
        placeholder={placeholder}
        isBridging={isBridging}
        isSmartContractWalletBridging={isSmartContractWalletBridging}
        onNonEvmReceiverConfirmedChange={onNonEvmReceiverConfirmedChange}
      />
    </ReceiverPanel>
  )
}
