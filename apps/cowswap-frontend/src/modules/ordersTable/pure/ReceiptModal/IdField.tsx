import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ExternalLink } from 'legacy/theme'
import { getEtherscanLink } from 'legacy/utils'

import * as styledEl from './styled'

export type Props = {
  chainId: SupportedChainId
  id: string
}

export function IdField({ id, chainId }: Props) {
  const activityUrl = getEtherscanLink(chainId, 'transaction', id)

  return (
    <styledEl.Value>
      <ExternalLink href={activityUrl || ''}>
        <span>{id.slice(0, 8)}</span>
        <span>↗</span>
      </ExternalLink>
    </styledEl.Value>
  )
}
