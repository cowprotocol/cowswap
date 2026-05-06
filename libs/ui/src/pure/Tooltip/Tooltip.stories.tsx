import type { CSSProperties } from 'react'

import { Info } from 'react-feather'

import { HelpTooltip } from '../HelpTooltip'
import { InfoTooltip } from '../InfoTooltip'

import { HoverTooltip } from './index'

import type { Meta, StoryObj } from '@storybook/react-vite'

const storyStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',
  minHeight: '220px',
  padding: '32px',
} satisfies CSSProperties

const rowStyle = { display: 'flex', alignItems: 'center', gap: '8px' } satisfies CSSProperties

const meta = {
  title: 'UI/Tooltip',
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const HoverTooltipStory: Story = {
  name: 'HoverTooltip',
  render: () => (
    <div style={storyStyle}>
      <HoverTooltip content="CoW Protocol batches trades and finds better prices." placement="top">
        <span>Hover me</span>
      </HoverTooltip>
    </div>
  ),
}

export const HelpTooltipStory: Story = {
  name: 'HelpTooltip',
  render: () => (
    <div style={storyStyle}>
      <span style={rowStyle}>
        Slippage tolerance
        <HelpTooltip text="Maximum price movement you accept before the order can no longer execute." />
      </span>

      <span style={rowStyle}>
        Custom icon
        <HelpTooltip Icon={<Info size={16} />} text="HelpTooltip accepts a custom icon." />
      </span>
    </div>
  ),
}

export const InfoTooltipStory: Story = {
  name: 'InfoTooltip',
  render: () => (
    <div style={storyStyle}>
      <InfoTooltip content="Hooks are interactions before or after order execution." preText="Hooks" />
    </div>
  ),
}
