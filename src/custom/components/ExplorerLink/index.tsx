import React from 'react'
import { ExternalLink } from 'theme'
import { useActiveWeb3React } from '@src/hooks/web3'
import { BlockExplorerLinkType, getExplorerLabel, getEtherscanLink } from 'utils'

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
  return <ExternalLink href={getEtherscanLink(chainId, id, type)}>{linkLabel}</ExternalLink>
}
