import { ReactElement } from 'react'

import { TargetChainId } from '@cowprotocol/cow-sdk'
import { AutoRow } from '@cowprotocol/ui'

import { ArrowDown } from 'react-feather'

import { AddressInputPanel } from 'common/pure/AddressInputPanel'

export interface SetRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
  // Target chain ID for recipient address validation. For cross-chain swaps, this should be the output token's chain.
  targetChainId?: TargetChainId
  isBridging?: boolean
  isRequired?: boolean
  isSmartContractWalletBridging?: boolean
  onNonEvmReceiverConfirmedChange?: (confirmed: boolean) => void
}

export function SetRecipient(props: SetRecipientProps): ReactElement {
  const {
    recipient,
    onChangeRecipient,
    className,
    targetChainId,
    isBridging,
    isSmartContractWalletBridging,
    onNonEvmReceiverConfirmedChange,
  } = props

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
        isBridging={isBridging}
        isSmartContractWalletBridging={isSmartContractWalletBridging}
        onNonEvmReceiverConfirmedChange={onNonEvmReceiverConfirmedChange}
      />
    </>
  )
}
