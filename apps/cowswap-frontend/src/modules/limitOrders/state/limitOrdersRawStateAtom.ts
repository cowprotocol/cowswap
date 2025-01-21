import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomWithPartialUpdate, getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { parseUnits } from '@ethersproject/units'

import {
  alternativeOrderAtomSetterFactory,
  alternativeOrderReadWriteAtomFactory,
} from 'modules/trade/state/alternativeOrder'
import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from 'modules/trade/types/TradeDerivedState'
import { ExtendedTradeRawState, getDefaultCurrencies, getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'

export interface LimitOrdersDerivedState extends TradeDerivedState {
  readonly isUnlocked: boolean
}

export interface LimitOrdersRawState extends ExtendedTradeRawState {
  readonly isUnlocked: boolean
}

export function getDefaultLimitOrdersState(chainId: SupportedChainId | null, isUnlocked = false): LimitOrdersRawState {
  const defaultState = getDefaultTradeRawState(chainId)
  const { inputCurrency } = getDefaultCurrencies(chainId)
  const inputCurrencyAmount = inputCurrency ? parseUnits('1', inputCurrency.decimals).toString() : null // defaults to selling 1 unit of input currency

  return {
    ...defaultState,
    inputCurrencyAmount,
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
    isUnlocked,
  }
}

// Regular form state

const regularRawStateAtom = atomWithStorage<LimitOrdersRawState>(
  'limit-orders-atom:v4',
  getDefaultLimitOrdersState(getRawCurrentChainIdFromUrl()),
  getJotaiIsolatedStorage(),
)

const { updateAtom: regularUpdateRawStateAtom } = atomWithPartialUpdate(regularRawStateAtom)

const regularDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})

// Alternative state for recreating/editing existing orders

const alternativeRawStateAtom = atom<LimitOrdersRawState>(
  getDefaultLimitOrdersState(getRawCurrentChainIdFromUrl(), true),
)

const { updateAtom: alternativeUpdateRawStateAtom } = atomWithPartialUpdate(alternativeRawStateAtom)

const alternativeDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})

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
