import { Dispatch, SetStateAction } from 'react'

import * as styledEl from './styled'

interface HookListsTabsProps {
  tabsState: [boolean, Dispatch<SetStateAction<boolean>>]
}
export function HookListsTabs({ tabsState }: HookListsTabsProps) {
  const [isVerifiedHooksTab, setVerifiedHooksTab] = tabsState

  return (
    <styledEl.TabsContainer>
      <styledEl.Tab active$={isVerifiedHooksTab} onClick={() => setVerifiedHooksTab(true)}>
        Verified Hooks
      </styledEl.Tab>
      <styledEl.Tab active$={!isVerifiedHooksTab} onClick={() => setVerifiedHooksTab(false)}>
        External Hooks
      </styledEl.Tab>
    </styledEl.TabsContainer>
  )
}
