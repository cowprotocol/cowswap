import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip, NetworkLogo } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { AddressLink } from 'common/pure/AddressLink'

const Row = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: right;
  gap: 3px;

  > div {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  > div:first-child {
    justify-content: flex-start;
  }

  > div:last-child {
    justify-content: flex-end;
  }
`

interface RecipientRowProps {
  chainId: SupportedChainId
  recipient: Nullish<string>
  account: Nullish<string>
  // Enhanced props for ENS and cross-chain support
  recipientEnsName?: string | null
  recipientChainId?: number
  showNetworkLogo?: boolean
}

function shouldShowRecipient(recipient: Nullish<string>, account: Nullish<string>): boolean {
  return !(!recipient || recipient.toLowerCase() === account?.toLowerCase())
}

function isValidRecipientAddress(recipient: string, recipientEnsName: string | null | undefined, recipientChainId: number | undefined, chainId: SupportedChainId): boolean {
  const isBridgeTransaction = recipientChainId && recipientChainId !== chainId
  const effectiveChainId = (recipientChainId || chainId) as SupportedChainId
  
  if (isBridgeTransaction) {
    return !!isAddress(recipient)
  }
  
  // Allow valid addresses on any chain
  if (isAddress(recipient)) {
    return true
  }
  
  // Allow ENS names only if resolved AND on Ethereum mainnet 
  if (recipientEnsName && effectiveChainId === SupportedChainId.MAINNET) {
    return true
  }
  
  return false
}

export function RecipientRow(props: RecipientRowProps): ReactNode {
  const { chainId, recipient, account, recipientEnsName, recipientChainId, showNetworkLogo = false } = props

  if (!shouldShowRecipient(recipient, account)) {
    return null
  }

  if (!recipient || !isValidRecipientAddress(recipient, recipientEnsName, recipientChainId, chainId)) {
    return null
  }

  const displayChainId = (recipientChainId || chainId) as SupportedChainId
  const displayAddress = recipientEnsName || (isAddress(recipient) ? shortenAddress(recipient) : recipient)

  return (
    <Row>
      <div>
        <span>Recipient</span>{' '}
        <InfoTooltip content="The tokens received from this order will automatically be sent to this address. No need to do a second transaction!" />
      </div>
      <div>
        {showNetworkLogo && recipientChainId && <NetworkLogo chainId={displayChainId} size={16} />}
        {recipientEnsName ? (
          <a
            href={getExplorerLink(displayChainId, recipientEnsName, ExplorerDataType.ADDRESS)}
            target="_blank"
            rel="noreferrer"
          >
            {displayAddress} ↗
          </a>
        ) : (
          <AddressLink address={recipient} chainId={displayChainId} />
        )}
      </div>
    </Row>
  )
}
