import type { ReactNode } from 'react'

import grassTokenImage from '@cowprotocol/assets/cow-swap/grass-token.png'

import styled from 'styled-components/macro'

export interface TokenLogoProps {
  /** Rendered edge length in px. */
  size?: number
}

/**
 * The wall token's mark, shown beside a balance. Decorative on purpose: every
 * place it appears spells out the symbol in the text next to it.
 */
export function TokenLogo({ size = 16 }: TokenLogoProps): ReactNode {
  return <Logo src={grassTokenImage} alt="" width={size} height={size} />
}

const Logo = styled.img`
  flex: 0 0 auto;
  object-fit: contain;
`
