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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
              data-token-symbol={token.symbol || ''}
              data-token-name={token.name || ''}
              data-element-type="token-selection"
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
