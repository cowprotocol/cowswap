import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { WETH_ADDRESS_MAINNET, WXDAI_ADDRESS_XDAI } from 'const'
import { ADDRESS_GNO_XDAI } from 'storybook/data'
import styled from 'styled-components/macro'

import { Frame } from './Frame'
import { TokenImg, Props } from './TokenImg'

export default {
  title: 'Common/TokenImg',
  decorators: [
    (DecoratedStory): React.ReactNode => (
      <div style={{ textAlign: 'center' }}>
        <Frame style={{ display: 'inline-block', padding: 0 }}>{DecoratedStory()}</Frame>
      </div>
    ),
  ],
  component: TokenImg,
  excludeStories: ['TokenImgRestyled'],
} as Meta

const Template: Story<Props> = (args) => <TokenImg {...args} />

export const WethMainnet = Template.bind({})
WethMainnet.args = {
  address: WETH_ADDRESS_MAINNET,
}

export const WrappedXdai = Template.bind({})
WrappedXdai.args = {
  address: WXDAI_ADDRESS_XDAI,
  faded: true,
}

export const Unknown = Template.bind({})
Unknown.args = {
  address: '0x1',
}

export const Gno = Template.bind({})
Gno.args = {
  address: ADDRESS_GNO_XDAI,
}

export const Faded = Template.bind({})
Faded.args = {
  address: ADDRESS_GNO_XDAI,
  faded: true,
}

export const TokenImgRestyled = styled(TokenImg)`
  width: 4rem;
  height: 4rem;
  margin: 0.5rem 3rem 0.5rem 0.5rem;
  background-color: yellow;
`
export const Restyle: Story = () => (
  <>
    <TokenImgRestyled address={ADDRESS_GNO_XDAI} /> Reestyled GNO logo
  </>
)
