import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { OrderKind } from '@cowprotocol/cow-sdk'

import { Meta, Story } from '@storybook/react/types-6-0'
import BigNumber from 'bignumber.js'
import { GlobalStyles, NetworkDecorator, Router, ThemeToggler } from 'storybook/decorators'

import { Order } from 'api/operator'

import { RICH_ORDER, TUSD, WETH } from '../../../test/data'

import TransactionTable, { Props as TransactionTableProps } from '.'

export default {
  title: 'transaction/TransactionTable',
  decorators: [Router, GlobalStyles, NetworkDecorator, ThemeToggler],
  component: TransactionTable,
} as Meta

const transactionExBuy: Order = {
  ...RICH_ORDER,
  kind: OrderKind.BUY,
  buyToken: WETH,
  sellToken: TUSD,
  buyAmount: new BigNumber('1500000000000000000'), // 1.5WETH
  sellAmount: new BigNumber('7500000000000000000000'), // 7500 TUSD
  expirationDate: new Date(),
  txHash: '0x489d8fd1efd43394c7c2b26216f36f1ab49b8d67623047e0fcb60efa2a2c420b',
  partiallyFilled: true,
  status: 'filled',
}

const transactionExSell: Order = {
  ...RICH_ORDER,
  kind: OrderKind.SELL,
  buyToken: WETH,
  sellToken: TUSD,
  buyAmount: new BigNumber('1500000000000000000'), // 1.5WETH
  sellAmount: new BigNumber('7500000000000000000000'), // 7500 TUSD
  expirationDate: new Date(),
  txHash: '0x489d8fd1efd43394c7c2b26216f36f1ab49b8d67623047e0fcb60efa2a2c420b',
  partiallyFilled: false,
  status: 'open',
}

const Template: Story<TransactionTableProps> = (args) => <TransactionTable {...args} />

export const Default = Template.bind({})
Default.args = { orders: [transactionExBuy, transactionExSell], showBorderTable: true }

export const TxDetailsError = Template.bind({})
TxDetailsError.args = { orders: [], showBorderTable: true }
