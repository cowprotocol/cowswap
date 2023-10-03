import { TokenWithLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import * as styledEl from './styled'

import { TokenInfo } from '../TokenInfo'

export interface AllTokensListProps {
  tokens: TokenWithLogo[]
  selectedToken?: TokenWithLogo
  balances: { [key: string]: CurrencyAmount<Currency> }
  onSelectToken(token: TokenWithLogo): void
}

export function AllTokensList(props: AllTokensListProps) {
  const { tokens, selectedToken, balances, onSelectToken } = props

  return (
    <styledEl.Wrapper>
      {tokens.map((token) => {
        const isTokenSelected = token.address.toLowerCase() === selectedToken?.address.toLowerCase()

        return (
          <styledEl.TokenItem
            key={token.address}
            disabled={isTokenSelected}
            data-address={token.address}
            onClick={() => onSelectToken(token)}
          >
            <TokenInfo token={token} />
            <span>
              <TokenAmount amount={balances[token.address.toLowerCase()]} />
            </span>
          </styledEl.TokenItem>
        )
      })}
    </styledEl.Wrapper>
  )
}
