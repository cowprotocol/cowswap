import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { StatusLabel, Props } from '.'
import BigNumber from 'bignumber.js'

export default {
  title: 'Orders/StatusLabel',
  component: StatusLabel,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<Props> = (args) => <StatusLabel {...args} />

export const Filled = Template.bind({})
Filled.args = { status: 'filled' }

export const Expired = Template.bind({})
Expired.args = { status: 'expired' }

export const Cancelled = Template.bind({})
Cancelled.args = { status: 'cancelled' }

export const Cancelling = Template.bind({})
Cancelling.args = { status: 'cancelling' }

export const Open = Template.bind({})
Open.args = { status: 'open' }

export const Signing = Template.bind({})
Signing.args = { status: 'signing' }

const partialFillProps = {
  partiallyFilled: true,
  filledPercentage: new BigNumber(5992146249).div(20085613995),
}
export const OpenPartiallyFilled = Template.bind({})
OpenPartiallyFilled.args = { status: 'open', ...partialFillProps }
export const ExpiredPartiallyFilled = Template.bind({})
ExpiredPartiallyFilled.args = { status: 'expired', ...partialFillProps }
export const CancelledPartiallyFilled = Template.bind({})
CancelledPartiallyFilled.args = {
  status: 'cancelled',
  ...partialFillProps,
}
export const CancellingPartiallyFilled = Template.bind({})
CancellingPartiallyFilled.args = { status: 'cancelling', ...partialFillProps }
