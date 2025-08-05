import { atom } from 'jotai'

import { HookDappOrderParams } from '../../modules/hooksStore/types/hooks'

export const orderParamsStateAtom = atom<HookDappOrderParams | null>(null)
