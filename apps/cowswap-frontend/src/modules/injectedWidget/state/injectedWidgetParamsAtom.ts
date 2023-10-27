import { atom } from 'jotai'

import type { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

export const injectedWidgetParamsAtom = atom<CowSwapWidgetAppParams>({})
