import { PropsWithChildren } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ExternalLink } from 'legacy/theme'
import { getExplorerLabel, getEtherscanLink } from 'legacy/utils'
import { getExplorerBaseUrl } from 'legacy/utils/explorer'

import { useWalletInfo } from 'modules/wallet'

import { getSafeWebUrl } from 'api/gnosisSafe'

interface PropsBase extends PropsWithChildren {
  // type?: BlockExplorerLinkType
  label?: string
  className?: string
  defaultChain?: SupportedChainId
  isComposableOrder?: boolean
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
  const { chainId, account } = useWalletInfo()

  if (!account) return null

  const { isComposableOrder = false } = props
  const url = getUrl(chainId, isComposableOrder, account, props)

  if (!url) return null

  const { className } = props

  const linkContent = getContent(chainId, isComposableOrder, props)
  return (
    <ExternalLink className={className} href={url}>
      {linkContent}
    </ExternalLink>
  )
}

function getUrl(chainId: SupportedChainId, isComposableOrder: boolean, account: string, props: Props) {
  const { type } = props

  if (type === 'cow-explorer-home') {
    return getExplorerBaseUrl(chainId)
  }

  if (isComposableOrder) {
    return getSafeWebUrl(chainId, account, props.id)
  }

  // return
  return getEtherscanLink(chainId, type, props.id)
}

function getLabel(chainId: SupportedChainId, props: Props) {
  const { label, type } = props

  const id = type !== 'cow-explorer-home' ? props.id : undefined

  return label || getExplorerLabel(chainId, type, id)
}
function getContent(chainId: SupportedChainId, isComposableOrder: boolean, props: Props) {
  if (props.children) {
    return props.children
  }

  const linkLabel = isComposableOrder ? 'View on Safe' : getLabel(chainId, props)

  return (
    <>
      {linkLabel} <span style={{ fontSize: '0.8em' }}>↗</span>
    </>
  )
}
