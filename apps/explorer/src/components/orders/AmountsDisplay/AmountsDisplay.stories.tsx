import React from 'react'
import BigNumber from 'bignumber.js'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, NetworkDecorator, ThemeToggler } from 'storybook/decorators'

import { AmountsDisplay, Props } from '.'

import { RICH_ORDER } from '../../../../test/data'

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
