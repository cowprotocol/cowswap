import { CurrencyAmount } from '@uniswap/sdk-core'

import { WETH_GOERLI } from 'legacy/utils/goerli/constants'

import { AccountIndexSelect } from './index'

const accountsList = [
  '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
  '0x4675c7e5baafbffbca748158becba61ef3b0a263',
  '0x8e501693b6197d85fd26b93bbf5c0911f79f0979',
  '0xefcce23bfbef24cc4fb2dcb2bbc4f6f83c6bda98',
]

const balances = {
  '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5': CurrencyAmount.fromRawAmount(WETH_GOERLI, 10_000_000),
  '0x4675c7e5baafbffbca748158becba61ef3b0a263': CurrencyAmount.fromRawAmount(WETH_GOERLI, 20_000_000),
  '0x8e501693b6197d85fd26b93bbf5c0911f79f0979': CurrencyAmount.fromRawAmount(WETH_GOERLI, 30_000_000),
  '0xefcce23bfbef24cc4fb2dcb2bbc4f6f83c6bda98': CurrencyAmount.fromRawAmount(WETH_GOERLI, 40_000_000),
}

const Fixtures = {
  default: (
    <AccountIndexSelect
      accountsList={accountsList}
      balances={balances}
      currentIndex={0}
      onAccountIndexChange={(index) => console.log('onAccountIndexChange', index)}
    />
  ),
}

export default Fixtures
