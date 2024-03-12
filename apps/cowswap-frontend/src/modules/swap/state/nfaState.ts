import { atomWithStorage } from 'jotai/utils'

export const nfaStateAtom = atomWithStorage<boolean>('nfaStateAtom:v0', false)
