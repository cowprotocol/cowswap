import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { Info } from 'react-feather'

import { NewTooltip } from './Tooltip'

import { HelpTooltip } from '../HelpTooltip'
import { InfoTooltip } from '../InfoTooltip'

import { HoverTooltip, Tooltip } from './index'

import type { HoverTooltipProps } from './index'
import type { Meta, StoryObj } from '@storybook/react-vite'

const storyStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',
  minHeight: '220px',
  padding: '32px',
} satisfies CSSProperties

const rowStyle = { display: 'flex', alignItems: 'center', gap: '8px' } satisfies CSSProperties

const controlledTooltipStyle = {
  minHeight: '220px',
  padding: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} satisfies CSSProperties

const comparisonStyle = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
  gap: '24px',
  minHeight: '220px',
  padding: '32px',
} satisfies CSSProperties

const comparisonRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '24px',
} satisfies CSSProperties

const placements = [
  'top-start',
  'top',
  'top-end',
  'right-start',
  'right',
  'right-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
] as const satisfies ReadonlyArray<NonNullable<HoverTooltipProps['placement']>>

const meta = {
  title: 'UI/Tooltip',
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

function ControlledTooltipDemo(): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  return (
    <div ref={containerRef} style={controlledTooltipStyle}>
      <Tooltip
        show={show}
        content="Controlled tooltip content"
        containerRef={containerRef}
        placement="top"
        wrapInContainer
      >
        <button type="button" onClick={() => setShow((value) => !value)}>
          Toggle controlled tooltip
        </button>
      </Tooltip>
    </div>
  )
}

export const ControlledTooltipStory: Story = {
  name: 'Tooltip',
  render: () => <ControlledTooltipDemo />,
}

export const HoverTooltipStory: Story = {
  name: 'HoverTooltip',
  render: () => (
    <div style={storyStyle}>
      {placements.map((placement) => (
        <HoverTooltip key={placement} content={`Tooltip on ${placement}`} placement={placement} wrapInContainer>
          <span>{placement}</span>
        </HoverTooltip>
      ))}
    </div>
  ),
}
export const HelpTooltipStory: Story = {
  name: 'HelpTooltip',
  render: () => (
    <div style={storyStyle}>
      <span style={rowStyle}>
        Slippage tolerance
        <HelpTooltip text="Maximum price movement you accept before the order can no longer execute." wrapInContainer />
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

export const NewTooltipStory: Story = {
  name: 'NewTooltip',
  render: () => (
    <div style={storyStyle}>
      {placements.map((placement) => (
        <NewTooltip key={placement} content={`New tooltip on ${placement}`} placement={placement}>
          <span>{placement}</span>
        </NewTooltip>
      ))}
    </div>
  ),
}

export const NewTooltipComparisonStory: Story = {
  name: 'New vs Old comparison',
  render: () => (
    <div style={comparisonStyle}>
      <strong>Current</strong>
      <div style={comparisonRowStyle}>
        {placements.map((placement) => (
          <HoverTooltip key={placement} content={`Old tooltip on ${placement}`} placement={placement} wrapInContainer>
            <span>{placement}</span>
          </HoverTooltip>
        ))}
      </div>

      <strong>New</strong>
      <div style={comparisonRowStyle}>
        {placements.map((placement) => (
          <NewTooltip key={placement} content={`New tooltip on ${placement}`} placement={placement}>
            <span>{placement}</span>
          </NewTooltip>
        ))}
      </div>
    </div>
  ),
}
