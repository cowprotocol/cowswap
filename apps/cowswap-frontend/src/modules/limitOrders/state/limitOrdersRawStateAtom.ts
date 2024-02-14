import { atom, Getter, PrimitiveAtom, SetStateAction, Setter, WritableAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
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

export function getDefaultLimitOrdersState(
  chainId: SupportedChainId | null,
  isUnlocked: boolean = false
): LimitOrdersRawState {
  return {
    ...getDefaultTradeRawState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    orderKind: OrderKind.BUY,
    isUnlocked,
  }
}

// Regular form state

const regularRawStateAtom = atomWithStorage<LimitOrdersRawState>(
  'limit-orders-atom:v4',
  getDefaultLimitOrdersState(null),
  getJotaiIsolatedStorage()
)

const { updateAtom: regularUpdateRawStateAtom } = atomWithPartialUpdate(regularRawStateAtom)

const regularDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})

// Alternative state for recreating/editing existing orders

const alternativeRawStateAtom = atom<LimitOrdersRawState>(getDefaultLimitOrdersState(null, true))

const { updateAtom: alternativeUpdateRawStateAtom } = atomWithPartialUpdate(alternativeRawStateAtom)

const alternativeDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})

// Pick atom according to type of form displayed

export const limitOrdersRawStateAtom = readWriteAtomFactory<LimitOrdersRawState>(
  regularRawStateAtom,
  alternativeRawStateAtom
)

export const updateLimitOrdersRawStateAtom = atom(
  null,
  atomSetterFactory<
    null, // pass null to indicate there is no getter
    LimitOrdersRawState
  >(regularUpdateRawStateAtom, alternativeUpdateRawStateAtom)
)

export const limitOrdersDerivedStateAtom = readWriteAtomFactory<LimitOrdersDerivedState>(
  regularDerivedStateAtom,
  alternativeDerivedStateAtom
)

// utils

function atomGetterFactory<AtomValue>(regular: PrimitiveAtom<AtomValue>, alternative: PrimitiveAtom<AtomValue>) {
  return (get: Getter) => get(get(isAlternativeOrderModalVisibleAtom) ? alternative : regular)
}

type WritableWithOptionalSetterValue<GetterValue, SetterValue> = WritableAtom<GetterValue, [value: SetterValue], void>

function atomSetterFactory<AtomGetterValue, AtomWriterParamValue>(
  regular: WritableWithOptionalSetterValue<AtomGetterValue, AtomWriterParamValue>,
  alternative: WritableWithOptionalSetterValue<AtomGetterValue, AtomWriterParamValue>
) {
  return (get: Getter, set: Setter, value: AtomWriterParamValue) => {
    if (get(isAlternativeOrderModalVisibleAtom)) {
      set(alternative, value)
    } else {
      set(regular, value)
    }
  }
}

function readWriteAtomFactory<AtomType>(
  regular: WritableWithOptionalSetterValue<AtomType, SetStateAction<AtomType>>,
  alternative: WritableWithOptionalSetterValue<AtomType, SetStateAction<AtomType>>
) {
  return atom(
    atomGetterFactory<AtomType>(regular, alternative),
    atomSetterFactory<AtomType, AtomType>(regular, alternative)
  )
}
