import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  DEFAULT_TRADE_DERIVED_STATE,
  ExtendedTradeRawState,
  getDefaultTradeRawState,
  TradeDerivedState,
} from 'modules/trade'

export interface SwapDerivedState extends TradeDerivedState {
  isUnlocked: boolean
}

export const DEFAULT_SWAP_DERIVED_STATE: SwapDerivedState = {
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: false,
}

export interface SwapRawState extends ExtendedTradeRawState {
  isUnlocked: boolean
}

export function getDefaultSwapState(chainId: SupportedChainId | null): SwapRawState {
  return {
    ...getDefaultTradeRawState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
    isUnlocked: false,
  }
}

export const { atom: swapRawStateAtom, updateAtom: updateSwapRawStateAtom } = atomWithPartialUpdate(
  atomWithStorage<SwapRawState>('swapStateAtom:v1', getDefaultSwapState(null), getJotaiIsolatedStorage()),
)

export const swapDerivedStateAtom = atom<SwapDerivedState>(DEFAULT_SWAP_DERIVED_STATE)
