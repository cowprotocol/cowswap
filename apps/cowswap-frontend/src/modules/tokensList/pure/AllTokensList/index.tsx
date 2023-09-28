import { TokenSymbol } from '@cowprotocol/ui'

import { TokenWithLogo } from '../../types'

export interface AllTokensListProps {
  tokens: TokenWithLogo[]
}

export function AllTokensList(props: AllTokensListProps) {
  const { tokens } = props

  return (
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
  )
}
