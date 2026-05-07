import { Row } from '../Row'

import { ButtonOutlined, ButtonPrimary, ButtonSecondary, ButtonSize } from './index'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Button',
  component: ButtonPrimary,
  args: {
    buttonSize: ButtonSize.BIG,
    children: 'Swap now',
    disabled: false,
  },
} satisfies Meta<typeof ButtonPrimary>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  render: (props) => <ButtonSecondary {...props} />,
}

export const Outlined: Story = {
  render: (props) => <ButtonOutlined {...props} />,
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Sizes: Story = {
  render: ({ children, ...args }) => (
    <Row gap={12} style={{ flexDirection: 'column' }}>
      <ButtonPrimary {...args} buttonSize={ButtonSize.SMALL}>
        Small {children}
      </ButtonPrimary>
      <ButtonPrimary {...args} buttonSize={ButtonSize.DEFAULT}>
        {children}
      </ButtonPrimary>
      <ButtonPrimary {...args} buttonSize={ButtonSize.BIG}>
        Big {children}
      </ButtonPrimary>
    </Row>
  ),
}
