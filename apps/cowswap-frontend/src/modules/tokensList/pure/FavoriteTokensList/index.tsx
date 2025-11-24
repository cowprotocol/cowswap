import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { HelpTooltip, TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'

import * as styledEl from './styled'

export interface FavoriteTokensListProps {
  tokens: TokenWithLogo[]
  hideTooltip?: boolean
  selectedToken?: string

  onSelectToken(token: TokenWithLogo): void
}

export function FavoriteTokensList(props: FavoriteTokensListProps): ReactNode {
  const { tokens, hideTooltip, selectedToken, onSelectToken } = props

  return (
    <div>
      <styledEl.Header>
        <h4>
          <Trans>Favorite tokens</Trans>
        </h4>
        {!hideTooltip && (
          <HelpTooltip
            text={
              <Trans>
                Your favorite saved tokens. Edit this list in the <Link to="/account/tokens">Tokens page</Link>.
              </Trans>
            }
          />
        )}
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
