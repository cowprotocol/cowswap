import { atom } from 'jotai'

import { VampireAttackContext } from '../types'

export const vampireAttackAtom = atom<VampireAttackContext | null>(null)
