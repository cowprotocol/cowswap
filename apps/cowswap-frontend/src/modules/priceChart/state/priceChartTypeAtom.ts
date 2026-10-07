import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import type { ChartType } from '../lib/priceChart.utils'

export const priceChartTypeAtom = atomWithStorage<ChartType>('priceChartType:v0', 'line', getJotaiIsolatedStorage(), {
  getOnInit: true,
})
