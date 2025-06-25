import { ReactNode, useEffect, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useNavigate } from 'common/hooks/useNavigate'
import { Tabs, Tab } from 'common/pure/Tabs'

import { CoWShedWidgetTabs } from '../../const'
import { getShedRouteLink } from '../../utils/getShedRouteLink'

interface CoWShedTabsProps {
  chainId: SupportedChainId
  aboutContent: ReactNode
  recoverFundsContent: ReactNode
  modalMode: boolean
  tab?: CoWShedWidgetTabs
}

export function CoWShedTabs({
  chainId,
  aboutContent,
  recoverFundsContent,
  tab,
  modalMode,
}: CoWShedTabsProps): ReactNode {
  const [currentTab, setCurrentTab] = useState(tab ?? CoWShedWidgetTabs.ABOUT)
  const isAboutTab = currentTab !== CoWShedWidgetTabs.RECOVER_FUNDS

  const navigate = useNavigate()

  const onTabSelect = (tab: CoWShedWidgetTabs): void => {
    if (modalMode) {
      setCurrentTab(tab)
    } else {
      navigate({ pathname: getShedRouteLink(chainId, tab) }, { replace: true })
    }
  }

  useEffect(() => {
    if (!tab) return

    setCurrentTab(tab)
  }, [tab])

  return (
    <div>
      <Tabs>
        <Tab $active={isAboutTab} onClick={() => onTabSelect(CoWShedWidgetTabs.ABOUT)}>
          About
        </Tab>

        <Tab $active={!isAboutTab} onClick={() => onTabSelect(CoWShedWidgetTabs.RECOVER_FUNDS)}>
          Recover funds
        </Tab>
      </Tabs>
      <div>{isAboutTab ? aboutContent : recoverFundsContent}</div>
    </div>
  )
}
