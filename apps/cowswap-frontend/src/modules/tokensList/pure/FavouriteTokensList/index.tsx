import { TokenSymbol } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

import { InfoIcon } from 'legacy/components/InfoIcon'

export interface FavouriteTokensListProps {
  tokens: Token[]
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
              {/*TODO: token logo*/}
              <img />
              <TokenSymbol token={token} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
