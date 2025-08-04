import { ReactNode, useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AutoRow } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ArrowDown } from 'react-feather'

import { AddressInputPanel } from 'common/pure/AddressInputPanel'
import { isDangerousRecipient } from 'common/utils/recipientValidation'

export interface SetRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
  sellTokenAddress?: string
  buyTokenAddress?: string
  destinationChainId?: SupportedChainId
}

export function SetRecipient(props: SetRecipientProps): ReactNode {
  const { recipient, onChangeRecipient, className, sellTokenAddress, buyTokenAddress, destinationChainId } = props
  const { chainId } = useWalletInfo()

  const customValidation = useCallback(
    (address: string) => {
      return isDangerousRecipient(address, sellTokenAddress, buyTokenAddress)
    },
    [sellTokenAddress, buyTokenAddress],
  )

  return (
    <>
      <AutoRow className={className} justify="center">
        <ArrowDown size="16" />
      </AutoRow>
      <AddressInputPanel
        id="recipient"
        value={recipient}
        onChange={onChangeRecipient}
        customValidation={customValidation}
        currentChainId={chainId}
        destinationChainId={destinationChainId}
      />
    </>
  )
}
