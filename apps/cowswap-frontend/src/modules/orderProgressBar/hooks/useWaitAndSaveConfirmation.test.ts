import { USDC_MAINNET } from '@cowprotocol/common-const'
import { SolverCompetitionResponse, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { renderHook, type RenderHookResult } from '@testing-library/react'

import { useUsdAmount } from 'modules/usdAmount'

import { useSolversInfoByAddress } from 'common/hooks/useSolversInfoByAddress'

import { useWaitAndSaveConfirmation, type WaitAndSaveConfirmation } from './useWaitAndSaveConfirmation'
import { useWaitAndSaveSolverCompetition } from './useWaitAndSaveSolverCompetition'

jest.mock('./useWaitAndSaveSolverCompetition', () => ({
  useWaitAndSaveSolverCompetition: jest.fn(),
}))

jest.mock('modules/usdAmount', () => ({
  useUsdAmount: jest.fn(),
}))

jest.mock('common/hooks/useSolversInfoByAddress', () => ({
  useSolversInfoByAddress: jest.fn(),
}))

const useWaitAndSaveSolverCompetitionMock = useWaitAndSaveSolverCompetition as jest.MockedFunction<
  typeof useWaitAndSaveSolverCompetition
>
const useUsdAmountMock = useUsdAmount as jest.MockedFunction<typeof useUsdAmount>
const useSolversInfoByAddressMock = useSolversInfoByAddress as jest.MockedFunction<typeof useSolversInfoByAddress>

const ORDER_UID = '0xabc'
const WINNER = '0x1111111111111111111111111111111111111111'
const ALONE = '0x2222222222222222222222222222222222222222'

const COMPETITION = {
  solutions: [
    {
      isWinner: true,
      orders: [
        { buyAmount: '1500000', id: ORDER_UID, sellAmount: '10' },
        { buyAmount: '1', id: '0xother', sellAmount: '1' },
      ],
      ranking: 1,
      solverAddress: WINNER,
    },
    {
      orders: [{ buyAmount: '1000000', id: ORDER_UID, sellAmount: '10' }],
      ranking: 2,
      solverAddress: ALONE,
    },
  ],
} as SolverCompetitionResponse

function renderConfirmation(enabled = true): RenderHookResult<WaitAndSaveConfirmation, unknown> {
  return renderHook(() =>
    useWaitAndSaveConfirmation({
      buyToken: USDC_MAINNET,
      chainId: SupportedChainId.MAINNET,
      enabled,
      orderUid: ORDER_UID,
    }),
  )
}

describe('useWaitAndSaveConfirmation', () => {
  beforeEach(() => {
    useUsdAmountMock.mockReturnValue({
      isLoading: false,
      value: CurrencyAmount.fromRawAmount(USDC_MAINNET, 4_500000n),
    })
    useSolversInfoByAddressMock.mockReturnValue({})
  })

  it('stays idle when Wait & Save is off', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: COMPETITION, pending: true })

    const { result } = renderConfirmation(false)

    expect(result.current).toEqual({
      outcome: undefined,
      pending: false,
      solvers: undefined,
      strip: undefined,
    })
  })

  it('holds the confirmation while the competition lookup is in flight', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: undefined, pending: true })

    const { result } = renderConfirmation()

    expect(result.current.pending).toBe(true)
    expect(result.current.strip).toBeUndefined()
    expect(result.current.outcome).toBeUndefined()
  })

  it('returns the CoW strip, green-card amounts, and winner-first solvers', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: COMPETITION, pending: false })

    const { result } = renderConfirmation()

    expect(result.current.pending).toBe(false)
    expect(result.current.strip).toEqual({ hasAloneBid: true, kind: 'cow' })
    expect(result.current.outcome?.gainAmount).toBeTruthy()
    expect(result.current.outcome?.gainFiat.startsWith('$')).toBe(true)
    expect(result.current.outcome?.tokenSymbol).toBe('USDC')
    expect(result.current.solvers?.[0]?.solver).toBeTruthy()
    expect(result.current.solvers?.[0]?.executedAmounts?.buy).toBe('1500000')
  })

  it('falls back to joined the batch when the lookup times out', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: undefined, pending: false })

    const { result } = renderConfirmation()

    expect(result.current).toEqual({
      outcome: undefined,
      pending: false,
      solvers: undefined,
      strip: { comparisonUnavailable: true, hasAloneBid: false, kind: 'joined' },
    })
  })
})
