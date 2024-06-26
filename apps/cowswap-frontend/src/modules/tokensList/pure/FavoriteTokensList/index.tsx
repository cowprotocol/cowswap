import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { HelpTooltip, TokenSymbol } from '@cowprotocol/ui'

import * as styledEl from './styled'

export interface FavoriteTokensListProps {
  tokens: TokenWithLogo[]
  hideTooltip?: boolean
  selectedToken?: string

  onSelectToken(token: TokenWithLogo): void
}

export function FavoriteTokensList(props: FavoriteTokensListProps) {
  const { tokens, hideTooltip, selectedToken, onSelectToken } = props

  return (
    <div>
      <styledEl.Header>
        <h4>Favorite tokens</h4>
        {!hideTooltip && <HelpTooltip text="Your favorite saved tokens. Edit this list in your account page." />}
      </styledEl.Header>
      <styledEl.List>
        {tokens.map((token) => {
          const isTokenSelected = token.address.toLowerCase() === selectedToken?.toLowerCase()

          return (
            <styledEl.TokensItem
              key={token.address}
              data-address={token.address.toLowerCase()}
              disabled={isTokenSelected}
              onClick={() => onSelectToken(token)}
            >
              <TokenLogo token={token} size={24} />
              <TokenSymbol token={token} />
            </styledEl.TokensItem>
          )
        })}
      </styledEl.List>
    </div>
  )
}
