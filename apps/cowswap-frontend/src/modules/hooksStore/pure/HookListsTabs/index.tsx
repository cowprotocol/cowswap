import { Dispatch, SetStateAction } from 'react'

import * as styledEl from './styled'

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
}: HookListsTabsProps) {
  return (
    <styledEl.TabsContainer>
      <styledEl.Tab active$={isAllHooksTab} onClick={() => setIsAllHooksTab(true)}>
        All Hooks ({allHooksCount})
      </styledEl.Tab>
      <styledEl.Tab active$={!isAllHooksTab} onClick={() => setIsAllHooksTab(false)}>
        My Custom Hooks ({customHooksCount})
      </styledEl.Tab>
    </styledEl.TabsContainer>
  )
}
