import { atom } from 'jotai'

import { alternativeOrderReadWriteAtomFactory } from 'modules/trade/state/alternativeOrder'

export type PartiallyFillableOverrideType = boolean | undefined
export type PartiallyFillableOverrideDispatcherType = [
  PartiallyFillableOverrideType,
  (update: PartiallyFillableOverrideType) => void
]

const regularPartiallyFillableOverrideAtom = atom<PartiallyFillableOverrideType>(undefined)
const alternativePartiallyFillableOverrideAtom = atom<PartiallyFillableOverrideType>(undefined)

export const partiallyFillableOverrideAtom = alternativeOrderReadWriteAtomFactory(
  regularPartiallyFillableOverrideAtom,
  alternativePartiallyFillableOverrideAtom
)
