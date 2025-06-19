import React, { useState } from 'react'

import { Color } from '@cowprotocol/ui'

import TabContent from 'components/common/Tabs/TabContent'
import TabItem from 'components/common/Tabs/TabItem'
import { DefaultTheme } from 'styled-components/macro'

import { Wrapper, TabList } from './styled'

// Components
export { default as TabIcon } from 'components/common/Tabs/TabIcon'
export { TabList } from './styled'

type TabId = number
export enum IndicatorTabSize {
  small = 0.1,
  big = 0.2,
}
export type TabBarExtraContent = React.ReactNode

export interface TabItemInterface {
  readonly tab: React.ReactNode
  readonly content: React.ReactNode
  readonly id: TabId
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
export interface Props {
  readonly className?: string
  readonly tabItems: TabItemInterface[]
  readonly tabTheme: TabTheme
  readonly selectedTab?: TabId
  readonly extra?: TabBarExtraContent
  readonly extraPosition?: 'top' | 'bottom' | 'both'
  readonly updateSelectedTab?: (activeId: TabId) => void
}

export const DEFAULT_TAB_THEME: TabTheme = {
  activeBg: 'transparent',
  activeBgAlt: undefined,
  inactiveBg: 'transparent',
  activeText: Color.explorer_textPrimary,
  inactiveText: Color.explorer_textSecondary2,
  activeBorder: Color.explorer_textPrimary,
  inactiveBorder: 'transparent',
  indicatorTabSize: 0.2,
  fontSize: '1.4rem',
  fontWeight: '500',
  letterSpacing: '0',
  borderRadius: false,
}

interface ExtraContentProps {
  extra?: TabBarExtraContent
}

const ExtraContent = ({ extra }: ExtraContentProps): React.ReactNode | null => {
  if (!extra) return null

  return <div className="tab-extra-content">{extra}</div>
}

const Tabs: React.FC<Props> = (props) => {
  const {
    tabTheme = DEFAULT_TAB_THEME,
    tabItems,
    selectedTab: parentSelectedTab,
    extra: tabBarExtraContent,
    extraPosition = 'top',
    updateSelectedTab: parentUpdateSelectedTab,
  } = props

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
        {['top', 'both'].includes(extraPosition) && <ExtraContent extra={tabBarExtraContent} />}
      </TabList>
      <TabContent tabItems={tabItems} activeTab={selectedTab} />
      {['bottom', 'both'].includes(extraPosition) && <ExtraContent extra={tabBarExtraContent} />}
    </Wrapper>
  )
}

export default Tabs

export function getTabTheme(tabStyles: Partial<TabTheme> = {}): TabTheme {
  return {
    ...DEFAULT_TAB_THEME,
    ...tabStyles,
  }
}
