import { ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { NetworkLogo } from '@cowprotocol/ui'

import { Link, RecipientWrapper } from '../../styles'

interface RecipientDisplayProps {
  recipient: string
  chainId: SupportedChainId
  logoSize?: number
  linkRelAttribute?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
