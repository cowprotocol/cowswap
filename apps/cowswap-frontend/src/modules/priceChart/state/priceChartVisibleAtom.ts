import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

export const priceChartVisibleAtom = atomWithStorage<boolean>(
  'price-chart-visible:v0',
  true,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
