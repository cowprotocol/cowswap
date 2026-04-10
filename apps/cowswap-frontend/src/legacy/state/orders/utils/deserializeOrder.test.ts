import { USDC_MAINNET as USDC, USDT } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@cowprotocol/currency'

import { deserializeOrder } from './deserializeOrder'

import { serializeToken } from '../../user/hooks'
import { SerializedOrder } from '../actions'
import { generateOrder } from '../mocks'
import { OrderObject } from '../reducer'

const CHAIN_ID = USDT.chainId
const OWNER = '0x0000000000000000000000000000000000000001'

function createSerializedOrder(overrides?: Partial<SerializedOrder>): OrderObject {
  const order = generateOrder({ owner: OWNER, sellToken: USDT, buyToken: USDC })
  const { bridgeOutputAmount: _bridgeOutputAmount, ...serializableOrder } = order

  return {
    id: order.id,
    isSafeWallet: false,
    order: {
      ...serializableOrder,
      inputToken: serializeToken(order.inputToken),
      outputToken: serializeToken(order.outputToken),
      ...overrides,
    },
  }
}

describe('deserializeOrder', () => {
  it('rehydrates serialized bridge output amounts', () => {
    const bridgeOutputAmount = CurrencyAmount.fromRawAmount(USDC, '1234500')
    const serializedOrder = createSerializedOrder({
      bridgeOutputAmount: { amount: bridgeOutputAmount.quotient.toString() },
    })

    const result = deserializeOrder(serializedOrder)
    const resultBridgeOutputAmount = result?.bridgeOutputAmount

    expect(resultBridgeOutputAmount?.quotient.toString()).toBe('1234500')
    expect(resultBridgeOutputAmount?.currency.chainId).toBe(CHAIN_ID)

    if (!resultBridgeOutputAmount) {
      throw new Error('Expected bridge output amount to be rehydrated')
    }

    expect(getCurrencyAddress(resultBridgeOutputAmount.currency)).toBe(USDC.address)
  })

  it('drops malformed cached bridge output amounts instead of crashing', () => {
    const serializedOrder = createSerializedOrder({
      bridgeOutputAmount: { numerator: { bad: true } } as unknown as SerializedOrder['bridgeOutputAmount'],
    })

    const result = deserializeOrder(serializedOrder)

    expect(result?.bridgeOutputAmount).toBeUndefined()
    expect(result?.outputToken.address).toBe(USDC.address)
  })
})
