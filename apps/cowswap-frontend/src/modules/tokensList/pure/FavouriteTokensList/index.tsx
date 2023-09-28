import { TokenSymbol } from '@cowprotocol/ui'

import { InfoIcon } from 'legacy/components/InfoIcon'

import { TokenWithLogo } from '../../types'

export interface FavouriteTokensListProps {
  tokens: TokenWithLogo[]
}

export function FavouriteTokensList(props: FavouriteTokensListProps) {
  const { tokens } = props

  return (
    <div>
      <div>
        <h4>Favourite tokens</h4>
        <InfoIcon content="Your favourite saved tokens. Edit this list in your account page." />
      </div>
      <div>
        {tokens.map((token) => {
          return (
            <button key={token.address}>
              <img src={token.logoURI} width={30} height={30} />
              <TokenSymbol token={token} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
