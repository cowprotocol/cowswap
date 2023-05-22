import * as styledEl from './styled'
import { ExternalLink } from 'legacy/theme'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getEtherscanLink } from 'legacy/utils'

export type Props = {
  chainId: SupportedChainId
  id: string
}

export function IdField({ id, chainId }: Props) {
  const activityUrl = getEtherscanLink(chainId, id, 'transaction')

  return (
    <styledEl.Value>
      <ExternalLink href={activityUrl || ''}>
        <span>{id.slice(0, 8)}</span>
        <span>↗</span>
      </ExternalLink>
    </styledEl.Value>
  )
}
