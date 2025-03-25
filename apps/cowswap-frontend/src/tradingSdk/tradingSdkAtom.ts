import { atom } from 'jotai'

import { TradingSdk, TraderParameters } from '@cowprotocol/cow-sdk'

export const tradingSdkParamsAtom = atom<TraderParameters | null>(null)

// TODO: use single instance of the SDK
export const tradingSdkAtom = atom((get) => {
  const params = get(tradingSdkParamsAtom)

  if (!params) return null

  return new TradingSdk(params)
})
