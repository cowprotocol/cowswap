import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { Currency } from '@uniswap/sdk-core'

import * as styledEl from './styled'

interface CurrencyLogoPairProps {
  sellToken: Currency
  buyToken: Currency
  clickable?: boolean
  onClick?: () => void
  tokenSize?: number
  children?: ReactNode
}

export function CurrencyLogoPair({
  sellToken,
  buyToken,
  clickable,
  onClick,
  tokenSize = 28,
  children,
}: CurrencyLogoPairProps): ReactNode {
  return (
    <styledEl.CurrencyLogoPairWrapper clickable={clickable} onClick={onClick} tokenSize={tokenSize}>
      <TokenLogo token={sellToken} size={tokenSize} hideNetworkBadge />
      <TokenLogo token={buyToken} size={tokenSize} />
      {children}
    </styledEl.CurrencyLogoPairWrapper>
  )
}
