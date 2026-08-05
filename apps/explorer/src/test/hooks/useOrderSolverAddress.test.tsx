import { renderHook, waitFor } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import { useNetworkId } from 'state/network'

import { getOrderCompetitionStatus, getSolverCompetitionByTxHash, Order, OrderCompetitionStatus } from 'api/operator'
import { fetchSolversInfo, SolverInfo } from 'utils/fetchSolversInfo'

import { useOrderSolver } from '../../hooks/useOrderSolver'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('api/operator', () => ({
  getOrderCompetitionStatus: jest.fn(),
  getSolverCompetitionByTxHash: jest.fn(),
}))

jest.mock('utils/fetchSolversInfo', () => ({
  fetchSolversInfo: jest.fn(),
}))

const mockedUseNetworkId = jest.mocked(useNetworkId)
const mockedGetOrderCompetitionStatus = jest.mocked(getOrderCompetitionStatus)
const mockedGetSolverCompetitionByTxHash = jest.mocked(getSolverCompetitionByTxHash)
const mockedFetchSolversInfo = jest.mocked(fetchSolversInfo)

const ZERO = new BigNumber(0)
const ONE = new BigNumber(1)

// Valid 42-char all-hex addresses, so `areAddressesEqual` and `shortenAddress` behave as in prod.
const CMS_ADDRESS_CHECKSUMMED = '0xAbCdEf0000000000000000000000000000000123'
const CMS_ADDRESS_LOWERCASE = CMS_ADDRESS_CHECKSUMMED.toLowerCase()
const UNKNOWN_ADDRESS = '0x2222222222222222222222222222222222222222'

function createMockOrder(): Order {
  return {
    uid: '0x1',
    owner: '0x1234',
    receiver: '0x5678',
    kind: 'sell',
    partiallyFillable: false,
    signature: '0x',
    class: 'limit',
    appData: '0x',
    fullAppData: null,
    executedFeeToken: null,
    creationDate: new Date(),
    expirationDate: new Date(),
    buyTokenAddress: '0xtoken1',
    sellTokenAddress: '0xtoken2',
    buyAmount: ONE,
    sellAmount: ONE,
    executedBuyAmount: ONE,
    executedSellAmount: ONE,
    feeAmount: ZERO,
    executedFeeAmount: ZERO,
    executedFee: null,
    totalFee: ZERO,
    cancelled: false,
    status: 'filled',
    partiallyFilled: false,
    fullyFilled: true,
    filledAmount: ONE,
    filledPercentage: new BigNumber(100),
    surplusAmount: ZERO,
    surplusPercentage: ZERO,
    txHash: '0xtx123',
  } as unknown as Order
}

function createSolver(address: string): SolverInfo {
  return {
    solverId: 'onchainSolver',
    displayName: 'On-chain Solver',
    image: 'https://example.com/onchain.png',
    networks: [],
    deployments: [{ chainId: 1, chainName: 'mainnet', address, active: true }],
  }
}

function mockCompetitionStatus(solver: string): OrderCompetitionStatus {
  return {
    type: 'traded' as OrderCompetitionStatus['type'],
    value: [{ solver, executedAmounts: { sell: '1', buy: '1' } }],
  }
}

/**
 * The competition `solver` field carries the on-chain solver address, so the CMS display name and
 * logo are joined on that address.
 */
describe('useOrderSolver - solver address resolution', () => {
  beforeEach(() => {
    jest.useRealTimers()
    mockedUseNetworkId.mockReset()
    mockedGetOrderCompetitionStatus.mockReset()
    mockedGetSolverCompetitionByTxHash.mockReset()
    mockedFetchSolversInfo.mockReset()

    mockedUseNetworkId.mockReturnValue(1)
  })

  it('resolves the CMS solver info when the order competition returns an address', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus(CMS_ADDRESS_LOWERCASE))
    mockedFetchSolversInfo.mockResolvedValueOnce([createSolver(CMS_ADDRESS_LOWERCASE)])

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: 'onchainSolver',
      displayName: 'On-chain Solver',
      image: 'https://example.com/onchain.png',
    })
    expect(mockedGetSolverCompetitionByTxHash).not.toHaveBeenCalled()
  })

  it('matches a checksummed CMS address against a lowercase competition address', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus(CMS_ADDRESS_LOWERCASE))
    mockedFetchSolversInfo.mockResolvedValueOnce([createSolver(CMS_ADDRESS_CHECKSUMMED)])

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver?.displayName).toBe('On-chain Solver')
  })

  it('matches a lowercase CMS address against a checksummed competition address', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus(CMS_ADDRESS_CHECKSUMMED))
    mockedFetchSolversInfo.mockResolvedValueOnce([createSolver(CMS_ADDRESS_LOWERCASE)])

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver?.displayName).toBe('On-chain Solver')
  })

  it('falls back to a shortened address when the address is not in CMS', async () => {
    mockedGetOrderCompetitionStatus.mockResolvedValueOnce(mockCompetitionStatus(UNKNOWN_ADDRESS))
    mockedFetchSolversInfo.mockResolvedValueOnce([createSolver(CMS_ADDRESS_CHECKSUMMED)])

    const { result } = renderHook(() => useOrderSolver(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.solver).toEqual({
      solverId: UNKNOWN_ADDRESS,
      displayName: '0x2222...2222',
      image: undefined,
    })
  })
})
