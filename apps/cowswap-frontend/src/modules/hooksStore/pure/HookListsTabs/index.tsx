import { Dispatch, ReactNode, SetStateAction } from 'react'

import * as styledEl from 'common/pure/Tabs'

interface HookListsTabsProps {
  isAllHooksTab: boolean
  setIsAllHooksTab: Dispatch<SetStateAction<boolean>>
  allHooksCount: number
  customHooksCount: number
  onAddCustomHook: () => void
}

export function HookListsTabs({
  isAllHooksTab,
  setIsAllHooksTab,
  allHooksCount,
  customHooksCount,
}: HookListsTabsProps): ReactNode {
  return (
    <styledEl.Tabs>
      <styledEl.Tab to="" $active={isAllHooksTab} onClick={() => setIsAllHooksTab(true)}>
        All Hooks ({allHooksCount})
      </styledEl.Tab>
      <styledEl.Tab to="" $active={!isAllHooksTab} onClick={() => setIsAllHooksTab(false)}>
        My Custom Hooks ({customHooksCount})
      </styledEl.Tab>
    </styledEl.Tabs>
  )
}
