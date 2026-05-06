import { CopyButton } from './index'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/CopyButton',
  component: CopyButton,
  args: {
    value: '0x1234567890abcdef1234567890abcdef12345678',
    children: 'Copy address',
    copiedLabel: 'Copied',
  },
} satisfies Meta<typeof CopyButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const IconOnly: Story = {
  args: {
    children: undefined,
    showCopiedLabel: false,
    'aria-label': 'Copy address',
  },
}
