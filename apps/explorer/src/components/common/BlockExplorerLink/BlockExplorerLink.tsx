import React, { ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { BlockExplorerLinkType, getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'

import LogoWrapper, { LOGO_MAP } from 'components/common/LogoWrapper'
import { abbreviateString } from 'utils'

export interface Props {
  /**
   * type of BlockExplorerLink
   */
  type: BlockExplorerLinkType
  /**
   * address or transaction or other hash
   */
  identifier: string | undefined
  /**
   * network number | chain id
   */
  networkId?: SupportedChainId
  /**
   * label to replace textContent generated from identifier
   */
  label?: ReactNode

  /**
   * Use the URL as a label
   */
  useUrlAsLabel?: boolean
  /**
   * className to pass on to <a/>
   */
  className?: string // to allow subclassing styles with styled-components
  /**
   * to show explorer logo
   */
  showLogo?: boolean
}

/**
 * Dumb BlockExplorerLink, a pure UI component
 *
 * Does not make any assumptions regarding the network.
 * Expects all data as input. Does not use any hooks internally.
 */
export const BlockExplorerLink: React.FC<Props> = (props: Props) => {
  const { type, identifier, label: labelProp, useUrlAsLabel = false, className, networkId, showLogo = false } = props

  if (!networkId || !identifier) {
    return null
  }

  const url = getBlockExplorerUrl(networkId, type, identifier)
  const label = labelProp || (useUrlAsLabel && url) || abbreviateString(identifier, 6, 4)

  return (
    <ExternalLink href={url} target="_blank" rel="noopener noreferrer" className={className}>
      <span>{label}</span>
      {showLogo && <LogoWrapper title={`Open it on ${CHAIN_INFO[networkId].explorerTitle}`} src={LOGO_MAP.etherscan} />}
    </ExternalLink>
  )
}
