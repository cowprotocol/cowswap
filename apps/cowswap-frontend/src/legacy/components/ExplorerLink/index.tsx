import { PropsWithChildren, ReactNode } from 'react'

import { getExplorerLabel, getEtherscanLink } from '@cowprotocol/common-utils'
import { getSafeWebUrl } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

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
export function ExplorerLink(props: Props): ReactNode {
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

function getUrl(chainId: SupportedChainId, account: string, props: Props): string {
  const { type } = props

  if (type === 'composable-order') {
    return getSafeWebUrl(chainId, account, props.id)
  }

  // return
  return getEtherscanLink(chainId, type, props.id)
}

function getLabel(chainId: SupportedChainId, props: Props): string {
  const { label, type } = props

  return label || getExplorerLabel(chainId, type, props.id)
}

function getContent(chainId: SupportedChainId, props: Props): ReactNode {
  if (props.children) {
    return props.children
  }

  const linkLabel = props.type === 'composable-order' ? t`View on Safe` : getLabel(chainId, props)

  return (
    <>
      {linkLabel} <span style={{ fontSize: '0.8em' }}>↗</span>
    </>
  )
}
