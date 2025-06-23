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
}

export function AddressLink({ address, chainId }: AddressLinkProps): ReactNode {
  return isAddress(address) ? (
    <Link href={getExplorerLink(chainId, address, ExplorerDataType.ADDRESS)} target="_blank" rel="noreferrer">
      {shortenAddress(address)} ↗
    </Link>
  ) : (
    address
  )
}
