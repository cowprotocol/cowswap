import { atom } from 'jotai'

import { TradeTypeInfo } from '../../../common/modules/tradeNavigation'

export const tradeTypeAtom = atom<TradeTypeInfo | null>(null)
