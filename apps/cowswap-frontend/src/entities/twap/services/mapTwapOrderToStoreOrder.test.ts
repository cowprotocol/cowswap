import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import type { TokensByAddress } from '@cowprotocol/tokens'

// eslint-disable-next-line import/no-internal-modules
import { TwapOrderStatus, type TwapOrderItem } from 'modules/twap/types'

import { mapTwapOrderToStoreOrder } from './mapTwapOrderToStoreOrder'

const chainId = SupportedChainId.GNOSIS_CHAIN
const sellToken = new Token(chainId, '0x1111111111111111111111111111111111111111', 18)
const buyToken = new Token(chainId, '0x2222222222222222222222222222222222222222', 18)
const orderHash = `0x${'33'.repeat(32)}`

const tokensByAddress = {
  [getAddressKey(sellToken.address)]: sellToken,
  [getAddressKey(buyToken.address)]: buyToken,
} satisfies TokensByAddress

const twapOrder = {
  id: 'creation-event-id',
  hash: orderHash,
  chainId,
  safeAddress: '0x4444444444444444444444444444444444444444',
  resolvedOwner: '0x5555555555555555555555555555555555555555',
  status: TwapOrderStatus.Pending,
  submissionDate: new Date(0).toISOString(),
  order: {
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    receiver: '0x5555555555555555555555555555555555555555',
    partSellAmount: '1',
    minPartLimit: '1',
    t0: 0,
    n: 1,
    t: 60,
    span: 0,
    appData: `0x${'00'.repeat(32)}`,
  },
  executionInfo: {
    confirmedPartsCount: 0,
    info: { executedSellAmount: '0', executedBuyAmount: '0', executedFeeAmount: '0' },
  },
} satisfies TwapOrderItem

describe('mapTwapOrderToStoreOrder', () => {
  it('keeps the event ID for UI state and the order hash for on-chain cancellation', () => {
    const result = mapTwapOrderToStoreOrder(twapOrder, tokensByAddress)

    expect(result?.composableCowInfo).toMatchObject({
      id: twapOrder.id,
      twapOrderHash: orderHash,
    })
  })
})
