import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Tabs, Tab } from 'common/pure/Tabs'

import { CoWShedWidgetTabs } from '../../const'
import { getShedRouteLink } from '../../utils/getShedRouteLink'

interface CoWShedTabsProps {
  chainId: SupportedChainId
  aboutContent: ReactNode
  recoverFundsContent: ReactNode
  tab?: CoWShedWidgetTabs
}

export function CoWShedTabs({ chainId, aboutContent, recoverFundsContent, tab }: CoWShedTabsProps): ReactNode {
  const isAboutTab = tab !== CoWShedWidgetTabs.RECOVER_FUNDS

  return (
    <div>
      <Tabs>
        <Tab $active={isAboutTab} to={getShedRouteLink(chainId, CoWShedWidgetTabs.ABOUT)} replace>
          About
        </Tab>

        <Tab $active={!isAboutTab} to={getShedRouteLink(chainId, CoWShedWidgetTabs.RECOVER_FUNDS)} replace>
          Recover funds
        </Tab>
      </Tabs>
      <div>{isAboutTab ? aboutContent : recoverFundsContent}</div>
    </div>
  )
}
