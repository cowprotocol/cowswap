import { getRandomInt } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { allTokensMock, favouriteTokensMock } from '../../mocks'

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

const defaultProps = {
  selectedToken,
  balances,
  allTokens: allTokensMock,
  favouriteTokens: favouriteTokensMock,
}

const Fixtures = {
  default: (
    <Wrapper>
      <SelectTokenModal {...defaultProps} />
    </Wrapper>
  ),
  importByAddress: (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'0x252d98fab648203aa33310721bbbddfa8f1b6587'} {...defaultProps} />
    </Wrapper>
  ),
  NoTokenFound: (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'0x543ff227f64aa17ea132bf9886cab5db55dcaddf'} {...defaultProps} />
    </Wrapper>
  ),
  searchFromInactiveLists: (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'cDAI'} {...defaultProps} />
    </Wrapper>
  ),
  searchFromExternalSources: (
    <Wrapper>
      <SelectTokenModal defaultInputValue={'Coo'} {...defaultProps} />
    </Wrapper>
  ),
}

export default Fixtures
