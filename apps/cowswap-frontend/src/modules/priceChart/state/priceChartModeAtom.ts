import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import type { ChartMode } from '../lib/priceChart.types'

export const priceChartModeAtom = atomWithStorage<ChartMode>(
  'price-chart-mode:v0',
  'simple',
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
