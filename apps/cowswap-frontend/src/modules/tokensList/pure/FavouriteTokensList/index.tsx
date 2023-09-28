import { TokenSymbol } from '@cowprotocol/ui'

import { InfoIcon } from 'legacy/components/InfoIcon'

import * as styledEl from './styled'

import { TokenWithLogo } from '../../types'

export interface FavouriteTokensListProps {
  tokens: TokenWithLogo[]
}

export function FavouriteTokensList(props: FavouriteTokensListProps) {
  const { tokens } = props

  return (
    <div>
      <styledEl.Header>
        <h4>Favourite tokens</h4>
        <InfoIcon iconType="help" content="Your favourite saved tokens. Edit this list in your account page." />
      </styledEl.Header>
      <styledEl.TokensList>
        {tokens.map((token) => {
          return (
            <styledEl.TokensItem key={token.address}>
              <img src={token.logoURI} alt={token.name} />
              <TokenSymbol token={token} />
            </styledEl.TokensItem>
          )
        })}
      </styledEl.TokensList>
    </div>
  )
}
