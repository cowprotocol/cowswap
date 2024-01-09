import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { CopyButton, Props } from '.'

export default {
  title: 'Common/CopyButton',
  component: CopyButton,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<Props> = (args) => (
  <div style={{ fontSize: '15px' }}>
    Click the button to copy <CopyButton {...args} />
  </div>
)

const defaultProps: Props = { text: 'this is the content that have been copied' }

export const Default = Template.bind({})
Default.args = { ...defaultProps }
