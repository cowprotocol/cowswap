import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

export const priceChartExpandedAtom = atomWithStorage<boolean>(
  'priceChartExpanded:v0',
  false,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
