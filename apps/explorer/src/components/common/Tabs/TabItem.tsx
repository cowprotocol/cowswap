import React from 'react'
import styled from 'styled-components'
import { TabItemInterface, TabTheme } from 'components/common/Tabs/Tabs'
import { ButtonBase } from '../Button'

interface TabProps extends Omit<TabItemInterface, 'content'> {
  isActive: boolean
  readonly tabTheme: TabTheme
  onTabClick: (id: number) => void
}

type TabItemWrapperProps = Pick<TabProps, 'isActive' | 'tabTheme'>

const TabItemBase = styled(ButtonBase)`
  display: flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 0;
  /* TODO: move this into baseStyles or sth similar */
  height: var(--height-button-default);

  text-align: center;

  appearance: none;
`

// TODO: replace with DefaultTheme and remove `var` approach
// Make Tabs and TabItemBase it's own common component with theme
const TabItemWrapper = styled(TabItemBase)<TabItemWrapperProps>`
  background: ${({ isActive, tabTheme }): string => (isActive ? tabTheme.activeBg : tabTheme.inactiveBg)};
  color: ${({ isActive, tabTheme }): string => (isActive ? tabTheme.activeText : tabTheme.inactiveText)};

  font-weight: ${({ tabTheme }): string => tabTheme.fontWeight};
  font-size: ${({ tabTheme }): string => tabTheme.fontSize};
  letter-spacing: ${({ tabTheme }): string => tabTheme.letterSpacing};

  border-bottom: ${({ isActive, tabTheme }): string =>
    `${tabTheme.indicatorTabSize}rem solid ${isActive ? tabTheme.activeBorder : tabTheme.inactiveBorder}`};

  /* TODO: Provide alternative :focus styling because of using outline: 0; */

  &:first-of-type {
    border-top-left-radius: ${({ tabTheme }): string =>
      `${!tabTheme.borderRadius ? '0' : 'var(--border-radius-default)'}`};
    border-bottom-left-radius: ${({ tabTheme }): string =>
      `${!tabTheme.borderRadius ? '0' : 'var(--border-radius-default)'}`};
  }

  &:last-of-type {
    border-top-right-radius: ${({ tabTheme }): string =>
      `${!tabTheme.borderRadius ? '0' : 'var(--border-radius-default)'}`};
    border-bottom-right-radius: ${({ tabTheme }): string =>
      `${!tabTheme.borderRadius ? '0' : 'var(--border-radius-default)'}`};
    ${({ isActive, tabTheme }): string | false => isActive && `background: ${tabTheme.activeBgAlt};`}
  }
`

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
