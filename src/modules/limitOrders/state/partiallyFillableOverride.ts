import { atom, SetStateAction } from 'jotai'

export type PartiallyFillableOverrideType = boolean | undefined
export type PartiallyFillableOverrideDispatcherType = [
  PartiallyFillableOverrideType,
  (update?: SetStateAction<PartiallyFillableOverrideType>) => void
]

export const partiallyFillableOverrideAtom = atom<PartiallyFillableOverrideType>(undefined)
