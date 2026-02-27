import { renderHook, waitFor } from '@testing-library/react'
import { useNetworkId } from 'state/network'

import { getSolverCompetitionByTxHash, SolverCompetitionResponse } from 'api/operator'
import { SolverInfo, fetchSolversInfo } from 'utils/fetchSolversInfo'

import { useTradeSolver } from '../../hooks/useOrderSolver'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('api/operator', () => ({
  getSolverCompetitionByTxHash: jest.fn(),
}))

jest.mock('utils/fetchSolversInfo', () => ({
  fetchSolversInfo: jest.fn(),
}))

const mockedUseNetworkId = jest.mocked(useNetworkId)
const mockedGetSolverCompetitionByTxHash = jest.mocked(getSolverCompetitionByTxHash)
const mockedFetchSolversInfo = jest.mocked(fetchSolversInfo)

const MOCK_SOLVERS: SolverInfo[] = [
  {
    solverId: 'projectblanc',
    displayName: 'Project Blanc',
    image: 'https://example.com/blanc.png',
    networks: [],
    deployments: [],
  },
]

function mockSolverCompetitionResponse(solverName: string): SolverCompetitionResponse {
  return {
    auctionId: 1,
    solutions: [
      {
        solver: solverName,
        isWinner: true,
        solverAddress: '0xsolver',
        ranking: 1,
        orders: [],
      } as unknown as NonNullable<SolverCompetitionResponse['solutions']>[0],
    ],
  } as SolverCompetitionResponse
}

describe('useTradeSolver', () => {
  beforeEach(() => {
    mockedUseNetworkId.mockReset()
    mockedGetSolverCompetitionByTxHash.mockReset()
    mockedFetchSolversInfo.mockReset()

    mockedUseNetworkId.mockReturnValue(1)
  })

  it('returns no loading and no solver for null txHash', () => {
    const { result } = renderHook(() => useTradeSolver(null))

    expect(result.current.solver).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('resolves solver from txHash competition data', async () => {
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce(mockSolverCompetitionResponse('projectblanc'))
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useTradeSolver('0xtx123'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'projectblanc',
      displayName: 'Project Blanc',
      image: 'https://example.com/blanc.png',
    })
  })

  it('returns undefined solver when no winner in competition', async () => {
    mockedGetSolverCompetitionByTxHash.mockResolvedValueOnce({
      auctionId: 1,
      solutions: [],
    } as unknown as SolverCompetitionResponse)
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useTradeSolver('0xtx456'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toBeUndefined()
  })

  it('handles API failure gracefully', async () => {
    mockedGetSolverCompetitionByTxHash.mockRejectedValueOnce(new Error('API down'))
    mockedFetchSolversInfo.mockResolvedValueOnce(MOCK_SOLVERS)

    const { result } = renderHook(() => useTradeSolver('0xtx789'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toBeUndefined()
  })
})
