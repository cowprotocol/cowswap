import { ReactElement, ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { isNonEvmChain, TargetChainId } from '@cowprotocol/cow-sdk'
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
  isSmartContractWalletBridging?: boolean
  onNonEvmReceiverConfirmedChange?: (confirmed: boolean) => void
}

export function SetRecipient(props: SetRecipientProps): ReactElement {
  const {
    recipient,
    onChangeRecipient,
    className,
    targetChainId,
    isSmartContractWalletBridging,
    onNonEvmReceiverConfirmedChange,
  } = props

  const label = getRecipientLabel(targetChainId)

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
        label={label}
        isSmartContractWalletBridging={isSmartContractWalletBridging}
        onNonEvmReceiverConfirmedChange={onNonEvmReceiverConfirmedChange}
      />
    </>
  )
}

function getRecipientLabel(targetChainId: TargetChainId | undefined): ReactNode {
  if (targetChainId === undefined || !isNonEvmChain(targetChainId)) return undefined

  const chainLabel = getChainInfo(targetChainId)?.label

  return chainLabel ? <Trans>Send to {chainLabel} wallet</Trans> : <Trans>Recipient</Trans>
}
