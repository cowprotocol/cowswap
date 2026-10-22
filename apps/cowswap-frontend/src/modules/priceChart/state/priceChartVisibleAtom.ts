import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import { tradeTypeAtom } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

const defaultPriceChartVisibleAtom = atomWithStorage<boolean>(
  'price-chart-visible:v0',
  true,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

const swapPriceChartVisibleAtom = atomWithStorage<boolean>(
  'swapPriceChartVisible:v0',
  false,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)

const currentPriceChartVisibleAtom = atom((get) =>
  get(tradeTypeAtom)?.tradeType === TradeType.SWAP ? swapPriceChartVisibleAtom : defaultPriceChartVisibleAtom,
)

export const priceChartVisibleAtom = atom(
  (get) => get(get(currentPriceChartVisibleAtom)),
  (get, set, update: boolean | ((value: boolean) => boolean)) => set(get(currentPriceChartVisibleAtom), update),
)
