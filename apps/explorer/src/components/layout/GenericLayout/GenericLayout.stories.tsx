import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { Router, ThemeToggler } from 'storybook/decorators'
import { LoremIpsum } from 'storybook/LoremIpsum'

import { Footer, FooterType } from './Footer'
import { Header } from './Header'
import { Navigation } from './Navigation'

import { GenericLayout, Props } from '.'

export default {
  title: 'Layout/GenericLayout',
  component: GenericLayout,
  decorators: [Router, ThemeToggler],
} as Meta

const Template: Story<Props> = (props) => <GenericLayout {...props} />

export const Normal = Template.bind({})
Normal.args = { children: <LoremIpsum /> }

export const ShortPage = Template.bind({})
ShortPage.args = { children: 'This is a really short page...' }

const footerProps: FooterType = {
  verifiedText: 'nope',
  isBeta: true,
  url: { web: 'https://localhost:80', appId: '255', contracts: { repo: 'adss', settlement: '', vaultRelayer: '' } },
}

export const WithCustomHeaderAndFooter = Template.bind({})
WithCustomHeaderAndFooter.args = {
  ...ShortPage.args,
  header: (
    <Header>
      <Navigation>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>Item 4</li>
      </Navigation>
    </Header>
  ),
  footer: <Footer {...footerProps} />,
}

export const WithoutHeaderAndFooter = Template.bind({})
WithoutHeaderAndFooter.args = { ...ShortPage.args, header: null, footer: null }
