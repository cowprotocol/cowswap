import { ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Link, RecipientWrapper } from '../../styles'
import { NetworkLogo } from '../NetworkLogo'

interface RecipientDisplayProps {
  recipient: string
  chainId: SupportedChainId
  logoSize?: number
  linkRelAttribute?: string
}

export function RecipientDisplay({
  recipient,
  chainId,
  logoSize = 16,
  linkRelAttribute = 'noreferrer',
}: RecipientDisplayProps) {
  return (
    <RecipientWrapper>
      <NetworkLogo chainId={chainId} size={logoSize} />
      {isAddress(recipient) ? (
        <Link
          href={getExplorerLink(chainId, recipient, ExplorerDataType.ADDRESS)}
          target="_blank"
          rel={linkRelAttribute}
        >
          {shortenAddress(recipient)} ↗
        </Link>
      ) : (
        recipient
      )}
    </RecipientWrapper>
  )
}
