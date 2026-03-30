import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { OrderStatus } from 'legacy/state/orders/actions'

import { getIsPrototypeTwapCancellationOrder } from './getIsPrototypeTwapCancellationOrder'
import { CancellableOrder } from './isOrderCancellable'

const ERC20_TOKEN = new Token(
  SupportedChainId.MAINNET,
  '0x0000000000000000000000000000000000000010',
  18,
  'WETH',
  'Wrapped Ether',
)

function buildOrder(overrides: Partial<CancellableOrder> = {}): CancellableOrder {
  return {
    id: 'order-id',
    inputToken: ERC20_TOKEN,
    status: OrderStatus.PENDING,
    ...overrides,
  }
}

describe('getIsPrototypeTwapCancellationOrder', () => {
  it('returns true for prototype composable parent orders', () => {
    expect(
      getIsPrototypeTwapCancellationOrder(
        buildOrder({ composableCowInfo: { id: 'parent-order-id', isPrototype: true } }),
      ),
    ).toBe(true)
  })

  it('returns false for non-prototype composable parent orders', () => {
    expect(getIsPrototypeTwapCancellationOrder(buildOrder({ composableCowInfo: { id: 'parent-order-id' } }))).toBe(
      false,
    )
  })

  it('returns false for regular non-composable orders', () => {
    expect(getIsPrototypeTwapCancellationOrder(buildOrder())).toBe(false)
  })
})
