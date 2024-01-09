import React from 'react'
import BigNumber from 'bignumber.js'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { OrderSurplusDisplay, Props } from '.'

import { ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { RICH_ORDER } from '../../../../test/data'
import { Order } from 'api/operator'
import { OrderKind } from '@cowprotocol/cow-sdk'

export default {
  title: 'orders/OrderSurplusDisplay',
  component: OrderSurplusDisplay,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<Props> = (args) => (
  <div style={{ fontSize: '20px' }}>
    <OrderSurplusDisplay {...args} />
  </div>
)

const order: Order = {
  ...RICH_ORDER,
  kind: OrderKind.BUY,
  buyAmount: new BigNumber('1000000000000000000'), // 1WETH
  sellAmount: new BigNumber('5000000000'), //5000 USDT
  surplusAmount: new BigNumber('5000000000'),
  surplusPercentage: ONE_BIG_NUMBER,
}

const defaultProps: Props = { order }

export const Surplus100Percent = Template.bind({})
Surplus100Percent.args = { ...defaultProps, order }

export const Surplus1Percent = Template.bind({})
Surplus1Percent.args = {
  ...defaultProps,
  order: { ...order, surplusAmount: new BigNumber('5000000'), surplusPercentage: new BigNumber('0.01') },
}

export const Surplus0dot1Percent = Template.bind({})
Surplus0dot1Percent.args = {
  ...defaultProps,
  order: { ...order, surplusAmount: new BigNumber('500000'), surplusPercentage: new BigNumber('0.001') },
}

export const Surplus0Percent = Template.bind({})
Surplus0Percent.args = {
  ...defaultProps,
  order: { ...order, surplusAmount: ZERO_BIG_NUMBER, surplusPercentage: ZERO_BIG_NUMBER },
}
