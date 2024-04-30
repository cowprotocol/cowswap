import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import BigNumber from 'bignumber.js'
import { ONE_BIG_NUMBER } from 'const'
import { add, sub } from 'date-fns'
import { GlobalStyles, NetworkDecorator, Router, ThemeToggler } from 'storybook/decorators'


import { RICH_ORDER } from '../../../test/data'

import { DetailsTable, Props } from '.'


export default {
  title: 'orders/DetailsTable',
  component: DetailsTable,
  decorators: [Router, GlobalStyles, NetworkDecorator, ThemeToggler],
  argTypes: { order: { control: null } },
} as Meta

const Template: Story<Props> = (args) => <DetailsTable {...args} />

const order = {
  ...RICH_ORDER,
  buyAmount: new BigNumber('1000000000000000000'), // 1WETH
  sellAmount: new BigNumber('5000000000'), //5000 USDT
  creationDate: sub(new Date(), { hours: 1 }),
  expirationDate: add(new Date(), { hours: 1 }),
  txHash: '0x489d8fd1efd43394c7c2b26216f36f1ab49b8d67623047e0fcb60efa2a2c420b',
}

const defaultProps: Props = {
  order,
  areTradesLoading: false,
  showFillsButton: false,
  viewFills: () => null,
  isPriceInverted: false,
  invertPrice: () => null,
}

export const DefaultFillOrKill = Template.bind({})
DefaultFillOrKill.args = { ...defaultProps }

export const FilledFillOrKill = Template.bind({})
FilledFillOrKill.args = {
  ...defaultProps,
  order: {
    ...order,
    status: 'filled',
    executedBuyAmount: order.buyAmount,
    executedSellAmount: order.sellAmount,
    filledAmount: order.sellAmount,
    filledPercentage: ONE_BIG_NUMBER,
  },
}

export const DefaultPartiallyFillable = Template.bind({})
DefaultPartiallyFillable.args = { ...defaultProps, order }

export const FilledPartiallyFillable = Template.bind({})
FilledPartiallyFillable.args = {
  ...defaultProps,
  order: {
    ...order,
    status: 'filled',
    executedBuyAmount: order.buyAmount,
    executedSellAmount: order.sellAmount,
    filledAmount: order.sellAmount,
    filledPercentage: ONE_BIG_NUMBER,
  },
}
