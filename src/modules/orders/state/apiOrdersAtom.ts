import { atom } from 'jotai'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

export const apiOrdersAtom = atom<EnrichedOrder[]>([])
