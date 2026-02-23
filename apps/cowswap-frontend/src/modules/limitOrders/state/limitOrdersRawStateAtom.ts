import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  alternativeOrderAtomSetterFactory,
  alternativeOrderReadWriteAtomFactory,
} from 'modules/trade/state/alternativeOrder'
import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from 'modules/trade/types/TradeDerivedState'
import { ExtendedTradeRawState, getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'

export interface LimitOrdersDerivedState extends TradeDerivedState {
  readonly isUnlocked: boolean
}

export interface LimitOrdersRawState extends ExtendedTradeRawState {
  readonly isUnlocked: boolean
}

export const DEFAULT_LIMIT_DERIVED_STATE: LimitOrdersDerivedState = {
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
}

export function getDefaultLimitOrdersState(chainId: SupportedChainId | null, isUnlocked = false): LimitOrdersRawState {
  return {
    ...getDefaultTradeRawState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
    isUnlocked,
  }
}

// Regular form state

const regularRawStateAtom = atomWithStorage<LimitOrdersRawState>(
  'limit-orders-atom:v4',
  getDefaultLimitOrdersState(null),
  getJotaiIsolatedStorage(),
)

const { updateAtom: regularUpdateRawStateAtom } = atomWithPartialUpdate(regularRawStateAtom)

const regularDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})

// Alternative state for recreating/editing existing orders

const alternativeRawStateAtom = atom<LimitOrdersRawState>(getDefaultLimitOrdersState(null, true))

const { updateAtom: alternativeUpdateRawStateAtom } = atomWithPartialUpdate(alternativeRawStateAtom)

const alternativeDerivedStateAtom = atom<LimitOrdersDerivedState>(DEFAULT_LIMIT_DERIVED_STATE)

// Pick atom according to type of form displayed

export const limitOrdersRawStateAtom = alternativeOrderReadWriteAtomFactory<LimitOrdersRawState>(
  regularRawStateAtom,
  alternativeRawStateAtom,
)

export const updateLimitOrdersRawStateAtom = atom(
  null,
  alternativeOrderAtomSetterFactory<
    null, // pass null to indicate there is no getter
    Partial<LimitOrdersRawState>
  >(regularUpdateRawStateAtom, alternativeUpdateRawStateAtom),
)

export const limitOrdersDerivedStateAtom = alternativeOrderReadWriteAtomFactory<LimitOrdersDerivedState>(
  regularDerivedStateAtom,
  alternativeDerivedStateAtom,
)
