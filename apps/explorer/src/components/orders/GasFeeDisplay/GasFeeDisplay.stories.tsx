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

// On-chain gas cost (native token wei). Both it and `protocolFees` must be present for the
// breakdown to render; otherwise the total would be missing one of its components.
const GAS_COST = new BigNumber('2500000000000000')

// No recorded gas cost -> legacy display of the combined executed fee in the sell token.
export const LegacyNoGasCost = Template.bind({})
LegacyNoGasCost.args = { order: { ...RICH_ORDER, gasCost: undefined, protocolFees: [] } }

// Fees not known yet (still loading, or their fetch failed) -> legacy display rather than a total
// that silently omits them.
export const FeesUnavailable = Template.bind({})
FeesUnavailable.args = { order: { ...RICH_ORDER, gasCost: GAS_COST, protocolFees: undefined } }

// Gas cost present and the order provably charged no fees -> network costs alone, and no expander,
// since it would only repeat the total.
export const NetworkCostsOnly = Template.bind({})
NetworkCostsOnly.args = { order: { ...RICH_ORDER, gasCost: GAS_COST, protocolFees: [] } }

// Network costs plus a single fee, charged in a different token than the gas -> two totals.
export const SingleFee = Template.bind({})
SingleFee.args = {
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
