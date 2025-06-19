import React from 'react'

import { TabItemInterface, TabTheme } from 'components/common/Tabs/Tabs'

import { TabItemWrapper } from './styled'

interface TabProps extends Omit<TabItemInterface, 'content'> {
  isActive: boolean
  readonly tabTheme: TabTheme
  onTabClick: (id: number) => void
}

const TabItem: React.FC<TabProps> = (props) => {
  const { onTabClick, id, tab, isActive, tabTheme } = props

  return (
    <TabItemWrapper
      role="tab"
      aria-selected={isActive}
      isActive={isActive}
      onClick={(): void => onTabClick(id)}
      tabTheme={tabTheme}
    >
      {tab}
    </TabItemWrapper>
  )
}
export default TabItem
