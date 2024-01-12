import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import Spinner, { SpinnerProps } from './Spinner'
import { faSkull } from '@fortawesome/free-solid-svg-icons'

export default {
  title: 'Common/Spinner',
  component: Spinner,
} as Meta

const Template: Story<SpinnerProps> = (args) => <Spinner {...args} />

export const Default = Template.bind({})

export const DoNotSpin = Template.bind({})
DoNotSpin.args = {
  spin: false,
}

export const StyleRed = Template.bind({}) as typeof Template
StyleRed.args = {
  style: { color: 'red' },
}

export const SizeBig = Template.bind({})
SizeBig.args = {
  size: '3x',
}

export const Skull = Template.bind({})
Skull.args = {
  icon: faSkull,
}
