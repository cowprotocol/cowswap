import { atom, Getter, PrimitiveAtom, SetStateAction, Setter, WritableAtom } from 'jotai'

import { isAlternativeOrderModalVisibleAtom } from './atoms'

import { TradeType } from '../../types/TradeType'
import { tradeTypeAtom } from '../tradeTypeAtom'

function isAlternativeOrderContextEnabled(get: Getter): boolean {
  if (!get(isAlternativeOrderModalVisibleAtom)) return false

  const tradeTypeInfo = get(tradeTypeAtom)
  return tradeTypeInfo?.tradeType === TradeType.LIMIT_ORDER
}

function alternativeOrderAtomGetterFactory<AtomValue>(
  regular: PrimitiveAtom<AtomValue>,
  alternative: PrimitiveAtom<AtomValue>,
) {
  return (get: Getter) => get(isAlternativeOrderContextEnabled(get) ? alternative : regular)
}

type WritableWithOptionalSetterValue<GetterValue, SetterValue> = WritableAtom<
  GetterValue,
  [value: SetStateAction<SetterValue>],
  void
>

export function alternativeOrderAtomSetterFactory<AtomGetterValue, AtomWriterParamValue>(
  regular: WritableWithOptionalSetterValue<AtomGetterValue, AtomWriterParamValue>,
  alternative: WritableWithOptionalSetterValue<AtomGetterValue, AtomWriterParamValue>,
) {
  return (get: Getter, set: Setter, value: SetStateAction<AtomWriterParamValue>) => {
    if (isAlternativeOrderContextEnabled(get)) {
      set(alternative, value)
    } else {
      set(regular, value)
    }
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function alternativeOrderReadWriteAtomFactory<AtomType>(
  regular: WritableWithOptionalSetterValue<AtomType, AtomType>,
  alternative: WritableWithOptionalSetterValue<AtomType, AtomType>,
) {
  return atom(
    alternativeOrderAtomGetterFactory<AtomType>(regular, alternative),
    alternativeOrderAtomSetterFactory<AtomType, AtomType>(regular, alternative),
  )
}
