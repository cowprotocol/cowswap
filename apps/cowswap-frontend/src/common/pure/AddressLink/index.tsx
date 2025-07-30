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
  ensName?: string | null  // NEW: Optional ENS name to display instead of address
}

export function AddressLink({ address, chainId, className, noShorten, ensName }: AddressLinkProps): ReactNode {
  // If ENS name is provided, always show it and link to it
  if (ensName) {
    return (
      <Link
        className={className}
        href={getExplorerLink(chainId, ensName, ExplorerDataType.ADDRESS)}
        target="_blank"
        rel="noreferrer"
      >
        {ensName} ↗
      </Link>
    )
  }
  
  // Otherwise, fall back to original address logic
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
