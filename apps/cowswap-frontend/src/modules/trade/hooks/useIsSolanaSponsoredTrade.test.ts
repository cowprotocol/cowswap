import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { renderHook } from '@testing-library/react'

import { useTradeQuote } from 'modules/tradeQuote'

import { TradeType } from 'common/modules/tradeNavigation'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsSolanaSponsoredTrade } from './useIsSolanaSponsoredTrade'
import { useWalletAcceptsForeignFeePayer } from './useWalletAcceptsForeignFeePayer'

jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: jest.fn() }))
jest.mock('modules/tradeQuote', () => ({ useTradeQuote: jest.fn(), isSolanaQuoteAndPost: () => true }))
jest.mock('./useDerivedTradeState', () => ({ useDerivedTradeState: jest.fn() }))
jest.mock('./useWalletAcceptsForeignFeePayer', () => ({ useWalletAcceptsForeignFeePayer: jest.fn() }))

const mockUseFeatureFlags = jest.mocked(useFeatureFlags)
const mockUseTradeQuote = jest.mocked(useTradeQuote)
const mockUseDerivedTradeState = jest.mocked(useDerivedTradeState)
const mockUseWalletAcceptsForeignFeePayer = jest.mocked(useWalletAcceptsForeignFeePayer)

const FUNDER = 'Co1dPLQ6ZBWbKTFXrmcCzfkfRCCVRuSzDCtYkUwEqTYD'

function setQuote(funder: string | undefined): void {
  mockUseTradeQuote.mockReturnValue({ quote: { solanaQuote: { funder } } } as unknown as ReturnType<
    typeof useTradeQuote
  >)
}

beforeEach(() => {
  mockUseFeatureFlags.mockReturnValue({ isSolanaSponsoredOrdersEnabled: true })
  mockUseDerivedTradeState.mockReturnValue({ tradeType: TradeType.SWAP } as ReturnType<typeof useDerivedTradeState>)
  mockUseWalletAcceptsForeignFeePayer.mockReturnValue(true)
  setQuote(FUNDER)
})

describe('useIsSolanaSponsoredTrade', () => {
  it('sponsors a swap once the quote names a funder', () => {
    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(true)
  })

  // The costs this drives have to match what `useSolanaFlowOptions` tells the flow: showing a
  // sponsored price while the flow makes the owner pay would understate the SOL they need.
  it('does not sponsor while the wallet rejects a foreign fee payer', () => {
    mockUseWalletAcceptsForeignFeePayer.mockReturnValue(false)

    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(false)
  })

  it('does not sponsor while the feature flag is off', () => {
    mockUseFeatureFlags.mockReturnValue({})

    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(false)
  })

  it('does not sponsor a limit order', () => {
    mockUseDerivedTradeState.mockReturnValue({ tradeType: TradeType.LIMIT_ORDER } as ReturnType<
      typeof useDerivedTradeState
    >)

    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(false)
  })

  it('does not sponsor while the quote names no funder', () => {
    setQuote(undefined)

    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(false)
  })
})
