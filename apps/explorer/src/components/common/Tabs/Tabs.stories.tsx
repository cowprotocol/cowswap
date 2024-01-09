import React from 'react'

import { Meta, Story } from '@storybook/react/types-6-0'
import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import Tabs, { getTabTheme, Props as TabsProps } from './Tabs'
import { DARK_COLOURS } from 'theme'

export default {
  title: 'Common/Tabs',
  component: Tabs,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const tabItems = [
  {
    id: 1,
    tab: 'Tab one',
    content: <h3>Tab One</h3>,
  },
  {
    id: 2,
    tab: 'Tab two',
    content: <h3>Tab Two</h3>,
  },
  {
    id: 3,
    tab: 'Tab three',
    content: <h3>Tab Three</h3>,
  },
]

const tabDefaultThemeConfig = getTabTheme()

const Template: Story<TabsProps> = (args) => <Tabs {...args} />

export const DefaultTabs = Template.bind({})
DefaultTabs.args = { tabItems, tabTheme: tabDefaultThemeConfig }

const tabItemsWithoutChild = [
  {
    id: 1,
    tab: 'Orders',
    content: null,
  },
  {
    id: 2,
    tab: 'Trades',
    content: null,
  },
]

const tabCustomThemeConfig = getTabTheme({
  activeBg: 'var(--color-transparent)',
  activeBgAlt: 'initial',
  inactiveBg: 'var(--color-transparent)',
  activeText: DARK_COLOURS.textPrimary1,
  inactiveText: 'var(--color-text-secondary2)',
  activeBorder: DARK_COLOURS.orange,
  inactiveBorder: 'none',
  fontSize: 'var(--font-size-large)',
  fontWeight: 'var(--font-weight-bold)',
  letterSpacing: 'initial',
  borderRadius: false,
})

export const CustomizedThemeTabs = Template.bind({})
CustomizedThemeTabs.args = { tabItems: tabItemsWithoutChild, tabTheme: tabCustomThemeConfig }
