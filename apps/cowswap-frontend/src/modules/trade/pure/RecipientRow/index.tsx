import { ReactNode } from 'react'

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

export interface RecipientRowProps {
  chainId: SupportedChainId
  recipient: Nullish<string>
  recipientEnsName?: string | null
  recipientChainId?: number
  showNetworkLogo?: boolean
}

function resolveDisplayChainId(
  recipientChainId: number | undefined,
  currentChainId: SupportedChainId,
): SupportedChainId {
  if (recipientChainId && Object.values(SupportedChainId).includes(recipientChainId as SupportedChainId)) {
    return recipientChainId as SupportedChainId
  }
  return currentChainId
}

export function RecipientRow(props: RecipientRowProps): ReactNode {
  const { chainId, recipient, recipientEnsName, recipientChainId, showNetworkLogo = false } = props

  if (!recipient) {
    return null
  }

  const displayChainId = resolveDisplayChainId(recipientChainId, chainId)

  return (
    <Row>
      <div>
        <span>Recipient</span>{' '}
        <InfoTooltip content="The tokens received from this order will automatically be sent to this address. No need to do a second transaction!" />
      </div>
      <div>
        {showNetworkLogo && recipientChainId && <NetworkLogo chainId={displayChainId} size={16} />}
        <AddressLink address={recipient} chainId={displayChainId} ensName={recipientEnsName} />
      </div>
    </Row>
  )
}
