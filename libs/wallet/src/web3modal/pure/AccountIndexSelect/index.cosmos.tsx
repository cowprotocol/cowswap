import { WETH_SEPOLIA } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { AccountIndexSelect } from './index'

const accountsList = [
  '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
  '0x4675c7e5baafbffbca748158becba61ef3b0a263',
  '0x8e501693b6197d85fd26b93bbf5c0911f79f0979',
  '0xefcce23bfbef24cc4fb2dcb2bbc4f6f83c6bda98',
]

const balances = {
  '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5': CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 10_000_000),
  '0x4675c7e5baafbffbca748158becba61ef3b0a263': CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 20_000_000),
  '0x8e501693b6197d85fd26b93bbf5c0911f79f0979': CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 30_000_000),
  '0xefcce23bfbef24cc4fb2dcb2bbc4f6f83c6bda98': CurrencyAmount.fromRawAmount(WETH_SEPOLIA, 40_000_000),
}

const Wrapper = styled.div`
  width: 500px;
  margin: 100px auto;
  padding: 20px;

  background: var(--cow-container-bg-01);
`

const Fixtures = {
  default: (
    <Wrapper>
      <AccountIndexSelect
        accountsList={accountsList}
        balances={balances}
        currentIndex={0}
        onAccountIndexChange={(index) => console.log('onAccountIndexChange', index)}
        loadMoreAccounts={() => {
          return new Promise((resolve) => {
            console.log('loadMoreAccounts')
            setTimeout(resolve, 2000)
          })
        }}
      />
    </Wrapper>
  ),
}

export default Fixtures
