import React from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { Story, Meta } from '@storybook/react/types-6-0'
import BigNumber from 'bignumber.js'
import { ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'
import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { Order } from 'api/operator'

import { RICH_ORDER } from '../../../test/data'

import { OrderSurplusDisplay, Props } from '.'

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
