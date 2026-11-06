import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import type { ChartMetric } from '../lib/priceChart.types'

export const priceChartMetricAtom = atomWithStorage<ChartMetric>(
  'priceChartMetric:v0',
  'price',
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
