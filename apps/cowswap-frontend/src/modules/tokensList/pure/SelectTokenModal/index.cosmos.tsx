import { getRandomInt } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { TokenAmounts } from 'modules/tokens'

import { allTokensMock, favouriteTokensMock } from '../../mocks'

import { SelectTokenModal, SelectTokenModalProps } from './index'

const Wrapper = styled.div`
  max-height: 90vh;
  margin: 20px auto;
  display: flex;
  width: 450px;
`

const unsupportedTokens = {}

const selectedToken = favouriteTokensMock[0].address

const balances = allTokensMock.reduce<TokenAmounts>((acc, token) => {
  acc[token.address] = {
    value: CurrencyAmount.fromRawAmount(token, getRandomInt(20_000, 120_000_000) * 10 ** token.decimals),
    loading: false,
    syncing: false,
    valid: true,
    error: false,
  }

  return acc
}, {})

const defaultProps: SelectTokenModalProps = {
  unsupportedTokens,
  allTokens: allTokensMock,
  favouriteTokens: favouriteTokensMock,
  balances,
  balancesLoading: false,
  selectedToken,
  onSelectToken() {
    console.log('onSelectToken')
  },
  onOpenManageWidget() {
    console.log('onOpenManageWidget')
  },
  onDismiss() {
    console.log('onDismiss')
  },
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
      <SelectTokenModal defaultInputValue={'0x543ff227f64aa17ea132bf9886cab5db55dcaddd'} {...defaultProps} />
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
