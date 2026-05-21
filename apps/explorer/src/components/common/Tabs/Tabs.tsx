import React, { useState } from 'react'

import { Color } from '@cowprotocol/ui'

import TabContent from 'components/common/Tabs/TabContent'
import TabItem from 'components/common/Tabs/TabItem'
import { DefaultTheme } from 'styled-components/macro'

import { Wrapper, TabList, ExtraContent } from './styled'

// Components
export { default as TabIcon } from 'components/common/Tabs/TabIcon'
export { TabList } from './styled'

export interface TabItemInterface {
  readonly tab: React.ReactNode
  readonly content: React.ReactNode
  readonly id: TabId
}
export interface TabsProps {
  readonly className?: string
  readonly tabItems: TabItemInterface[]
  readonly tabTheme: TabTheme
  readonly selectedTab?: TabId
  readonly extra?: React.ReactNode
  readonly extraPosition?: 'top' | 'bottom' | 'both'
  readonly updateSelectedTab?: (activeId: TabId) => void
}

export interface TabTheme {
  readonly activeBg: string
  readonly activeBgAlt?: string | undefined
  readonly inactiveBg: string
  readonly activeText: string | ((props: { theme: DefaultTheme }) => string)
  readonly inactiveText: string | ((props: { theme: DefaultTheme }) => string)
  readonly activeBorder: string | ((props: { theme: DefaultTheme }) => string)
  readonly inactiveBorder: string
  readonly indicatorTabSize: number
  readonly fontSize: string
  readonly fontWeight: string
  readonly letterSpacing: string
  readonly borderRadius: boolean
}

export enum IndicatorTabSize {
  small = 0.1,
  big = 0.2,
}

type TabId = number

export const DEFAULT_TAB_THEME: TabTheme = {
  activeBg: 'transparent',
  activeBgAlt: undefined,
  inactiveBg: 'transparent',
  activeText: Color.neutral100,
  inactiveText: Color.explorer_textSecondary2,
  activeBorder: Color.neutral100,
  inactiveBorder: 'transparent',
  indicatorTabSize: 0.2,
  fontSize: '1.4rem',
  fontWeight: '500',
  letterSpacing: '0',
  borderRadius: false,
}

export function getTabTheme(tabStyles: Partial<TabTheme> = {}): TabTheme {
  return {
    ...DEFAULT_TAB_THEME,
    ...tabStyles,
  }
}

export default Tabs

function Tabs({
  tabTheme = DEFAULT_TAB_THEME,
  tabItems,
  selectedTab: parentSelectedTab,
  extra: tabBarExtraContent,
  extraPosition = 'top',
  updateSelectedTab: parentUpdateSelectedTab,
}: TabsProps): React.ReactNode {
  const [innerSelectedTab, setInnerSelectedTab] = useState(1)
  // Use parent state management if provided, otherwise use internal state
  const selectedTab = parentSelectedTab ?? innerSelectedTab
  const updateTab = parentUpdateSelectedTab ?? setInnerSelectedTab

  return (
    <Wrapper>
      <TabList role="tablist" className="tablist">
        {tabItems.map(({ tab, id }) => (
          <TabItem
            key={id}
            id={id}
            tab={tab}
            onTabClick={updateTab}
            isActive={selectedTab === id}
            tabTheme={tabTheme}
          />
        ))}
        {tabBarExtraContent && ['top', 'both'].includes(extraPosition) && (
          <ExtraContent className="tab-extra-content">{tabBarExtraContent}</ExtraContent>
        )}
      </TabList>
      <TabContent tabItems={tabItems} activeTab={selectedTab} />
      {tabBarExtraContent && ['bottom', 'both'].includes(extraPosition) && (
        <ExtraContent className="tab-extra-content" $isBottom>
          {tabBarExtraContent}
        </ExtraContent>
      )}
    </Wrapper>
  )
}
