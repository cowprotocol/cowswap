import { atom } from 'jotai'

export const featureFlagsAtom = atom<Record<string, boolean | number>>({})
