import React from 'react'

import { Story, Meta } from '@storybook/react/types-6-0'
import BigNumber from 'bignumber.js'
import { GlobalStyles, NetworkDecorator, ThemeToggler } from 'storybook/decorators'

import { RICH_ORDER } from '../../../test/data'

import { AmountsDisplay, Props } from '.'

export default {
  title: 'orders/AmountsDisplay',
  component: AmountsDisplay,
  decorators: [GlobalStyles, NetworkDecorator, ThemeToggler],
} as Meta

const Template: Story<Props> = (args) => (
  <div style={{ fontSize: '12px' }}>
    <AmountsDisplay {...args} />
  </div>
)

const order = {
  ...RICH_ORDER,
  buyAmount: new BigNumber('2000000000000000000'),
  sellAmount: new BigNumber('4000000000'),
}

const defaultProps: Props = { order }

export const OrderFound = Template.bind({})
OrderFound.args = { ...defaultProps }
