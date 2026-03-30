import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getIsOffChainCancellable } from './getIsOffChainCancellable'

const ERC20_TOKEN = new Token(
  SupportedChainId.MAINNET,
  '0x0000000000000000000000000000000000000010',
  18,
  'WETH',
  'Wrapped Ether',
)

function buildOrder(
  overrides: Partial<Pick<Order, 'composableCowInfo' | 'status'>> = {},
): Pick<Order, 'composableCowInfo' | 'id' | 'inputToken' | 'status'> {
  return {
    id: 'test-order-id',
    inputToken: ERC20_TOKEN,
    status: OrderStatus.PENDING,
    composableCowInfo: undefined,
    ...overrides,
  }
}

describe('getIsOffChainCancellable', () => {
  it('allows regular pending EOA orders to be cancelled offchain', () => {
    expect(
      getIsOffChainCancellable({
        allowsOffchainSigning: true,
        order: buildOrder(),
      }),
    ).toBe(true)
  })

  it('disables offchain cancellation for composable parent orders', () => {
    expect(
      getIsOffChainCancellable({
        allowsOffchainSigning: true,
        order: buildOrder({ composableCowInfo: { id: 'parent-order-id' } }),
      }),
    ).toBe(false)
  })

  it('disables offchain cancellation for the last TWAP part', () => {
    expect(
      getIsOffChainCancellable({
        allowsOffchainSigning: true,
        order: buildOrder({ composableCowInfo: { parentId: 'parent-order-id', isTheLastPart: true } }),
      }),
    ).toBe(false)
  })
})
