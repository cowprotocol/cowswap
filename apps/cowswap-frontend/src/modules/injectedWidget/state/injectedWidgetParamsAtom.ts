import { atom } from 'jotai'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export const injectedWidgetParamsAtom = atom<CowSwapWidgetParams>({})
