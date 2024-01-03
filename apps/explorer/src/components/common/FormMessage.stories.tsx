import React from 'react'
import { FormMessage, Props } from 'components/common/FormMessage'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'

export default {
  title: 'Common/FormMessage',
  component: FormMessage,
} as Meta

const Template: Story<Props> = (args) => <FormMessage {...args}>This is an example of a form message</FormMessage>

export const Default = Template.bind({})
