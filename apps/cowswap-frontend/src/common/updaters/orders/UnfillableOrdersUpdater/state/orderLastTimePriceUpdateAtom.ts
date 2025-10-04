import { atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'

export const orderLastTimePriceUpdateAtom = atomWithStorage<Record<string, number>>(
  'order-last-time-price-update-atom:v1',
  {},
  getJotaiMergerStorage(),
  {
    unstable_getOnInit: true,
  },
)
