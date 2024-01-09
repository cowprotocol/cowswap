import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { Card, CardBaseProps } from '.'

export default {
  title: 'Common/Card',
  component: Card,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<CardBaseProps> = (args) => (
  <div>
    <Card {...args}>
      {args.children || (
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
          industry&#39;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
          electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of
          Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
          PageMaker including versions of Lorem Ipsum.
        </p>
      )}
    </Card>
  </div>
)

const defaultProps: CardBaseProps = {}

export const Default = Template.bind({})
Default.args = {
  ...defaultProps,
}
