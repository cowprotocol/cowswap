import { SolverCompetitionResponse, SupportedChainId } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { getSolverCompetition } from './api'

jest.mock('cowSdk', () => ({
  orderBookApi: {
    getSolverCompetition: jest.fn(),
  },
}))

const getSolverCompetitionMock = orderBookApi.getSolverCompetition as jest.MockedFunction<
  typeof orderBookApi.getSolverCompetition
>

const CHAIN_ID = SupportedChainId.MAINNET
const TX_HASH = '0xsettle'

describe('getSolverCompetition', () => {
  beforeEach(() => {
    getSolverCompetitionMock.mockReset()
  })

  it('loads the competition for a settlement tx hash', async () => {
    const competition = { auctionId: 42 } as SolverCompetitionResponse
    getSolverCompetitionMock.mockResolvedValue(competition)

    await expect(getSolverCompetition(CHAIN_ID, TX_HASH)).resolves.toBe(competition)
    expect(getSolverCompetitionMock).toHaveBeenCalledWith(TX_HASH, { chainId: CHAIN_ID })
  })

  it('returns undefined when the order book request fails', async () => {
    getSolverCompetitionMock.mockRejectedValue(new Error('not indexed'))

    await expect(getSolverCompetition(CHAIN_ID, TX_HASH)).resolves.toBeUndefined()
  })
})
