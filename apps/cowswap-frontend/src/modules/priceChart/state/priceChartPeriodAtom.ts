import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import type { TimeRange } from '../lib/priceChart.types'

export const priceChartPeriodAtom = atomWithStorage<TimeRange>('priceChartPeriod:v0', '1D', getJotaiIsolatedStorage(), {
  getOnInit: true,
})
