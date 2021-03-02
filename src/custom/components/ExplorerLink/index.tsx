import React from 'react'
import { ExternalLink } from 'theme'
import { getExplorerOrderLink } from 'utils/explorer'
import { useActiveWeb3React } from '@src/hooks'
import { BlockExplorerLinkType, getExplorerLabel } from 'utils'

interface Props {
  id: string
  type?: BlockExplorerLinkType
  label?: string
}

/**
 * Creates a link to the relevant explorer: Etherscan, GP Explorer or Blockscout
 * @param props
 */
export function ExplorerLink(props: Props) {
  const { id, label, type = 'transaction' } = props
  const { chainId } = useActiveWeb3React()
  if (!chainId) {
    return null
  }

  const linkLabel = label || getExplorerLabel(chainId, id, type)
  return <ExternalLink href={getExplorerOrderLink(chainId, id)}>{linkLabel}</ExternalLink>
}
