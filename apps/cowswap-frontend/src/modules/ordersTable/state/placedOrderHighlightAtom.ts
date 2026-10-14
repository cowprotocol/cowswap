import { atom } from 'jotai'

import { OrderTabId } from 'entities/routes/routes.atom'

export interface PlacedOrderHighlight {
  orderId: string | null
  tabId: OrderTabId
}

export const placedOrderHighlightAtom = atom<PlacedOrderHighlight | null>(null)
