import { atomWithStorage } from 'jotai/utils'

export const hwAccountIndexAtom = atomWithStorage<number>('hw-account-index:v1', 0)
