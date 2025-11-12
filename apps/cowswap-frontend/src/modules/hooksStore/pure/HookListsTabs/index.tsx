import { Dispatch, ReactNode, SetStateAction } from 'react'

import { Trans } from '@lingui/react/macro'

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
      <styledEl.Tab $active={isAllHooksTab} onClick={() => setIsAllHooksTab(true)}>
        <Trans>All Hooks ({allHooksCount})</Trans>
      </styledEl.Tab>
      <styledEl.Tab $active={!isAllHooksTab} onClick={() => setIsAllHooksTab(false)}>
        <Trans>My Custom Hooks ({customHooksCount})</Trans>
      </styledEl.Tab>
    </styledEl.Tabs>
  )
}
