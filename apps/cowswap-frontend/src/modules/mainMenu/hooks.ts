import { useMemo } from 'react'

import { useIsAdvancedOrdersEnabled } from 'common/hooks/useIsAdvancedOrdersEnabled'

import { MenuTreeItem } from './types'
import { buildMainMenuTreeItems } from './utils'

export function useMenuItems(): MenuTreeItem[] {
  const isAdvancedOrdersEnabled = !!useIsAdvancedOrdersEnabled()

  return useMemo(() => buildMainMenuTreeItems({ isAdvancedOrdersEnabled }), [isAdvancedOrdersEnabled])
}
