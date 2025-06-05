import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from 'modules/trade/types/TradeDerivedState'
import { ExtendedTradeRawState, getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'

export interface SwapDerivedState extends TradeDerivedState {}

export interface SwapRawState extends ExtendedTradeRawState {}

export function getDefaultSwapState(chainId: SupportedChainId | null): SwapRawState {
  return {
    ...getDefaultTradeRawState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
  }
}

export const { atom: swapRawStateAtom, updateAtom: updateSwapRawStateAtom } = atomWithPartialUpdate(
  atomWithStorage<SwapRawState>('swapStateAtom:v1', getDefaultSwapState(null), getJotaiIsolatedStorage()),
)

export const swapDerivedStateAtom = atom<SwapDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
})
