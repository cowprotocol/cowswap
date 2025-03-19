import { atom } from 'jotai'

import { TradingSdk, TraderParameters } from '@cowprotocol/cow-sdk'

import { atomWithCache } from 'jotai-cache'

export const tradingSdkParamsAtom = atom<TraderParameters | null>(null)

export const tradingSdkAtom = atomWithCache((get) => {
  const params = get(tradingSdkParamsAtom)

  if (!params) return null

  return new TradingSdk(params)
})
