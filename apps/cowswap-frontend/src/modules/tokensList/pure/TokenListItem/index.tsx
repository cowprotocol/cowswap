import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import * as styledEl from './styled'

import { TokenInfo } from '../TokenInfo'
import { TokenTags } from '../TokenTags'

import type { VirtualItem } from '@tanstack/react-virtual'

export interface TokenListItemProps {
  token: TokenWithLogo
  selectedToken?: string
  balance: CurrencyAmount<Token> | undefined
  onSelectToken(token: TokenWithLogo): void
  virtualRow?: VirtualItem
  isUnsupported: boolean
  isPermitCompatible: boolean
}

export function TokenListItem(props: TokenListItemProps) {
  const { token, selectedToken, balance, onSelectToken, virtualRow, isUnsupported, isPermitCompatible } = props

  const isTokenSelected = token.address.toLowerCase() === selectedToken?.toLowerCase()

  return (
    <styledEl.TokenItem
      key={token.address}
      data-address={token.address.toLowerCase()}
      disabled={isTokenSelected}
      onClick={() => onSelectToken(token)}
      $isVirtual={!!virtualRow}
      style={{
        height: virtualRow ? `${virtualRow.size}px` : undefined,
        transform: virtualRow ? `translateY(${virtualRow.start}px)` : undefined,
      }}
    >
      <TokenInfo token={token} />
      <TokenTags isUnsupported={isUnsupported} isPermitCompatible={isPermitCompatible} />
      <span>
        <TokenAmount amount={balance} />
      </span>
    </styledEl.TokenItem>
  )
}
