import { AutoRow } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ArrowDown } from 'react-feather'

import {
  useShouldCheckNonEvmRecipient,
  useSmartContractRecipientConfirmed,
  useToggleSmartContractRecipientConfirmed,
} from 'modules/trade/hooks/useSmartContractRecipientConfirmed'

import { getChainType } from 'common/chains/nonEvm'
import { AddressInputPanel } from 'common/pure/AddressInputPanel'

import { useRecipientRequirement } from '../../hooks/useRecipientRequirement'
import { SmartContractReceiverWarning } from '../SmartContractReceiverWarning'

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
  const { account } = useWalletInfo()
  const shouldCheckNonEvmRecipient = useShouldCheckNonEvmRecipient()
  const smartContractRecipientConfirmed = useSmartContractRecipientConfirmed()
  const toggleSmartContractRecipientConfirmed = useToggleSmartContractRecipientConfirmed()

  const destinationChainId = targetChainId ?? recipientRequirement.destinationChainId
  const destinationChainType = getChainType(destinationChainId)
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
        placeholder={placeholder}
        enableEns={!isNonEvmDestination}
        disableExplorerLink={isNonEvmDestination}
        enableQrScan
        isValid={isNonEvmDestination ? recipientRequirement.isRecipientValid : undefined}
        errorMessage={isNonEvmDestination ? recipientRequirement.recipientError : undefined}
        warningText={isNonEvmDestination ? recipientRequirement.warningText : undefined}
        flattenBottomCorners={isNonEvmDestination && shouldCheckNonEvmRecipient}
      />
      {isNonEvmDestination && shouldCheckNonEvmRecipient && destinationChainId && (
        <SmartContractReceiverWarning
          account={account}
          recipient={recipient}
          chainId={destinationChainId}
          checked={smartContractRecipientConfirmed}
          toggle={toggleSmartContractRecipientConfirmed}
        />
      )}
    </>
  )
}
