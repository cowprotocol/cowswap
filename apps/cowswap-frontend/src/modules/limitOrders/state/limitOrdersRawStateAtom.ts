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

const regularRawStateAtom = atomWithStorage<LimitOrdersRawState>(
  'limit-orders-atom:v4',
  getDefaultLimitOrdersState(null),
  getJotaiIsolatedStorage()
)

const regularUpdateRawStateAtom = atom(
  null,
  updaterAtomSetterFactory<typeof regularRawStateAtom, LimitOrdersRawState>(regularRawStateAtom)
)

const regularDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})

// Alternative state for recreating/editing existing orders

const alternativeRawStateAtom = atom<LimitOrdersRawState>(getDefaultLimitOrdersState(null))

const alternativeUpdateRawStateAtom = atom(
  null,
  updaterAtomSetterFactory<typeof alternativeRawStateAtom, LimitOrdersRawState>(alternativeRawStateAtom)
)

const alternativeDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})

// Pick atom according to type of form displayed

export const limitOrdersRawStateAtom = readWriteAtomFactory<
  LimitOrdersRawState,
  typeof regularRawStateAtom,
  typeof alternativeRawStateAtom
>(regularRawStateAtom, alternativeRawStateAtom)

export const updateLimitOrdersRawStateAtom = atom(
  null,
  atomSetterFactory<
    null, // pass null to indicate there is no getter
    LimitOrdersRawState,
    typeof regularUpdateRawStateAtom,
    typeof alternativeUpdateRawStateAtom
  >(regularUpdateRawStateAtom, alternativeUpdateRawStateAtom)
)

export const limitOrdersDerivedStateAtom = readWriteAtomFactory<
  LimitOrdersDerivedState,
  typeof regularDerivedStateAtom,
  typeof alternativeDerivedStateAtom
>(regularDerivedStateAtom, alternativeDerivedStateAtom)

type SetStateAction<Value> = Value | ((prev: Value) => Value)
// ExtractAtomValue

// utils
function updaterAtomSetterFactory<
  AtomType extends WritableAtom<AtomWriterParamType, [value: AtomWriterParamType], void>,
  AtomWriterParamType extends object
>(primitiveAtom: AtomType) {
  return (get: Getter, set: Setter, nextState: Partial<AtomWriterParamType>) => {
    const prevState = get(primitiveAtom)
    set(primitiveAtom, { ...prevState, ...nextState })
  }
}

function atomGetterFactory<
  AtomType,
  RegularAtom extends PrimitiveAtom<AtomType>,
  AlternativeAtom extends PrimitiveAtom<AtomType>
>(regular: RegularAtom, alternative: AlternativeAtom) {
  return (get: Getter) => get(get(isAlternativeOrderModalVisibleAtom) ? alternative : regular)
}

function atomSetterFactory<
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

function readWriteAtomFactory<
  AtomType,
  RegularAtom extends WritableAtom<AtomType, [SetStateAction<AtomType>], void>,
  AlternativeAtom extends WritableAtom<AtomType, [SetStateAction<AtomType>], void>
>(regular: RegularAtom, alternative: AlternativeAtom) {
  return atom(
    atomGetterFactory<AtomType, RegularAtom, AlternativeAtom>(regular, alternative),
    atomSetterFactory<AtomType, AtomType, RegularAtom, AlternativeAtom>(regular, alternative)
  )
}
