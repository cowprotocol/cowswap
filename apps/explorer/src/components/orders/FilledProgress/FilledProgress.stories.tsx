import React from 'react'
import BigNumber from 'bignumber.js'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { Order } from 'api/operator'

import { ONE_BIG_NUMBER } from 'const'

import { FilledProgress, Props } from '.'

import { RICH_ORDER } from '../../../../test/data'
import { OrderKind } from '@cowprotocol/cow-sdk'

export default {
  title: 'Orders/FilledProgress',
  component: FilledProgress,
  decorators: [GlobalStyles, ThemeToggler],
  argTypes: { percentage: { control: null } },
} as Meta

const Template: Story<Props> = (args) => (
  <div style={{ fontSize: '14px' }}>
    <FilledProgress {...args} />
  </div>
)

const order: Order = {
  ...RICH_ORDER,
  buyAmount: new BigNumber('2000000000000000000'),
  sellAmount: new BigNumber('4000000000'),
}

const defaultArgs: Props = {
  order,
}

export const Default = Template.bind({})
Default.args = { ...defaultArgs }

export const FullyFilledSellOrder = Template.bind({})
FullyFilledSellOrder.args = {
  ...defaultArgs,
  order: {
    ...order,
    kind: OrderKind.SELL,
    filledAmount: order.sellAmount,
    filledPercentage: ONE_BIG_NUMBER,
    fullyFilled: true,
  },
}

export const FullyFilledBuyOrder = Template.bind({})
FullyFilledBuyOrder.args = {
  ...defaultArgs,
  order: {
    ...order,
    kind: OrderKind.BUY,
    filledAmount: order.buyAmount,
    filledPercentage: ONE_BIG_NUMBER,
    fullyFilled: true,
  },
}

export const PartiallyFilledSellOrder = Template.bind({})
PartiallyFilledSellOrder.args = {
  ...defaultArgs,
  order: {
    ...order,
    kind: OrderKind.SELL,
    filledAmount: order.sellAmount.div(2),
    filledPercentage: new BigNumber('0.5'),
  },
}

export const PartiallyFilledBuyOrder = Template.bind({})
PartiallyFilledBuyOrder.args = {
  ...defaultArgs,
  order: {
    ...order,
    kind: OrderKind.BUY,
    filledAmount: order.buyAmount.div(2),
    filledPercentage: new BigNumber('0.5'),
  },
}
