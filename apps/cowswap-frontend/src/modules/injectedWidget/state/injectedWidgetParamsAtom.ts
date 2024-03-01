import { atom } from 'jotai'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export type WidgetParamsErrors = Partial<{ [key in keyof CowSwapWidgetParams]: string[] | undefined }>

export const injectedWidgetParamsAtom = atom<{ params: Partial<CowSwapWidgetParams>; errors: WidgetParamsErrors }>({
  params: {},
  errors: {},
})
