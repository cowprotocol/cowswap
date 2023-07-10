import { PropsWithChildren } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ExternalLink } from 'legacy/theme'
import { getExplorerLabel, getEtherscanLink } from 'legacy/utils'
import { getExplorerBaseUrl } from 'legacy/utils/explorer'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

interface PropsBase extends PropsWithChildren {
  // type?: BlockExplorerLinkType
  label?: string
  className?: string
  defaultChain?: SupportedChainId
}

interface PropsWithId extends PropsBase {
  type: 'transaction' | 'token' | 'address' | 'block' | 'token-transfer'
  id: string
}

interface PropsWithoutId extends PropsBase {
  type: 'cow-explorer-home'
}

export type Props = PropsWithId | PropsWithoutId

/**
 * Creates a link to the relevant explorer: Etherscan, GP Explorer or Blockscout
 * @param props
 */
export function ExplorerLink(props: Props) {
  const { chainId: _chainId } = useWalletInfo()
  const chainId = supportedChainId(_chainId) || props.defaultChain

  if (!chainId) {
    return null
  }

  const url = getUrl(chainId, props)
  const { className } = props

  const linkContent = getContent(chainId, props)
  return (
    <ExternalLink className={className} href={url}>
      {linkContent}
    </ExternalLink>
  )
}

function getUrl(chainId: SupportedChainId, props: Props) {
  const { type } = props

  if (type === 'cow-explorer-home') {
    return getExplorerBaseUrl(chainId)
  }

  // return
  return getEtherscanLink(chainId, type, props.id)
}

function getLabel(chainId: SupportedChainId, props: Props) {
  const { label, type } = props

  const id = type !== 'cow-explorer-home' ? props.id : undefined

  return label || getExplorerLabel(chainId, type, id)
}
function getContent(chainId: SupportedChainId, props: Props) {
  if (props.children) {
    return props.children
  }

  const linkLabel = getLabel(chainId, props)

  return (
    <>
      {linkLabel} <span style={{ fontSize: '0.8em' }}>↗</span>
    </>
  )
}
