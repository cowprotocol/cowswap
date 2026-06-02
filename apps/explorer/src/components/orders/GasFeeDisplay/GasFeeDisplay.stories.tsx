import React from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { Story, Meta } from '@storybook/react/types-6-0'
import BigNumber from 'bignumber.js'
import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { ProtocolFeeType } from 'api/operator'

import { RICH_ORDER, USDT, WETH } from '../../../test/data'

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

const defaultProps: Props = { order: RICH_ORDER }

// No protocol fees -> renders a dash
export const NoProtocolFees = Template.bind({})
NoProtocolFees.args = { ...defaultProps }

// Single protocol fee, denominated in the buy token (surplus side)
export const SingleProtocolFee = Template.bind({})
SingleProtocolFee.args = {
  order: {
    ...RICH_ORDER,
    protocolFees: [
      { amount: new BigNumber('1166200'), tokenAddress: getAddressKey(USDT.address), type: ProtocolFeeType.Surplus },
    ],
  },
}

// Multiple protocol fees of different types/tokens, each shown on its own labelled row
export const MultipleProtocolFees = Template.bind({})
MultipleProtocolFees.args = {
  order: {
    ...RICH_ORDER,
    protocolFees: [
      { amount: new BigNumber('1166200'), tokenAddress: getAddressKey(USDT.address), type: ProtocolFeeType.Surplus },
      {
        amount: new BigNumber('50000000000000000'),
        tokenAddress: getAddressKey(WETH.address),
        type: ProtocolFeeType.PriceImprovement,
      },
    ],
  },
}
