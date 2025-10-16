import { atom } from 'jotai'

import { OptimisticAllowance } from './types'

export const optimisticAllowancesAtom = atom<Record<string, OptimisticAllowance>>({})
