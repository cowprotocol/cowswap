import { useAtomValue } from 'jotai'

import { TabParams } from 'modules/ordersTable/state/ordersTable.types'

import { ordersTableTabsAtom } from '../../state/tabs/ordersTableTabs.atom'

export function useOrdersTableTabs(): TabParams[] {
  return useAtomValue(ordersTableTabsAtom)
}
