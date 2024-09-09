import { atom } from 'jotai'

import { HookDappOrderParams } from '@cowprotocol/types'

export const orderParamsStateAtom = atom<HookDappOrderParams | null>(null)
