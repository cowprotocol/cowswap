import { TokenSymbol } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

export interface AllTokensListProps {
  tokens: Token[]
}

export function AllTokensList(props: AllTokensListProps) {
  const { tokens } = props

  return (
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
  )
}
