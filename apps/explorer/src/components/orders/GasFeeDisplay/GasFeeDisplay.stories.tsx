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

// Native token wei. The breakdown needs both this and `protocolFees` to render a complete total.
const GAS_COST = new BigNumber('2500000000000000')

// `showBreakdown` mirrors the flag. Off -> legacy display, whatever else the order carries.
export const BreakdownDisabled = Template.bind({})
BreakdownDisabled.args = { order: { ...RICH_ORDER, gasCost: GAS_COST, protocolFees: [] }, showBreakdown: false }

// No recorded gas cost -> legacy display of the combined executed fee in the sell token.
export const LegacyNoGasCost = Template.bind({})
LegacyNoGasCost.args = { order: { ...RICH_ORDER, gasCost: undefined, protocolFees: [] }, showBreakdown: true }

// Fees not known yet (loading, or the fetch failed) -> legacy display rather than a partial total.
export const FeesUnavailable = Template.bind({})
FeesUnavailable.args = { order: { ...RICH_ORDER, gasCost: GAS_COST, protocolFees: undefined }, showBreakdown: true }

// Provably no fees -> network costs alone, and no expander, since it would repeat the total.
export const NetworkCostsOnly = Template.bind({})
NetworkCostsOnly.args = { order: { ...RICH_ORDER, gasCost: GAS_COST, protocolFees: [] }, showBreakdown: true }

// Network costs plus a single fee, charged in a different token than the gas -> two totals.
export const SingleFee = Template.bind({})
SingleFee.args = {
  showBreakdown: true,
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

// Several fees, including two of the same type — those get numbered so they can be told apart.
export const MultipleFees = Template.bind({})
MultipleFees.args = {
  showBreakdown: true,
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
