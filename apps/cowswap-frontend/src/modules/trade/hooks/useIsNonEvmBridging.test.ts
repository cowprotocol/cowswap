import { EvmChains, NonEvmChains } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useIsNonEvmBridging } from './useIsNonEvmBridging'

import { TradeDerivedState } from '../types/TradeDerivedState'

jest.mock('./useIsCurrentTradeBridging', () => ({ useIsCurrentTradeBridging: jest.fn() }))
jest.mock('./useDerivedTradeState', () => ({ useDerivedTradeState: jest.fn() }))

const mockUseIsCurrentTradeBridging = useIsCurrentTradeBridging as jest.MockedFunction<typeof useIsCurrentTradeBridging>
const mockUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>

const SOL_CHAIN_ID = NonEvmChains.SOLANA
const ETH_CHAIN_ID = EvmChains.MAINNET

function makeState(chainId: number): TradeDerivedState {
  return {
    outputCurrency: { chainId } as TradeDerivedState['outputCurrency'],
  } as TradeDerivedState
}

function render(): boolean {
  return renderHook(() => useIsNonEvmBridging()).result.current
}

describe('useIsNonEvmBridging', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsCurrentTradeBridging.mockReturnValue(false)
    mockUseDerivedTradeState.mockReturnValue(null)
  })

  it('returns false when not bridging', () => {
    mockUseIsCurrentTradeBridging.mockReturnValue(false)
    mockUseDerivedTradeState.mockReturnValue(makeState(SOL_CHAIN_ID))
    expect(render()).toBe(false)
  })

  it('returns false when bridging to an EVM chain', () => {
    mockUseIsCurrentTradeBridging.mockReturnValue(true)
    mockUseDerivedTradeState.mockReturnValue(makeState(ETH_CHAIN_ID))
    expect(render()).toBe(false)
  })

  it('returns true when bridging to a non-EVM chain (Solana)', () => {
    mockUseIsCurrentTradeBridging.mockReturnValue(true)
    mockUseDerivedTradeState.mockReturnValue(makeState(SOL_CHAIN_ID))
    expect(render()).toBe(true)
  })

  it('returns false when bridging but outputCurrency is null', () => {
    mockUseIsCurrentTradeBridging.mockReturnValue(true)
    mockUseDerivedTradeState.mockReturnValue({ outputCurrency: null } as TradeDerivedState)
    expect(render()).toBe(false)
  })

  it('returns false when derivedTradeState is null', () => {
    mockUseIsCurrentTradeBridging.mockReturnValue(true)
    mockUseDerivedTradeState.mockReturnValue(null)
    expect(render()).toBe(false)
  })
})
