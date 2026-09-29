import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { computeOrderUid } from 'utils/orderUtils/computeOrderUid'

import { createPartOrderFromParent, generateTwapOrderParts } from './buildTwapParts'

import { TwapOrderItem, TwapOrderStatus } from '../types'

jest.mock('utils/orderUtils/computeOrderUid', () => ({ computeOrderUid: jest.fn() }))

const computeUid = jest.mocked(computeOrderUid)
const OWNER = '0x1111111111111111111111111111111111111111'
const CHAIN = SupportedChainId.GNOSIS_CHAIN

function makeOrder(n = 3): TwapOrderItem {
  return {
    id: 'parent',
    chainId: CHAIN,
    safeAddress: OWNER,
    resolvedOwner: OWNER,
    status: TwapOrderStatus.Pending,
    submissionDate: '2026-09-01T00:00:00Z',
    safeTxParams: {
      submissionDate: '2026-09-01T00:00:00Z',
      executionDate: '2026-09-01T00:00:00Z',
      isExecuted: true,
      nonce: '1',
      confirmationsRequired: 1,
      confirmations: 1,
      safeTxHash: '0x00',
    },
    order: {
      sellToken: '0x2222222222222222222222222222222222222222',
      buyToken: '0x3333333333333333333333333333333333333333',
      receiver: OWNER,
      partSellAmount: '100',
      minPartLimit: '50',
      t0: 0,
      n,
      t: 60,
      span: 0,
      appData: `0x${'00'.repeat(32)}`,
    },
    executionInfo: {
      confirmedPartsCount: 0,
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFee: '0' },
    },
  }
}

describe('generateTwapOrderParts', () => {
  beforeEach(() => {
    computeUid.mockReset().mockImplementation(async (chainId, owner, order) => `${chainId}:${owner}:${order.validTo}`)
  })

  it('reuses persisted parts across status and execution-progress changes, preserving virtual flags', async () => {
    const order = makeOrder()
    const { parent: cached } = await generateTwapOrderParts(order, OWNER, CHAIN)
    cached[0].isCreatedInOrderBook = true
    cached[1].isCancelling = true
    computeUid.mockClear()

    const updated = {
      ...order,
      status: TwapOrderStatus.Expired,
      executionInfo: { ...order.executionInfo, confirmedPartsCount: 2 },
    }
    const { parent: parts } = await generateTwapOrderParts(updated, OWNER, CHAIN, cached)

    expect(computeUid).not.toHaveBeenCalled()
    expect(parts).toEqual(cached)
    expect(parts[0]).toBe(cached[0])
  })

  it.each(['owner', 'chain', 'parent', 'executionDate', 'amount', 'interval', 'span', 'receiver', 'appData'] as const)(
    'regenerates parts when %s changes',
    async (change) => {
      const order = makeOrder()
      const cached = (await generateTwapOrderParts(order, OWNER, CHAIN)).parent
      computeUid.mockClear()
      let owner = OWNER
      let chain = CHAIN
      const updated = makeOrder()
      if (change === 'owner') owner = '0x4444444444444444444444444444444444444444'
      if (change === 'chain') chain = SupportedChainId.MAINNET
      if (change === 'parent') updated.id = 'other-parent'
      if (change === 'executionDate' && updated.safeTxParams)
        updated.safeTxParams.executionDate = '2026-09-02T00:00:00Z'
      if (change === 'amount') updated.order.partSellAmount = '200'
      if (change === 'interval') updated.order.t = 120
      if (change === 'span') updated.order.span = 30
      if (change === 'receiver') updated.order.receiver = '0x4444444444444444444444444444444444444444'
      if (change === 'appData') updated.order.appData = `0x${'11'.repeat(32)}`

      const result = await generateTwapOrderParts(updated, owner, chain, cached)

      expect(computeUid).toHaveBeenCalledTimes(3)
      expect(result[updated.id][0].order).toEqual(createPartOrderFromParent(updated, 0))
      expect(result[updated.id][0].safeAddress).toBe(owner)
      expect(result[updated.id][0].chainId).toBe(chain)
    },
  )

  it('handles partial caches and changed part counts without retaining removed parts', async () => {
    const order = makeOrder()
    const cached = (await generateTwapOrderParts(order, OWNER, CHAIN)).parent
    computeUid.mockClear()
    const more = await generateTwapOrderParts({ ...order, order: { ...order.order, n: 4 } }, OWNER, CHAIN, cached)
    expect(computeUid).toHaveBeenCalledTimes(4)
    expect(more.parent).toHaveLength(4)
    computeUid.mockClear()
    const fewer = await generateTwapOrderParts({ ...order, order: { ...order.order, n: 2 } }, OWNER, CHAIN, cached)
    expect(computeUid).toHaveBeenCalledTimes(2)
    expect(fewer.parent).toEqual(cached.slice(0, 2))
  })

  it('does not reuse a part at the wrong index', async () => {
    const order = makeOrder()
    const cached = (await generateTwapOrderParts(order, OWNER, CHAIN)).parent
    cached[0] = { ...cached[0], index: 1 }
    computeUid.mockClear()
    await generateTwapOrderParts(order, OWNER, CHAIN, cached)
    expect(computeUid).toHaveBeenCalledTimes(3)
  })

  it('returns no parts until the execution date exists', async () => {
    const order = makeOrder()
    order.safeTxParams = undefined
    expect(await generateTwapOrderParts(order, OWNER, CHAIN)).toEqual({ parent: [] })
    expect(computeUid).not.toHaveBeenCalled()
  })
})
