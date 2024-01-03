import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, Router, ThemeToggler } from 'storybook/decorators'

import { OrderDetails, Props } from '.'

import { RICH_ORDER } from '../../../../test/data'

export default {
  title: 'orders/OrderDetails',
  component: OrderDetails,
  decorators: [Router, GlobalStyles, ThemeToggler],
  //   argTypes: { header: { control: null }, children: { control: null } },
} as Meta

const Template: Story<Props> = (args) => <OrderDetails {...args} />

const defaultProps: Props = { order: null, isOrderLoading: false, areTradesLoading: false, trades: [], errors: {} }

export const OrderFound = Template.bind({})
OrderFound.args = { ...defaultProps, order: RICH_ORDER }

export const OrderLoading = Template.bind({})
OrderLoading.args = { ...defaultProps, isOrderLoading: true }

export const TradesLoading = Template.bind({})
TradesLoading.args = { ...defaultProps, order: RICH_ORDER, areTradesLoading: true }

export const OrderNotFound = Template.bind({})
OrderNotFound.args = { ...defaultProps }

export const TokensNotLoaded = Template.bind({})
TokensNotLoaded.args = { ...defaultProps, order: { ...RICH_ORDER, buyToken: undefined } }

export const WithErrors = Template.bind({})
WithErrors.args = {
  ...defaultProps,
  isOrderLoading: true,
  errors: {
    error1: { message: 'Failed something something', type: 'error' },
    error2: { message: 'Something else failed', type: 'error' },
  },
}
