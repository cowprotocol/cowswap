import { ReactNode } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { CopyButton, type CopyButtonProps } from '../CopyButton'

export interface CopyableAddressProps extends Omit<CopyButtonProps, 'value' | 'children' | 'iconPosition'> {
  address: string
  displayAddress?: ReactNode
  shorten?: boolean
  shortenChars?: number
}

const AddressText = styled.span`
  // font-family: var(${UI.FONT_FAMILY_MONO});
  text-decoration: none;
`

export function CopyableAddress({
  address,
  displayAddress,
  shorten = true,
  shortenChars,
  ...props
}: CopyableAddressProps): ReactNode {
  const display = displayAddress ?? (shorten ? shortenAddress(address, shortenChars) : address)

  return (
    <CopyButton value={address} iconPosition="right" {...props}>
      <AddressText>{display}</AddressText>
    </CopyButton>
  )
}
