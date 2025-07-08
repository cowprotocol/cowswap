import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { Currency } from '@uniswap/sdk-core'

import * as styledEl from './styled'

interface CurrencyLogoPairWithBridgingProps {
  sellToken: Currency
  buyToken: Currency
  clickable?: boolean
  onClick?: () => void
  tokenSize?: number
  children?: ReactNode
}

export function CurrencyLogoPairWithBridging({
  sellToken,
  buyToken,
  clickable,
  onClick,
  tokenSize = 28,
  children,
}: CurrencyLogoPairWithBridgingProps): ReactNode {

  return (
    <styledEl.CurrencyLogoPair clickable={clickable} onClick={onClick} tokenSize={tokenSize}>
      <TokenLogo
        token={sellToken}
        size={tokenSize}
        hideNetworkBadge
      />
      <TokenLogo
        token={buyToken}
        size={tokenSize}
      />
      {children}
    </styledEl.CurrencyLogoPair>
  )
}