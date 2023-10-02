import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import * as styledEl from './styled'

import { TokenWithLogo } from '../../types'
import { TokenInfo } from '../TokenInfo'

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
