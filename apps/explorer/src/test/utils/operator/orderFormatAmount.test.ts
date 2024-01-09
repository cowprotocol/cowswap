import BigNumber from 'bignumber.js'

import { isTokenErc20, formattedAmount } from 'utils'

import { TokenErc20 } from '@gnosis.pm/dex-js'

const WEthToken: TokenErc20 = {
  symbol: 'WETH',
  name: 'Wrapped Ether',
  address: '0xc778417e063141139fce010982780140aa0cd5ab',
  decimals: 2,
}

describe('Is token an ERC20', () => {
  test('should return true when it complies with TokenERC20 interface', () => {
    expect(isTokenErc20(WEthToken)).toBe(true)
  })

  test('should return false when object is undefined', () => {
    const token = undefined

    expect(isTokenErc20(token)).toBe(false)
  })
})

describe('format amount', () => {
  test('should return a string when input is a erc20 and amount', () => {
    const amount = formattedAmount(WEthToken, new BigNumber('1'))

    expect(amount).toEqual('0.01')
  })

  test('should return dash(-) when erc20 is null', () => {
    const amount = formattedAmount(null, new BigNumber('0.1'))

    expect(amount).toEqual('-')
  })
})
