import { PropsWithChildren } from 'react'

import { getExplorerLabel, getEtherscanLink } from '@cowprotocol/common-utils'
import { getSafeWebUrl } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

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

interface PropsComposableOrder extends PropsBase {
  type: 'composable-order'
  id: string
}

export type Props = PropsWithId | PropsComposableOrder

/**
 * Creates a link to the relevant explorer: Etherscan, GP Explorer or Blockscout
 * @param props
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ExplorerLink(props: Props) {
  const { chainId, account } = useWalletInfo()

  if (!account) return null

  const url = getUrl(chainId, account, props)

  if (!url) return null

  const { className } = props

  const linkContent = getContent(chainId, props)
  return (
    <ExternalLink className={className} href={url}>
      {linkContent}
    </ExternalLink>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getUrl(chainId: SupportedChainId, account: string, props: Props) {
  const { type } = props

  if (type === 'composable-order') {
    return getSafeWebUrl(chainId, account, props.id)
  }

  // return
  return getEtherscanLink(chainId, type, props.id)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getLabel(chainId: SupportedChainId, props: Props) {
  const { label, type } = props

  return label || getExplorerLabel(chainId, type, props.id)
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getContent(chainId: SupportedChainId, props: Props) {
  if (props.children) {
    return props.children
  }

  const linkLabel = props.type === 'composable-order' ? 'View on Safe' : getLabel(chainId, props)

  return (
    <>
      {linkLabel} <span style={{ fontSize: '0.8em' }}>↗</span>
    </>
  )
}
