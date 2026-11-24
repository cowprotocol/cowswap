import { useAtomValue, useSetAtom } from 'jotai'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { render, waitFor } from '@testing-library/react'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useAppDataBuildParams, useEnableWaitForCow } from 'modules/appData'
import {
  canonicalBatchScheduleAtom,
  isCanonicalBatchScheduleErrorAtom,
  useIsHooksTradeType,
  useIsWaitAndSaveAvailable,
  waitAndSaveEnabledAtom,
} from 'modules/trade'
import { useQuoteParams, useTradeQuote } from 'modules/tradeQuote'

import { buildWaitAndSaveComparisonRequest } from './buildWaitAndSaveComparisonRequest'
import { WaitAndSaveComparisonQuoteUpdater } from './WaitAndSaveComparisonQuoteUpdater'

import { useSwapDerivedState } from '../hooks/useSwapDerivedState'

jest.mock('jotai', () => ({
  useAtomValue: jest.fn(),
  useSetAtom: jest.fn(),
}))

jest.mock('@cowprotocol/sdk-bridging', () => ({
  isBridgeQuoteAndPost: () => false,
}))

jest.mock('tradingSdk/bridgingSdk', () => ({
  bridgingSdk: { getQuote: jest.fn() },
}))

jest.mock('modules/appData', () => ({
  useAppDataBuildParams: jest.fn(),
  useEnableWaitForCow: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  canonicalBatchScheduleAtom: Symbol('canonicalBatchScheduleAtom'),
  isCanonicalBatchScheduleErrorAtom: Symbol('isCanonicalBatchScheduleErrorAtom'),
  useIsHooksTradeType: jest.fn(),
  useIsWaitAndSaveAvailable: jest.fn(),
  waitAndSaveComparisonQuoteAtom: Symbol('waitAndSaveComparisonQuoteAtom'),
  waitAndSaveEnabledAtom: Symbol('waitAndSaveEnabledAtom'),
}))

jest.mock('modules/tradeQuote', () => ({
  useQuoteParams: jest.fn(),
  useTradeQuote: jest.fn(),
}))

jest.mock('modules/usdAmount', () => ({
  useUsdPrice: () => null,
}))

jest.mock('../hooks/useSwapDerivedState', () => ({
  useSwapDerivedState: jest.fn(),
}))

jest.mock('./buildWaitAndSaveComparisonRequest', () => ({
  buildWaitAndSaveComparisonRequest: jest.fn(),
}))

const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const setComparison = jest.fn()
const schedule = { intervalSeconds: 300, nextBatch: 200, nextBatchValidTo: 400 }
const quoteParams = { validFor: 1_800 }
const appDataParams = { orderClass: 'market', slippageBips: 50 }

describe('WaitAndSaveComparisonQuoteUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useSetAtom).mockReturnValue(setComparison as never)
    jest.mocked(useIsWaitAndSaveAvailable).mockReturnValue(true)
    jest.mocked(useIsHooksTradeType).mockReturnValue(false)
    jest.mocked(useSwapDerivedState).mockReturnValue({
      inputCurrencyAmount: { quotient: { toString: () => '1000' } },
      orderKind: OrderKind.SELL,
    } as ReturnType<typeof useSwapDerivedState>)
    jest.mocked(useQuoteParams).mockReturnValue({ quoteParams } as ReturnType<typeof useQuoteParams>)
    jest.mocked(useTradeQuote).mockReturnValue({
      error: null,
      isLoading: false,
      quote: { quoteResults: { quoteResponse: { quote: { buyAmount: '100' } } } },
    } as ReturnType<typeof useTradeQuote>)
    jest.mocked(useAppDataBuildParams).mockReturnValue(appDataParams as ReturnType<typeof useAppDataBuildParams>)
    jest.mocked(buildWaitAndSaveComparisonRequest).mockImplementation(async (params) => ({
      advancedSettings: { appData: { metadata: { enableWaitForCow: params.isOnQuote } } },
      isOnQuote: params.isOnQuote,
      quoteParams: params.quoteParams,
    }))
    jest.mocked(bridgingSdk.getQuote).mockResolvedValue({
      quoteResults: { quoteResponse: { quote: { buyAmount: '130' } } },
    } as never)
    useAtomValueMock.mockImplementation((atom) => {
      if (atom === canonicalBatchScheduleAtom) return schedule
      if (atom === isCanonicalBatchScheduleErrorAtom) return false
      if (atom === waitAndSaveEnabledAtom) return jest.mocked(useEnableWaitForCow).getMockImplementation()?.() ?? false

      throw new Error('unexpected atom')
    })
  })

  it('fetches the on-quote when Wait & Save is off', async () => {
    jest.mocked(useEnableWaitForCow).mockReturnValue(false)

    render(<WaitAndSaveComparisonQuoteUpdater slippageBips={50} />)

    await waitFor(() => {
      expect(buildWaitAndSaveComparisonRequest).toHaveBeenCalledWith(
        expect.objectContaining({ isOnQuote: true, quoteParams }),
      )
    })
    await waitFor(() => {
      expect(setComparison).toHaveBeenCalledWith({
        buyAmount: '130',
        isOnQuote: true,
        mainBuyAmount: '100',
      })
    })
    expect(jest.mocked(bridgingSdk.getQuote).mock.calls[0]?.[0]).toEqual(expect.objectContaining({ validFor: 1_800 }))
  })

  it('fetches the off-quote when Wait & Save is on', async () => {
    jest.mocked(useEnableWaitForCow).mockReturnValue(true)
    useAtomValueMock.mockImplementation((atom) => {
      if (atom === canonicalBatchScheduleAtom) return schedule
      if (atom === isCanonicalBatchScheduleErrorAtom) return false
      if (atom === waitAndSaveEnabledAtom) return true

      throw new Error('unexpected atom')
    })

    render(<WaitAndSaveComparisonQuoteUpdater slippageBips={50} />)

    await waitFor(() => {
      expect(buildWaitAndSaveComparisonRequest).toHaveBeenCalledWith(expect.objectContaining({ isOnQuote: false }))
    })
    expect(jest.mocked(bridgingSdk.getQuote).mock.calls[0]?.[0]).toEqual(expect.objectContaining({ validFor: 1_800 }))
  })
})
