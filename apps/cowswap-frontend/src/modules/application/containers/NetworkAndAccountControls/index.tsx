import { ReactNode } from 'react'

import { AccountElement } from 'legacy/components/Header/AccountElement'
import { NetworkSelector } from 'legacy/components/Header/NetworkSelector'
import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

export function NetworkAndAccountControls(): ReactNode {
  const { hideNetworkSelector } = useInjectedWidgetParams()
  const { pendingActivity } = useCategorizeRecentActivity()

  return (
    <HeaderControls>
      {!hideNetworkSelector && <NetworkSelector />}
      <HeaderElement>
        <AccountElement pendingActivities={pendingActivity} />
      </HeaderElement>
    </HeaderControls>
  )
}
