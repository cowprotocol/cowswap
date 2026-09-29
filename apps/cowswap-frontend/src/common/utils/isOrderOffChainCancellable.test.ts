import { COW_TOKEN_TO_CHAIN, NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SigningScheme } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'

import { CancellableOrder } from './isOrderCancellable'
import { isOrderOffChainCancellable } from './isOrderOffChainCancellable'

const ORDER: CancellableOrder = {
  id: 'order-id',
  inputToken: COW_TOKEN_TO_CHAIN[1]!,
  signingScheme: SigningScheme.EIP712,
  status: OrderStatus.PENDING,
}

describe('isOrderOffChainCancellable', () => {
  it('allows EIP-712 orders', () => {
    expect(isOrderOffChainCancellable(ORDER)).toBe(true)
  })

  it.each([SigningScheme.ETHSIGN, SigningScheme.PRESIGN, SigningScheme.EIP1271])(
    'rejects %s orders',
    (signingScheme) => {
      expect(isOrderOffChainCancellable({ ...ORDER, signingScheme })).toBe(false)
    },
  )

  it('rejects native-token orders', () => {
    expect(isOrderOffChainCancellable({ ...ORDER, inputToken: NATIVE_CURRENCIES[1] })).toBe(false)
  })
})
