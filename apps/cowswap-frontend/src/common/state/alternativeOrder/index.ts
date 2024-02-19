import { atom, Getter, PrimitiveAtom, SetStateAction, Setter, useAtomValue, useSetAtom, WritableAtom } from 'jotai'
import { useCallback } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

/**
 * Main atom to control the alternative order modal/form
 * When it's set, the alternative flow should be displayed
 */
const alternativeOrderAtom = atom<Order | ParsedOrder | null>(null)

/**
 * Derived atom that controls the alternative modal visibility
 */
export const isAlternativeOrderModalVisibleAtom = atom((get) => !!get(alternativeOrderAtom))

export function useIsAlternativeOrderModalVisible() {
  return useAtomValue(isAlternativeOrderModalVisibleAtom)
}

export function useHideAlternativeOrderModal() {
  const setAlternativeOrderAtom = useSetAtom(alternativeOrderAtom)

  return useCallback(() => setAlternativeOrderAtom(null), [setAlternativeOrderAtom])
}

export function useAlternativeOrder() {
  return useAtomValue(alternativeOrderAtom)
}

export function useSetAlternativeOrder() {
  const setAlternativeOrder = useSetAtom(alternativeOrderAtom)

  return useCallback(
    (order: Order | ParsedOrder) => {
      // TODO: remove log
      console.log(`bug:useSetAlternativeOrder callback`, order)
      setAlternativeOrder(order)
    },
    [setAlternativeOrder]
  )
}

// TODO: move to its own file
// atom factory helpers

export function alternativeOrderAtomGetterFactory<AtomValue>(
  regular: PrimitiveAtom<AtomValue>,
  alternative: PrimitiveAtom<AtomValue>
) {
  return (get: Getter) => get(get(isAlternativeOrderModalVisibleAtom) ? alternative : regular)
}

type WritableWithOptionalSetterValue<GetterValue, SetterValue> = WritableAtom<GetterValue, [value: SetterValue], void>

export function alternativeOrderAtomSetterFactory<AtomGetterValue, AtomWriterParamValue>(
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

export function alternativeOrderReadWriteAtomFactory<AtomType>(
  regular: WritableWithOptionalSetterValue<AtomType, SetStateAction<AtomType>>,
  alternative: WritableWithOptionalSetterValue<AtomType, SetStateAction<AtomType>>
) {
  return atom(
    alternativeOrderAtomGetterFactory<AtomType>(regular, alternative),
    alternativeOrderAtomSetterFactory<AtomType, AtomType>(regular, alternative)
  )
}
