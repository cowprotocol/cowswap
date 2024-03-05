import { atom } from 'jotai'

import { Order } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export type AlternativeOrder = {
  order: Order | ParsedOrder
  isEdit: boolean
} | null

/**
 * Main atom to control the alternative order modal/form
 * When it's set, the alternative flow should be displayed
 */
export const alternativeOrderAtom = atom<AlternativeOrder>(null)

/**
 * Derived atom that controls the alternative modal visibility
 */
export const isAlternativeOrderModalVisibleAtom = atom((get) => !!get(alternativeOrderAtom))
