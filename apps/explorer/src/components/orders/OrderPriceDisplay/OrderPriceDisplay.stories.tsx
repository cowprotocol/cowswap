import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { WETH, USDT } from '../../../../test/data'

import { OrderPriceDisplay, Props } from './'

export default {
  title: 'Orders/OrderPriceDisplay',
  component: OrderPriceDisplay,
  decorators: [GlobalStyles, ThemeToggler],
  argTypes: { buyToken: { control: null }, sellToken: { control: null } },
} as Meta

const Template: Story<Props> = (args) => <OrderPriceDisplay {...args} />

const defaultArgs: Props = {
  buyAmount: '1000000000000000000',
  buyToken: WETH,
  sellAmount: '2000000000',
  sellToken: USDT,
}

export const Default = Template.bind({})
Default.args = { ...defaultArgs }

export const PriceInverted = Template.bind({})
PriceInverted.args = { ...defaultArgs, isPriceInverted: true }

export const WithInvertButton = Template.bind({})
WithInvertButton.args = { ...defaultArgs, showInvertButton: true }
