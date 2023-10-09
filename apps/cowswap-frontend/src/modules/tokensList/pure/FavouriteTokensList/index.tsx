import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenSymbol } from '@cowprotocol/ui'

import { InfoIcon } from 'legacy/components/InfoIcon'

import * as styledEl from './styled'

import { TokenLogo } from '../TokenLogo'

export interface FavouriteTokensListProps {
  tokens: TokenWithLogo[]
  selectedToken?: string
  onSelectToken(token: TokenWithLogo): void
}

export function FavouriteTokensList(props: FavouriteTokensListProps) {
  const { tokens, selectedToken, onSelectToken } = props

  return (
    <div>
      <styledEl.Header>
        <h4>Favourite tokens</h4>
        <InfoIcon iconType="help" content="Your favourite saved tokens. Edit this list in your account page." />
      </styledEl.Header>
      <div>
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
      </div>
    </div>
  )
}
