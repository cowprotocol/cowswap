import { atom, Getter, PrimitiveAtom, Setter, WritableAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from 'modules/trade/types/TradeDerivedState'
import { ExtendedTradeRawState, getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'

import { isAlternativeOrderModalVisibleAtom } from 'common/state/alternativeOrder'

export interface LimitOrdersDerivedState extends TradeDerivedState {
  readonly isUnlocked: boolean
}

export interface LimitOrdersRawState extends ExtendedTradeRawState {
  readonly isUnlocked: boolean
}

export function getDefaultLimitOrdersState(chainId: SupportedChainId | null): LimitOrdersRawState {
  return {
    ...getDefaultTradeRawState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
    isUnlocked: false,
  }
}

// Regular form state

const regularLimitOrdersRawStateAtom = atomWithStorage<LimitOrdersRawState>(
  'limit-orders-atom:v4',
  getDefaultLimitOrdersState(null),
  getJotaiIsolatedStorage()
)

const regularUpdateLimitOrdersRawStateAtom = atom(
  null,
  updaterAtomFactory<typeof regularLimitOrdersRawStateAtom, LimitOrdersRawState>(regularLimitOrdersRawStateAtom)
)

const regularLimitOrdersDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})

// Alternative state for recreating/editing existing orders

const alternativeLimitOrdersRawStateAtom = atom<LimitOrdersRawState>(getDefaultLimitOrdersState(null))

const alternativeUpdateLimitOrdersRawStateAtom = atom(
  null,
  updaterAtomFactory<typeof alternativeLimitOrdersRawStateAtom, LimitOrdersRawState>(alternativeLimitOrdersRawStateAtom)
)

const alternativeLimitOrdersDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})

// Pick atom according to type of form user

export const limitOrdersRawStateAtom = atom(
  readFactory<LimitOrdersRawState, typeof regularLimitOrdersRawStateAtom, typeof alternativeLimitOrdersRawStateAtom>(
    regularLimitOrdersRawStateAtom,
    alternativeLimitOrdersRawStateAtom
  ),
  writeFactory<
    LimitOrdersRawState,
    LimitOrdersRawState,
    typeof regularLimitOrdersRawStateAtom,
    typeof alternativeLimitOrdersRawStateAtom
  >(regularLimitOrdersRawStateAtom, alternativeLimitOrdersRawStateAtom)
)

export const updateLimitOrdersRawStateAtom = atom(
  null,
  writeFactory<
    null,
    LimitOrdersRawState,
    typeof regularUpdateLimitOrdersRawStateAtom,
    typeof alternativeUpdateLimitOrdersRawStateAtom
  >(regularUpdateLimitOrdersRawStateAtom, alternativeUpdateLimitOrdersRawStateAtom)
)

export const limitOrdersDerivedStateAtom = atom(
  readFactory<
    LimitOrdersDerivedState,
    typeof regularLimitOrdersDerivedStateAtom,
    typeof alternativeLimitOrdersDerivedStateAtom
  >(regularLimitOrdersDerivedStateAtom, alternativeLimitOrdersDerivedStateAtom),
  writeFactory<
    LimitOrdersDerivedState,
    LimitOrdersDerivedState,
    typeof regularLimitOrdersDerivedStateAtom,
    typeof alternativeLimitOrdersDerivedStateAtom
  >(regularLimitOrdersDerivedStateAtom, alternativeLimitOrdersDerivedStateAtom)
)

// utils
function updaterAtomFactory<
  AtomType extends WritableAtom<AtomWriterParamType, [value: AtomWriterParamType], void>,
  AtomWriterParamType extends object
>(primitiveAtom: AtomType) {
  return (get: Getter, set: Setter, nextState: Partial<AtomWriterParamType>) => {
    const prevState = get(primitiveAtom)
    set(primitiveAtom, { ...prevState, ...nextState })
  }
}

function readFactory<
  AtomType,
  RegularAtom extends PrimitiveAtom<AtomType>,
  AlternativeAtom extends PrimitiveAtom<AtomType>
>(regular: RegularAtom, alternative: AlternativeAtom) {
  return (get: Getter) => get(get(isAlternativeOrderModalVisibleAtom) ? alternative : regular)
}

function writeFactory<
  AtomGetterType,
  AtomWriterParamType,
  RegularAtom extends WritableAtom<AtomGetterType, [value: AtomWriterParamType], void>,
  AlternativeAtom extends WritableAtom<AtomGetterType, [value: AtomWriterParamType], void>
>(regular: RegularAtom, alternative: AlternativeAtom) {
  return (get: Getter, set: Setter, value: AtomWriterParamType) => {
    if (get(isAlternativeOrderModalVisibleAtom)) {
      set(alternative, value)
    } else {
      set(regular, value)
    }
  }
}
