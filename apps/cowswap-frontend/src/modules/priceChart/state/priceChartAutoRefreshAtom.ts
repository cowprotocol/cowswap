import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

export const priceChartAutoRefreshAtom = atomWithStorage(
  'price-chart-auto-refresh:v0',
  true,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
