import { atom } from 'jotai'

import { TabOrderTypes } from 'entities/routes/routes.atom'

/**
 * Writable order type for the orders table. Set by `useOrdersTable` hook instead of reading it directly from the URL
 * using `locationOrderTypeAtom` to prevent the orders table from updating before the page is rendered (e.g. when going
 * from limit to advanced orders, the orders table will show TWAP orders while still on the limit page if we read
 * directly from the URL.
 */
export const ordersTableOrderTypeAtom = atom<TabOrderTypes | null>(null)
