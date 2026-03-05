import { orderBookSDK } from 'cowSdk'

import { getOrderCompetitionStatus, getSolverCompetitionByTxHash } from '../../../api/operator/operatorApi'
import { OrderCompetitionStatus, SolverCompetitionResponse } from '../../../api/operator/types'

jest.mock('cowSdk', () => ({
  orderBookSDK: {
    getOrderCompetitionStatus: jest.fn(),
    getSolverCompetition: jest.fn(),
  },
}))

const mockedOrderBookSDK = jest.mocked(orderBookSDK)

describe('operatorApi competition fallbacks', () => {
  beforeEach(() => {
    mockedOrderBookSDK.getOrderCompetitionStatus.mockReset()
    mockedOrderBookSDK.getSolverCompetition.mockReset()
  })

  it('falls back to staging order competition status when prod returns undefined', async () => {
    const stagingStatus = {
      type: 'traded',
      value: [{ solver: 'stagingSolver', executedAmounts: { sell: '1', buy: '1' } }],
    } as OrderCompetitionStatus

    mockedOrderBookSDK.getOrderCompetitionStatus.mockResolvedValueOnce(undefined).mockResolvedValueOnce(stagingStatus)

    const result = await getOrderCompetitionStatus({ networkId: 1, orderId: 'order-1' })

    expect(result).toEqual(stagingStatus)
    expect(mockedOrderBookSDK.getOrderCompetitionStatus).toHaveBeenCalledTimes(2)
  })

  it('returns undefined order competition status when both environments are empty', async () => {
    mockedOrderBookSDK.getOrderCompetitionStatus.mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined)

    const result = await getOrderCompetitionStatus({ networkId: 1, orderId: 'order-2' })

    expect(result).toBeUndefined()
  })

  it('falls back to staging solver competition when prod has empty solutions', async () => {
    const stagingCompetition = {
      auctionId: 2,
      solutions: [{ isWinner: true, ranking: 1, orders: [] }],
    } as unknown as SolverCompetitionResponse

    mockedOrderBookSDK.getSolverCompetition
      .mockResolvedValueOnce({ auctionId: 1, solutions: [] } as SolverCompetitionResponse)
      .mockResolvedValueOnce(stagingCompetition)

    const result = await getSolverCompetitionByTxHash({ networkId: 1, txHash: '0xtxhash' })

    expect(result).toEqual(stagingCompetition)
    expect(mockedOrderBookSDK.getSolverCompetition).toHaveBeenCalledTimes(2)
  })

  it('returns undefined solver competition when both environments are empty', async () => {
    mockedOrderBookSDK.getSolverCompetition
      .mockResolvedValueOnce({ auctionId: 1, solutions: [] } as SolverCompetitionResponse)
      .mockResolvedValueOnce({ auctionId: 1, solutions: [] } as SolverCompetitionResponse)

    const result = await getSolverCompetitionByTxHash({ networkId: 1, txHash: '0xnone' })

    expect(result).toBeUndefined()
  })
})
