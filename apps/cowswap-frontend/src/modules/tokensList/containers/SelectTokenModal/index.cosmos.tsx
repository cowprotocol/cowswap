import { getRandomInt } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { allTokensMock, favouriteTokensMock } from './mocks'

import { SelectTokenModal } from './index'

const Wrapper = styled.div`
  width: 450px;
`

const selectedToken = favouriteTokensMock[0]

const balances = allTokensMock.reduce<{ [key: string]: CurrencyAmount<Currency> }>((acc, token) => {
  acc[token.address.toLowerCase()] = CurrencyAmount.fromRawAmount(
    token,
    getRandomInt(20_000, 120_000_000) * 10 ** token.decimals
  )

  return acc
}, {})

const Fixtures = {
  default: (
    <Wrapper>
      <SelectTokenModal
        selectedToken={selectedToken}
        allTokens={allTokensMock}
        favouriteTokens={favouriteTokensMock}
        balances={balances}
      />
    </Wrapper>
  ),
}

export default Fixtures
