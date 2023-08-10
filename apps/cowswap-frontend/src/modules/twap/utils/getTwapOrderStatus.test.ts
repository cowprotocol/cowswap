import { getTwapOrderStatus } from './getTwapOrderStatus'

import { TwapOrdersExecution } from '../hooks/useTwapOrdersExecutions'
import { TwapOrderStatus, TWAPOrderStruct } from '../types'

const orderStruct: TWAPOrderStruct = {
  sellToken: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  buyToken: '0x02ABBDbAaa7b1BB64B5c878f7ac17f8DDa169532',
  receiver: '0xe9B79591E270B3bCd0CC7e84f7B7De74BA3D0E2F',
  partSellAmount: '0xc4c6e2ce9530cf',
  minPartLimit: '0x091f5db5e0561ce4',
  t0: 0,
  n: 4,
  t: 300,
  span: 0,
  appData: '0x226123123d9e99f7e8b46519b6311acac9f3d5e661b1fb40dc638eae03e156df',
}

describe('getTwapOrderStatus()', () => {
  describe('When executedSellAmount equals to partSellAmount * n', () => {
    it('Then an order status is Fulfilled', () => {
      const execution: TwapOrdersExecution = {
        confirmedPartsCount: orderStruct.n,
        info: {
          executedSellAmount: (BigInt(orderStruct.partSellAmount) * BigInt(orderStruct.n)).toString(), // <----
          executedBuyAmount: '0',
          executedFeeAmount: '0',
        },
      }

      const status = getTwapOrderStatus(orderStruct, true, new Date(), true, execution)

      expect(status).toBe(TwapOrderStatus.Fulfilled)
    })
  })

  describe('When executedSellAmount is less than partSellAmount * n', () => {
    it('Then an order status should not be Fulfilled', () => {
      const execution: TwapOrdersExecution = {
        confirmedPartsCount: 2,
        info: {
          executedSellAmount: '0x2', // <----
          executedBuyAmount: '0',
          executedFeeAmount: '0',
        },
      }

      const status = getTwapOrderStatus(orderStruct, true, new Date(), true, execution)

      expect(status).toBe(TwapOrderStatus.Pending)
    })
  })

  describe('When count of confirmed parts equals to the total parts count', () => {
    it('Then an order status is Expired', () => {
      const execution: TwapOrdersExecution = {
        confirmedPartsCount: orderStruct.n, // <----
        info: {
          executedSellAmount: '0',
          executedBuyAmount: '0',
          executedFeeAmount: '0',
        },
      }

      const status = getTwapOrderStatus(orderStruct, true, new Date(), true, execution)

      expect(status).toBe(TwapOrderStatus.Expired)
    })
  })
})
