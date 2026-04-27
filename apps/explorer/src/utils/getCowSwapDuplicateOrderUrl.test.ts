import * as commonUtils from '@cowprotocol/common-utils'
import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'

import { Order } from 'api/operator'

import { getCowSwapDuplicateOrderUrl } from './getCowSwapDuplicateOrderUrl'

describe('getCowSwapDuplicateOrderUrl', () => {
  beforeEach(() => {
    jest.spyOn(commonUtils, 'getSwapBaseUrl').mockReturnValue('https://swap.cow.fi')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const weth = {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
    name: 'Wrapped Ether',
  }

  const usdt = {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD',
  }

  it('builds a limit-order URL on mainnet', () => {
    const order = {
      sellToken: weth,
      buyToken: usdt,
      sellAmount: new BigNumber('100000'),
      buyAmount: new BigNumber('7891408295252'),
      kind: OrderKind.SELL,
      fullAppData: undefined,
      class: OrderClass.LIMIT,
    } as Order

    const url = getCowSwapDuplicateOrderUrl(1, order)

    expect(url).toBe(
      'https://swap.cow.fi/#/1/limit/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/0xdAC17F958D2ee523a2206206994597C13D831ec7?sellAmount=0.0000000000001&buyAmount=7891408.295252&orderKind=sell',
    )
  })

  it('maps market orders to the swap route', () => {
    const order = {
      sellToken: weth,
      buyToken: usdt,
      sellAmount: new BigNumber('1'),
      buyAmount: new BigNumber('1'),
      kind: OrderKind.SELL,
      fullAppData: undefined,
      class: OrderClass.MARKET,
    } as Order

    const url = getCowSwapDuplicateOrderUrl(1, order)

    expect(url).toContain('/1/swap/')
  })

  it('maps TWAP to the advanced route', () => {
    const order = {
      sellToken: weth,
      buyToken: usdt,
      sellAmount: new BigNumber('1'),
      buyAmount: new BigNumber('1'),
      kind: OrderKind.SELL,
      fullAppData: JSON.stringify({
        metadata: { orderClass: { orderClass: 'twap' } },
      }),
      class: OrderClass.LIMIT,
    } as Order

    const url = getCowSwapDuplicateOrderUrl(1, order)

    expect(url).toContain('/1/advanced/')
  })

  it('returns null when token metadata is missing', () => {
    const order = {
      sellToken: null,
      buyToken: usdt,
      sellAmount: new BigNumber('1'),
      buyAmount: new BigNumber('1'),
      kind: OrderKind.SELL,
      fullAppData: undefined,
      class: OrderClass.MARKET,
    } as Order

    expect(getCowSwapDuplicateOrderUrl(1, order)).toBeNull()
  })
})
