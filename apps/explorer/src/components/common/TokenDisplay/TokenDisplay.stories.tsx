import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ETH, XDAI } from 'const'
import { GlobalStyles, ThemeToggler } from 'storybook/decorators'
import { Network } from 'types'

import { USDT } from '../../../test/data'

import { TokenDisplay, TokenDisplayProps } from '.'

export default {
  title: 'Common/TokenDisplay',
  component: TokenDisplay,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<TokenDisplayProps> = (args) => <TokenDisplay {...args} />

const defaultProps: TokenDisplayProps = { erc20: USDT, network: Network.MAINNET }

export const Default = Template.bind({})
Default.args = { ...defaultProps }

export const NativeMainnet = Template.bind({})
NativeMainnet.args = { ...defaultProps, erc20: ETH }

export const NativeXDai = Template.bind({})
NativeXDai.args = { ...defaultProps, erc20: XDAI, network: Network.GNOSIS_CHAIN }
