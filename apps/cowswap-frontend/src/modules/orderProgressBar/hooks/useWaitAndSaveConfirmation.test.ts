import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { SolverCompetitionResponse, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { renderHook, type RenderHookResult } from '@testing-library/react'

import { useUsdAmount } from 'modules/usdAmount'

import { useSolversInfoByAddress } from 'common/hooks/useSolversInfoByAddress'

import { useWaitAndSaveConfirmation, type WaitAndSaveConfirmation } from './useWaitAndSaveConfirmation'
import { useWaitAndSaveSolverCompetition } from './useWaitAndSaveSolverCompetition'

import { formatGainFiat } from '../pure/WaitAndSaveOutcome/buildWaitAndSaveOutcome.utils'

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
const WAIVED_FEE_RAW = '250000'
const GAIN_FIAT = CurrencyAmount.fromRawAmount(USDC_MAINNET, 4_500000n)
const FEE_FIAT = CurrencyAmount.fromRawAmount(USDC_MAINNET, 300000n)
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

function renderConfirmation(
  enabled = true,
  waivedFeeAmount?: string,
): RenderHookResult<WaitAndSaveConfirmation, unknown> {
  return renderHook(() =>
    useWaitAndSaveConfirmation({
      buyToken: USDC_MAINNET,
      chainId: SupportedChainId.MAINNET,
      enabled,
      orderUid: ORDER_UID,
      waivedFeeAmount,
    }),
  )
}

describe('useWaitAndSaveConfirmation', () => {
  beforeEach(() => {
    useUsdAmountMock.mockImplementation((amount) => {
      if (!amount || !amount.greaterThan(0)) return { isLoading: false, value: null }
      if (amount.quotient.toString() === WAIVED_FEE_RAW) return { isLoading: false, value: FEE_FIAT }

      return { isLoading: false, value: GAIN_FIAT }
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

  it('returns the CoW strip without a waived fee when no quote delta was stored', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: COMPETITION, pending: false })

    const { result } = renderConfirmation()

    expect(result.current.pending).toBe(false)
    expect(result.current.strip).toEqual({ hasAloneBid: true, kind: 'cow' })
    expect(result.current.outcome).toMatchObject({ variant: 'withCow', tokenSymbol: 'USDC' })
    expect(result.current.outcome).not.toHaveProperty('volumeFeeSaved')
    expect(result.current.solvers?.[0]?.solver).toBeTruthy()
    expect(result.current.solvers?.[0]?.executedAmounts?.buy).toBe('1500000')
  })

  it('prices the stored quote delta separately from the solver-competition gain', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: COMPETITION, pending: false })

    const { result } = renderConfirmation(true, WAIVED_FEE_RAW)

    expect(result.current.outcome).toMatchObject({
      variant: 'withWaivedFeeAndCow',
      priceImprovement: formatGainFiat(GAIN_FIAT),
      volumeFeeSaved: formatGainFiat(FEE_FIAT),
    })
    if (result.current.outcome?.variant === 'withWaivedFeeAndCow') {
      expect(result.current.outcome.volumeFeeSaved).not.toBe(result.current.outcome.priceImprovement)
    }
  })

  it('omits a stored delta that is not positive', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: COMPETITION, pending: false })

    const { result } = renderConfirmation(true, '0')

    expect(result.current.outcome).toMatchObject({ variant: 'withCow' })
    expect(result.current.outcome).not.toHaveProperty('volumeFeeSaved')
  })

  it('falls back to the joined strip without a fee when the lookup times out and no delta was stored', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: undefined, pending: false })

    const { result } = renderConfirmation()

    expect(result.current).toEqual({
      outcome: undefined,
      pending: false,
      solvers: undefined,
      strip: { comparisonUnavailable: true, hasAloneBid: false, kind: 'joined' },
    })
  })

  it('prices a buy-order waived fee in the sell token', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: undefined, pending: false })

    renderHook(() =>
      useWaitAndSaveConfirmation({
        buyToken: USDC_MAINNET,
        chainId: SupportedChainId.MAINNET,
        enabled: true,
        feeToken: WETH_MAINNET,
        orderUid: ORDER_UID,
        waivedFeeAmount: WAIVED_FEE_RAW,
      }),
    )

    const pricedFee = useUsdAmountMock.mock.calls
      .map(([amount]) => amount)
      .find((amount) => amount?.currency.equals(WETH_MAINNET))

    expect(pricedFee?.quotient.toString()).toBe(WAIVED_FEE_RAW)
  })

  it('keeps the stored waived fee when the solver competition never arrives', () => {
    useWaitAndSaveSolverCompetitionMock.mockReturnValue({ competition: undefined, pending: false })

    const { result } = renderConfirmation(true, WAIVED_FEE_RAW)

    expect(result.current).toEqual({
      outcome: { variant: 'withWaivedFee', volumeFeeSavedFiat: formatGainFiat(FEE_FIAT) },
      pending: false,
      solvers: undefined,
      strip: { comparisonUnavailable: true, hasAloneBid: false, kind: 'joined' },
    })
  })
})
