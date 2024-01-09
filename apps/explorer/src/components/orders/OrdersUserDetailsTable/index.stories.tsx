import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import OrderUserDetailsTable, { Props as OrdersUserTableProps } from '.'
import { add, sub } from 'date-fns'
import BigNumber from 'bignumber.js'
import { GlobalStyles, ThemeToggler, Router, NetworkDecorator } from 'storybook/decorators'

import { Order } from 'api/operator'
import { RICH_ORDER, TUSD, WETH } from '../../../../test/data'
import { OrderKind } from '@cowprotocol/cow-sdk'

export default {
  title: 'orders/OrdersUserDetailsTable',
  decorators: [Router, GlobalStyles, NetworkDecorator, ThemeToggler],
  component: OrderUserDetailsTable,
} as Meta

const orderBuy: Order = {
  ...RICH_ORDER,
  kind: OrderKind.BUY,
  buyToken: WETH,
  sellToken: TUSD,
  shortId: 'bdef89ac',
  buyAmount: new BigNumber('1500000000000000000'), // 1.5WETH
  sellAmount: new BigNumber('7500000000000000000000'), // 7500 TUSD
  creationDate: sub(new Date(), { hours: 1 }),
  expirationDate: add(new Date(), { hours: 1 }),
  txHash: '0x489d8fd1efd43394c7c2b26216f36f1ab49b8d67623047e0fcb60efa2a2c420b',
}

const orderSell: Order = {
  ...RICH_ORDER,
  buyAmount: new BigNumber('3000000000'), // 3000 USDT
  sellAmount: new BigNumber('1000000000000000000'), // 1WETH
  creationDate: sub(new Date(), { hours: 48 }),
  expirationDate: add(new Date(), { hours: 48 }),
}

const Template: Story<OrdersUserTableProps> = (args) => <OrderUserDetailsTable {...args} />

export const Default = Template.bind({})
Default.args = { orders: [orderBuy, orderSell], showBorderTable: true }

export const EmptyOrders = Template.bind({})
EmptyOrders.args = { orders: [], showBorderTable: true }
