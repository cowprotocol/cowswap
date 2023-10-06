import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenAmount } from '@cowprotocol/ui'

import { TokenAmounts } from 'modules/tokens'

import * as styledEl from './styled'

import { TokenInfo } from '../TokenInfo'

import type { VirtualItem } from '@tanstack/react-virtual'

export interface TokenListItemProps {
  token: TokenWithLogo
  selectedToken?: TokenWithLogo
  balances: TokenAmounts
  onSelectToken(token: TokenWithLogo): void
  virtualRow?: VirtualItem
}

export function TokenListItem(props: TokenListItemProps) {
  const { token, selectedToken, balances, onSelectToken, virtualRow } = props

  const isTokenSelected = token.address.toLowerCase() === selectedToken?.address.toLowerCase()

  return (
    <styledEl.TokenItem
      key={token.address}
      data-address={token.address}
      disabled={isTokenSelected}
      onClick={() => onSelectToken(token)}
      $isVirtual={!!virtualRow}
      style={{
        height: virtualRow ? `${virtualRow.size}px` : undefined,
        transform: virtualRow ? `translateY(${virtualRow.start}px)` : undefined,
      }}
    >
      <TokenInfo token={token} />
      <span>
        <TokenAmount amount={balances[token.address]?.value} />
      </span>
    </styledEl.TokenItem>
  )
}
