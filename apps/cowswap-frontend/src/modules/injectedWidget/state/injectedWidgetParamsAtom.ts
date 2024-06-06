import { atom } from 'jotai'

import { jotaiStore } from '@cowprotocol/core'
import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

export type WidgetParamsErrors = Partial<{ [key in keyof CowSwapWidgetAppParams]: string[] | undefined }>

export const injectedWidgetParamsAtom = atom<{ params: Partial<CowSwapWidgetAppParams>; errors: WidgetParamsErrors }>({
  params: {},
  errors: {},
})

export const injectedWidgetPartnerFeeAtom = atom((get) => get(injectedWidgetParamsAtom).params.partnerFee)

// TODO: remove after test
jotaiStore.set(injectedWidgetParamsAtom, {
  params: {
    partnerFee: {
      bps: 100,
      recipient: '0xcA771eda0c70aA7d053aB1B25004559B918FE662',
    },
  },
  errors: {},
})
