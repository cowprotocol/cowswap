import { atom } from 'jotai'

/** Why an order failed, for the cases where the UI can say more than "it failed". */
export type OrderFailureReason = 'multisig-rejected'

/**
 * Keyed by order id. Deliberately not persisted: the reason is only worth showing while the
 * confirmation the user is looking at is still open, and a failed order is terminal, so nothing has to
 * survive a reload. The notification carries the same wording for the activity list.
 */
export const orderFailureReasonsAtom = atom<Record<string, OrderFailureReason>>({})
