import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import {
  ADDRESS_ACCOUNT_XDAI,
  ADDRESS_GNOSIS_PROTOCOL_XDAI,
  ADDRESS_GNO_XDAI,
  ADDRESS_GNOSIS_PROTOCOL,
  TX_EXAMPLE,
  TX_XDAI,
} from 'storybook/data'
import { Network } from 'types'

import { BlockExplorerLink, Props } from '.'


const networkIds = Object.values(Network).filter(Number.isInteger)

export default {
  title: 'Common/BlockExplorerLink',
  component: BlockExplorerLink,
  argTypes: {
    label: { control: 'text' },
    networkId: { control: { type: 'inline-radio', options: networkIds } },
  },
} as Meta

const Template: Story<Props> = (args) => <BlockExplorerLink {...args} />

const defaultParams: Props = {
  type: 'tx',
  identifier: TX_EXAMPLE,
  networkId: Network.MAINNET,
}

export const NoNetwork = Template.bind({})
NoNetwork.args = {
  ...defaultParams,
  networkId: undefined,
}

export const Mainnet = Template.bind({})
Mainnet.args = {
  ...defaultParams,
}

export const Labeled = Template.bind({})
Labeled.args = {
  ...defaultParams,
  label: '👀View transaction...',
}

export const Contract = Template.bind({})
Contract.args = {
  ...defaultParams,
  type: 'contract',
  label: 'Gnosis Protocol contract',
  identifier: ADDRESS_GNOSIS_PROTOCOL,
}

export const Token = Template.bind({})
Token.args = {
  ...defaultParams,
  type: 'token',
  label: 'GNO token',
  identifier: ADDRESS_GNO_XDAI,
}

export const TxXdai = Template.bind({})
TxXdai.storyName = 'Tx on xDAI'
TxXdai.args = {
  ...defaultParams,
  networkId: Network.GNOSIS_CHAIN,
  type: 'tx',
  identifier: TX_XDAI,
}

export const ContractXDai = Template.bind({})
ContractXDai.storyName = 'Contract on xDAI'
ContractXDai.args = {
  ...defaultParams,
  networkId: Network.GNOSIS_CHAIN,
  type: 'contract',
  identifier: ADDRESS_GNOSIS_PROTOCOL_XDAI,
}

export const TokenXDai = Template.bind({})
TokenXDai.storyName = 'Token on xDAI'
TokenXDai.args = {
  ...defaultParams,
  networkId: Network.GNOSIS_CHAIN,
  type: 'token',
  identifier: ADDRESS_GNO_XDAI,
}

export const AddressXDai = Template.bind({})
AddressXDai.storyName = 'Address on xDAI'
AddressXDai.args = {
  ...defaultParams,
  networkId: Network.GNOSIS_CHAIN,
  type: 'address',
  identifier: ADDRESS_ACCOUNT_XDAI,
}
