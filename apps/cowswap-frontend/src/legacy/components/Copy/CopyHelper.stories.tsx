import CopyHelper from './CopyHelper'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Cowswap/CopyHelper',
  component: CopyHelper,
  args: {
    toCopy: '0x1234567890abcdef1234567890abcdef12345678',
    children: 'Copy address',
  },
} satisfies Meta<typeof CopyHelper>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const IconOnly: Story = {
  args: {
    children: undefined,
    hideCopiedLabel: true,
  },
}
