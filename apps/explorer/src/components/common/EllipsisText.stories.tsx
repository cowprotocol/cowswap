import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { EllipsisText, Props } from 'components/common/EllipsisText'

export default {
  title: 'Common/EllipsisText',
  component: EllipsisText,
} as Meta

const Template: Story<Props> = (args) => (
  <EllipsisText {...args}>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec porttitor, libero sodales condimentum aliquet, metus
    tortor rhoncus quam, vel viverra neque libero tempor ipsum. Nulla auctor velit sed tristique gravida. Maecenas
    feugiat at sem et tristique. Donec ultrices, metus nec euismod rutrum, nibh ligula volutpat lorem, pellentesque
    bibendum nisl lorem quis justo. Quisque tempor mollis eleifend. Integer ac ligula dapibus orci faucibus commodo.
    Pellentesque et lacus sapien. Proin et nulla at enim hendrerit interdum. Morbi pretium ut justo sed laoreet.
    Suspendisse ac enim at diam iaculis interdum et quis tellus. Quisque fringilla porttitor orci. Nunc fermentum ornare
    lacus vel mattis. Curabitur sagittis ipsum nisl, scelerisque venenatis magna gravida id. Suspendisse potenti. Orci
    varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
  </EllipsisText>
)

export const Default = Template.bind({})
