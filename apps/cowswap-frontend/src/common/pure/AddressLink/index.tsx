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
  noShorten?: boolean
}

export function AddressLink({ address, chainId, className, noShorten }: AddressLinkProps): ReactNode {
  return isAddress(address) ? (
    <Link
      className={className}
      href={getExplorerLink(chainId, address, ExplorerDataType.ADDRESS)}
      target="_blank"
      rel="noreferrer"
    >
      {noShorten ? address : shortenAddress(address)} ↗
    </Link>
  ) : (
    address
  )
}
