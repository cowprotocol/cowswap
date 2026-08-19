import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import type { PriceChartSupplyBasis } from '../lib/priceChart.types'

export const priceChartSupplyBasisAtom = atomWithStorage<PriceChartSupplyBasis>(
  'price-chart-supply-basis:v0',
  'circulating',
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
