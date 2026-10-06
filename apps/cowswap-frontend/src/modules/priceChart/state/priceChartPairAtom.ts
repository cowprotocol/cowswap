import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import type { ChartPair } from '../lib/chart.types'

export const priceChartPairAtom = atomWithStorage<ChartPair>(
  'priceChartSelection:v0',
  'sell-usd',
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
