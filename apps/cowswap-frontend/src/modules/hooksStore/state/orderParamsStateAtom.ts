import { atom } from 'jotai'

import { HookDappOrderParams } from '../types/hooks'

export const orderParamsStateAtom = atom<HookDappOrderParams | null>(null)
