import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { getRandomInt } from '@cowprotocol/common-utils'
import { BigNumber } from '@ethersproject/bignumber'

import styled from 'styled-components/macro'

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

const balances = allTokensMock.reduce<BalancesState['values']>((acc, token) => {
  acc[token.address] = BigNumber.from(getRandomInt(20_000, 120_000_000) + '0'.repeat(token.decimals))

  return acc
}, {})

const defaultProps: SelectTokenModalProps = {
  permitCompatibleTokens: {},
  unsupportedTokens,
  allTokens: allTokensMock,
  favouriteTokens: favouriteTokensMock,
  balancesState: {
    values: balances,
    isLoading: false,
  },
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
