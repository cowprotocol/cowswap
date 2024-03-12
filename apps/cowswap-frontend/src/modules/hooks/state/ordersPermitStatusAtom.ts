import { atom } from 'jotai'

import { PermitHookData } from '../types'

export const hooksAtom = atom<PermitHookData[]>([])
