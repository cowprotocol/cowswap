import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AutoRow } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ArrowDown } from 'react-feather'

import { AddressInputPanel } from 'common/pure/AddressInputPanel'

export interface SetRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
  destinationChainId?: SupportedChainId
}

export function SetRecipient(props: SetRecipientProps): ReactNode {
  const { recipient, onChangeRecipient, className, destinationChainId } = props
  const { chainId: currentChainId } = useWalletInfo()

  // For bridge transactions (different chains), disable ENS support
  const isBridgeTransaction = destinationChainId && destinationChainId !== currentChainId
  
  // ENS is only supported on Ethereum mainnet
  const effectiveChainId = destinationChainId || currentChainId
  const shouldDisableENS = isBridgeTransaction || effectiveChainId !== SupportedChainId.MAINNET

  return (
    <>
      <AutoRow className={className} justify="center">
        <ArrowDown size="16" />
      </AutoRow>
      <AddressInputPanel
        id="recipient"
        value={recipient}
        onChange={onChangeRecipient}
        destinationChainId={destinationChainId}
        showDestinationChain={Boolean(destinationChainId)}
        disableENS={shouldDisableENS}
      />
    </>
  )
}
