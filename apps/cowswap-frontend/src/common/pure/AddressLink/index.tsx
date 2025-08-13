import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'

const Link = styled.a`
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

interface AddressLinkProps {
  address: string
  chainId: number
  className?: string
  content?: string
}

export function AddressLink({ address, chainId, className, content }: AddressLinkProps): ReactNode {
  return isAddress(address) ? (
    <Link
      className={className}
      href={getExplorerLink(chainId, address, ExplorerDataType.ADDRESS)}
      target="_blank"
      rel="noreferrer"
    >
      {content ? (isAddress(content) ? shortenAddress(content) : content) : shortenAddress(address)} ↗
    </Link>
  ) : (
    address
  )
}
