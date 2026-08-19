import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import type { PriceChartMode } from '../lib/priceChart.types'

export const priceChartModeAtom = atomWithStorage<PriceChartMode>(
  'price-chart-mode:v0',
  'simple',
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
