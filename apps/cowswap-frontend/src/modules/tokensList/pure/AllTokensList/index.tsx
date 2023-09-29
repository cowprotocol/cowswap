import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import * as styledEl from './styled'

import { TokenWithLogo } from '../../types'

export interface AllTokensListProps {
  tokens: TokenWithLogo[]
  selectedToken?: TokenWithLogo
  balances: { [key: string]: CurrencyAmount<Currency> }
}

export function AllTokensList(props: AllTokensListProps) {
  const { tokens, selectedToken, balances } = props

  return (
    <styledEl.Wrapper>
      {tokens.map((token) => {
        const isTokenSelected = token.address.toLowerCase() === selectedToken?.address.toLowerCase()

        return (
          <styledEl.TokenItem key={token.address} disabled={isTokenSelected} data-address={token.address}>
            <styledEl.TokenInfo>
              <styledEl.TokenLogo src={token.logoURI} alt={token.name} />
              <div>
                <TokenSymbol token={token} />
                <styledEl.TokenName>{token.name}</styledEl.TokenName>
              </div>
            </styledEl.TokenInfo>
            <span>
              <TokenAmount amount={balances[token.address.toLowerCase()]} />
            </span>
          </styledEl.TokenItem>
        )
      })}
    </styledEl.Wrapper>
  )
}
