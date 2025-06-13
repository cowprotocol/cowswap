import { atom, Getter, PrimitiveAtom, SetStateAction, Setter, WritableAtom } from 'jotai'

import { isAlternativeOrderModalVisibleAtom } from './atoms'

function alternativeOrderAtomGetterFactory<AtomValue>(
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function alternativeOrderReadWriteAtomFactory<AtomType>(
  regular: WritableWithOptionalSetterValue<AtomType, SetStateAction<AtomType>>,
  alternative: WritableWithOptionalSetterValue<AtomType, SetStateAction<AtomType>>
) {
  return atom(
    alternativeOrderAtomGetterFactory<AtomType>(regular, alternative),
    alternativeOrderAtomSetterFactory<AtomType, AtomType>(regular, alternative)
  )
}
