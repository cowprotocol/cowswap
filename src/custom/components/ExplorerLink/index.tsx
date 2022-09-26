import { ExternalLink } from 'theme'
import { useWeb3React } from '@web3-react/core'
import { BlockExplorerLinkType, getExplorerLabel, getEtherscanLink } from 'utils'
import { supportedChainId } from 'utils/supportedChainId'

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
  const { chainId: _chainId } = useWeb3React()
  const chainId = supportedChainId(_chainId)

  if (!chainId) {
    return null
  }

  const linkLabel = label || getExplorerLabel(chainId, id, type)
  return <ExternalLink href={getEtherscanLink(chainId, id, type)}>{linkLabel}</ExternalLink>
}
