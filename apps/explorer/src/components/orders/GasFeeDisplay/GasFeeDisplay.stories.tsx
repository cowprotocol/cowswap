import React from 'react'

import { Story, Meta } from '@storybook/react/types-6-0'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'const'
import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { RICH_ORDER, WETH } from '../../../test/data'

import { GasFeeDisplay, Props } from '.'

export default {
  title: 'orders/GasFeeDisplay',
  component: GasFeeDisplay,
  decorators: [GlobalStyles, ThemeToggler],
  argTypes: { order: { control: null } },
} as Meta

const Template: Story<Props> = (args) => (
  <div style={{ fontSize: '14px' }}>
    <GasFeeDisplay {...args} />
  </div>
)

const order = {
  ...RICH_ORDER,
  feeAmount: new BigNumber('200000'),
  executedFeeAmount: ZERO_BIG_NUMBER,
}

const defaultProps: Props = { order }

export const NoFee = Template.bind({})
NoFee.args = { ...defaultProps }

export const PartialFee = Template.bind({})
PartialFee.args = { ...defaultProps, order: { ...order, executedFeeAmount: new BigNumber('100000') } }

export const FullFee = Template.bind({})
FullFee.args = { ...defaultProps, order: { ...order, executedFeeAmount: order.feeAmount, fullyFilled: true } }

export const TinyFee6DecimalsToken = Template.bind({})
TinyFee6DecimalsToken.args = { ...defaultProps, order: { ...order, executedFeeAmount: new BigNumber('1') } }

export const TinyFee18DecimalsToken = Template.bind({})
TinyFee18DecimalsToken.args = {
  ...defaultProps,
  order: { ...order, executedFeeAmount: new BigNumber('1'), sellToken: WETH },
}
