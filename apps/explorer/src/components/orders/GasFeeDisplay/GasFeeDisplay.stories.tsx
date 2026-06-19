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

// On-chain gas cost (native token wei) — its presence switches on the costs & fees breakdown.
const GAS_COST = new BigNumber('2500000000000000')

// No recorded gas cost -> legacy display of the combined executed fee in the sell token.
export const LegacyNoGasCost = Template.bind({})
LegacyNoGasCost.args = { order: { ...RICH_ORDER, gasCost: undefined } }

// Gas cost present but no protocol fees -> breakdown with just the Network costs line.
export const NetworkCostsOnly = Template.bind({})
NetworkCostsOnly.args = { order: { ...RICH_ORDER, gasCost: GAS_COST, protocolFees: [] } }

// Network costs + the protocol's own fee (the first applied fee, position 0).
export const ProtocolFee = Template.bind({})
ProtocolFee.args = {
  order: {
    ...RICH_ORDER,
    gasCost: GAS_COST,
    protocolFees: [
      {
        amount: new BigNumber('1166200'),
        tokenAddress: getAddressKey(USDT.address),
        type: ProtocolFeeType.Volume,
        position: 0,
      },
    ],
  },
}

// Network costs + protocol fee + two partner fees (numbered by applied order).
export const ProtocolAndPartnerFees = Template.bind({})
ProtocolAndPartnerFees.args = {
  order: {
    ...RICH_ORDER,
    gasCost: GAS_COST,
    protocolFees: [
      {
        amount: new BigNumber('1166200'),
        tokenAddress: getAddressKey(USDT.address),
        type: ProtocolFeeType.Volume,
        position: 0,
      },
      {
        amount: new BigNumber('800000'),
        tokenAddress: getAddressKey(USDT.address),
        type: ProtocolFeeType.Volume,
        position: 1,
      },
      {
        amount: new BigNumber('50000000000000000'),
        tokenAddress: getAddressKey(WETH.address),
        type: ProtocolFeeType.PriceImprovement,
        position: 2,
      },
    ],
  },
}
