import { Dispatch, SetStateAction } from 'react'

import * as styledEl from './styled'

interface HookListsTabsProps {
  tabsState: [boolean, Dispatch<SetStateAction<boolean>>]
  verifiedHooksCount: number
  externalHooksCount: number
}

export function HookListsTabs({ tabsState, verifiedHooksCount, externalHooksCount }: HookListsTabsProps) {
  const [isVerifiedHooksTab, setVerifiedHooksTab] = tabsState

  return (
    <styledEl.TabsContainer>
      <styledEl.Tab active$={isVerifiedHooksTab} onClick={() => setVerifiedHooksTab(true)}>
        Verified Hooks ({verifiedHooksCount})
      </styledEl.Tab>
      <styledEl.Tab active$={!isVerifiedHooksTab} onClick={() => setVerifiedHooksTab(false)}>
        External Hooks ({externalHooksCount})
      </styledEl.Tab>
    </styledEl.TabsContainer>
  )
}
