import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { GlobalStyles, ThemeToggler } from 'storybook/decorators'
import { ProgressBar, Props } from '.'

export default {
  title: 'Common/ProgressBar',
  component: ProgressBar,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<Props> = (args) => (
  <div>
    <ProgressBar {...args} />
  </div>
)

const defaultProps: Props = { percentage: '35' }

export const Default = Template.bind({})
Default.args = { ...defaultProps }
