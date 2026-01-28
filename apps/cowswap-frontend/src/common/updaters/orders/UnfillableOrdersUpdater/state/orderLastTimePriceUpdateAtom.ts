import { atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'

export const orderLastTimePriceUpdateAtom = atomWithStorage<Record<string, number>>(
  'orderLastTimePriceUpdateAtom:v1',
  {},
  getJotaiMergerStorage(),
  {
    getOnInit: true,
  },
)
