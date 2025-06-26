import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { NetworkLogo } from '@cowprotocol/ui'

import { AddressLink } from 'common/pure/AddressLink'

import { RecipientWrapper } from '../../styles'

interface RecipientDisplayProps {
  recipient: string
  chainId: SupportedChainId
  logoSize?: number
}

export function RecipientDisplay({ recipient, chainId, logoSize = 16 }: RecipientDisplayProps): ReactNode {
  return (
    <RecipientWrapper>
      <NetworkLogo chainId={chainId} size={logoSize} />
      <AddressLink address={recipient} chainId={chainId} />
    </RecipientWrapper>
  )
}
