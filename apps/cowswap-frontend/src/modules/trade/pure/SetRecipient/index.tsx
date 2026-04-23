import { ReactElement } from 'react'

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
  isRequired?: boolean
  isSmartContractWalletWithBridging?: boolean
  onNonEvmReceiverConfirmedChange?: (confirmed: boolean) => void
}

export function SetRecipient(props: SetRecipientProps): ReactElement {
  const {
    recipient,
    onChangeRecipient,
    className,
    targetChainId,
    isRequired,
    isSmartContractWalletWithBridging,
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
        label={isRequired ? <Trans>Receiver address (required)</Trans> : undefined}
        isSmartContractWallet={isSmartContractWalletWithBridging}
        onNonEvmReceiverConfirmedChange={onNonEvmReceiverConfirmedChange}
      />
    </>
  )
}
