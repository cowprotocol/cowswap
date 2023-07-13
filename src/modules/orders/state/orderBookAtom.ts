import { atom } from 'jotai'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

export const orderBookAtom = atom<EnrichedOrder[]>([])
