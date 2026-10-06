import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import type { SupplyVariant } from '../lib/chart.types'

export const priceChartSupplyVariantAtom = atomWithStorage<SupplyVariant>(
  'price-chart-supply-basis:v0',
  'circulating',
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
