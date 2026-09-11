import { getEtherscanLink, shortenOrderId } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'

import * as styledEl from '../ReceiptModal.styled'

export type Props = {
  chainId: SupportedChainId
  href?: string
  id: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function IdField({ id, chainId, href }: Props) {
  const activityUrl = href ?? getEtherscanLink(chainId, 'transaction', id)

  return (
    <styledEl.Value>
      <ExternalLink href={activityUrl || ''}>{shortenOrderId(id)} ↗</ExternalLink>
    </styledEl.Value>
  )
}
