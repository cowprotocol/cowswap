import { AutoRow } from '@cowprotocol/ui'

import { ArrowDown } from 'react-feather'

import { getChainType } from 'common/chains/nonEvm'
import { AddressInputPanel } from 'common/pure/AddressInputPanel'

import { useRecipientRequirement } from '../../hooks/useRecipientRequirement'

export interface SetRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
  // Target chain ID for recipient address validation. For cross-chain swaps, this should be the output token's chain.
  targetChainId?: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SetRecipient(props: SetRecipientProps) {
  const { recipient, onChangeRecipient, className, targetChainId } = props
  const recipientRequirement = useRecipientRequirement()

  const destinationChainType = getChainType(targetChainId ?? recipientRequirement.destinationChainId)
  const isNonEvmDestination = destinationChainType !== 'evm'

  const placeholder =
    destinationChainType === 'bitcoin'
      ? 'Bitcoin address (bc1…, 1…, 3…)'
      : destinationChainType === 'solana'
        ? 'Solana address'
        : undefined

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
        label={isNonEvmDestination ? 'Send to wallet' : undefined}
        placeholder={placeholder}
        enableEns={!isNonEvmDestination}
        disableExplorerLink={isNonEvmDestination}
        isValid={isNonEvmDestination ? recipientRequirement.isRecipientValid : undefined}
        errorMessage={isNonEvmDestination ? recipientRequirement.recipientError : undefined}
        warningText={isNonEvmDestination ? recipientRequirement.warningText : undefined}
      />
    </>
  )
}
