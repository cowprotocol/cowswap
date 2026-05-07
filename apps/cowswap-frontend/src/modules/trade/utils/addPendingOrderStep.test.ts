import { USDC_MAINNET as USDC, USDT } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { addPendingOrder } from 'legacy/state/orders/actions'
import { generateOrder } from 'legacy/state/orders/mocks'

import { addPendingOrderStep } from './addPendingOrderStep'

const OWNER = '0x0000000000000000000000000000000000000001'

describe('addPendingOrderStep', () => {
  it('serializes bridge output amounts before persisting pending orders', () => {
    const order = generateOrder({ owner: OWNER, sellToken: USDT, buyToken: USDC })
    const dispatch = jest.fn()

    order.bridgeOutputAmount = CurrencyAmount.fromRawAmount(USDC, '1234500')

    addPendingOrderStep(
      {
        id: order.id,
        chainId: SupportedChainId.MAINNET,
        order,
        isSafeWallet: false,
      },
      dispatch as never,
    )

    expect(dispatch).toHaveBeenCalledWith(
      addPendingOrder({
        id: order.id,
        chainId: SupportedChainId.MAINNET,
        isSafeWallet: false,
        order: expect.objectContaining({
          bridgeOutputAmount: { amount: '1234500' },
        }),
      }),
    )
  })
})
