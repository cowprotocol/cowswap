import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Edit, X } from 'react-feather'

import * as styledEl from './styled'

import { AllTokensList } from '../../pure/AllTokensList'
import { FavouriteTokensList } from '../../pure/FavouriteTokensList'
import { TokenWithLogo } from '../../types'

export interface SelectTokenModalProps {
  allTokens: TokenWithLogo[]
  favouriteTokens: TokenWithLogo[]
  balances: { [key: string]: CurrencyAmount<Currency> }
  selectedToken?: TokenWithLogo
}

export function SelectTokenModal(props: SelectTokenModalProps) {
  const { favouriteTokens, allTokens, selectedToken, balances } = props

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <h3>Select a token</h3>
        <button>
          <X />
        </button>
      </styledEl.Header>
      <styledEl.Row>
        <styledEl.SearchInput type="text" placeholder="Search name or past address" />
      </styledEl.Row>
      <styledEl.Row>
        <FavouriteTokensList selectedToken={selectedToken} tokens={favouriteTokens} />
      </styledEl.Row>
      <div>
        <AllTokensList selectedToken={selectedToken} tokens={allTokens} balances={balances} />
      </div>
      <div>
        <styledEl.ActionButton>
          <Edit /> <span>Manage Token Lists</span>
        </styledEl.ActionButton>
      </div>
    </styledEl.Wrapper>
  )
}
