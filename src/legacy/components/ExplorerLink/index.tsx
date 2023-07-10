import { ExternalLink } from 'legacy/theme'
import { BlockExplorerLinkType, getExplorerLabel, getEtherscanLink } from 'legacy/utils'

import { useWalletInfo } from 'modules/wallet'

interface Props {
  id: string
  type?: BlockExplorerLinkType
  label?: string
  className?: string
}

/**
 * Creates a link to the relevant explorer: Etherscan, GP Explorer or Blockscout
 * @param props
 */
export function ExplorerLink(props: Props) {
  const { id, label, type = 'transaction', className } = props
  const { chainId } = useWalletInfo()

  const linkLabel = label || getExplorerLabel(chainId, id, type)
  return (
    <ExternalLink className={className} href={getEtherscanLink(chainId, id, type)}>
      {linkLabel} <span style={{ fontSize: '0.8em' }}>↗</span>
    </ExternalLink>
  )
}
