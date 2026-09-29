import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapPartOrder } from '@cowprotocol/sdk-composable'

import { programmaticOrdersApi } from './programmaticOrdersApi'

jest.mock('@cowprotocol/sdk-composable', () => {
  const mockGetTwapPartOrders = jest.fn()
  const mockGetDeployedCowSheds = jest.fn()

  return {
    ...jest.requireActual('@cowprotocol/sdk-composable'),
    ProgrammaticOrderApi: jest.fn().mockImplementation(() => ({
      getTwapPartOrders: mockGetTwapPartOrders,
      getDeployedCowSheds: mockGetDeployedCowSheds,
    })),
    mockGetTwapPartOrders,
    mockGetDeployedCowSheds,
  }
})

const { mockGetTwapPartOrders, mockGetDeployedCowSheds } = jest.requireMock('@cowprotocol/sdk-composable') as {
  mockGetTwapPartOrders: jest.Mock
  mockGetDeployedCowSheds: jest.Mock
}

const chainId = SupportedChainId.GNOSIS_CHAIN
const eventId = 'event-id'
const openPart = {
  orderUid: `0x${'11'.repeat(56)}`,
  status: 'open',
  sellAmount: 1n,
  buyAmount: 1n,
  feeAmount: 0n,
  createdAt: 1,
} satisfies TwapPartOrder

describe('fetchCurrentEoaTwapPartOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the latest part when it is open', async () => {
    mockGetTwapPartOrders.mockResolvedValue({ items: [openPart], totalCount: 1 })

    await expect(programmaticOrdersApi.fetchCurrentEoaTwapPartOrder(eventId, chainId)).resolves.toBe(openPart)
    expect(mockGetTwapPartOrders).toHaveBeenCalledWith(
      { eventId, chainId },
      {
        direction: 'desc',
        limit: 1,
      },
    )
  })

  it('does not return an inactive latest part', async () => {
    mockGetTwapPartOrders.mockResolvedValue({
      items: [{ ...openPart, status: 'fulfilled' }],
      totalCount: 1,
    })

    await expect(programmaticOrdersApi.fetchCurrentEoaTwapPartOrder(eventId, chainId)).resolves.toBeUndefined()
  })
})

describe('fetchDeployedCowShedAddresses', () => {
  const owner = '0x1111111111111111111111111111111111111111'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns shed addresses from the first page for the owner on the chain', async () => {
    const firstShed = '0x2222222222222222222222222222222222222222'
    const secondShed = '0x3333333333333333333333333333333333333333'

    mockGetDeployedCowSheds.mockResolvedValue({
      items: [{ address: firstShed }, { address: secondShed }],
      totalCount: 2,
    })

    await expect(programmaticOrdersApi.fetchDeployedCowShedAddresses(owner, chainId)).resolves.toEqual([
      firstShed,
      secondShed,
    ])
    expect(mockGetDeployedCowSheds).toHaveBeenCalledWith({ owner, chainId }, { limit: 10, offset: 0 })
  })
})
