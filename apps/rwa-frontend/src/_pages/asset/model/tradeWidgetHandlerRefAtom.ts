import { atom } from 'jotai'

import type { CowSwapWidgetHandler } from '@cowprotocol/widget-lib'

/** Ref the trade widget keeps its handler in, one per store */
export const tradeWidgetHandlerRefAtom = atom<{ current: CowSwapWidgetHandler | null }>(() => ({ current: null }))
