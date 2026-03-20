import { ComponentProps, CSSProperties, ReactNode } from 'react'

import { Canvas, Controls, Description, Primary, Source, Subheading, Title } from '@storybook/addon-docs/blocks'
import { Meta, StoryObj } from '@storybook/react-vite'

import { ButtonOutlined, ButtonPrimary, ButtonSecondary, ButtonSize } from './index'

type StoryCardProps = {
  children: ReactNode
  label: string
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  maxWidth: '960px',
  width: '100%',
}

const cardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '20px',
  border: '1px solid var(--cow-color-text-opacity-10)',
  borderRadius: '20px',
  background: 'var(--cow-color-paper)',
  boxShadow: 'var(--cow-box-shadow)',
}

const labelStyle: CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--cow-color-text-opacity-70)',
}

const usagePreviewStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  maxWidth: '720px',
  padding: '16px',
  borderRadius: '16px',
  background: 'var(--cow-color-info-bg)',
  color: 'var(--cow-color-info-text)',
}

const usagePreviewTextStyle: CSSProperties = {
  margin: 0,
  flex: 1,
  lineHeight: 1.4,
}

const docsImportCode = "import { ButtonPrimary } from '@cowprotocol/ui'"

const docsExampleCode = `<ButtonPrimary>Swap now</ButtonPrimary>`

const docsUsageCode = `<ButtonSecondary
  $borderRadius="12px"
  $fontSize="12px"
  $minHeight="28px"
  padding="0 12px"
  width="fit-content"
>
  Dismiss
</ButtonSecondary>`

function StoryCard({ children, label }: StoryCardProps): ReactNode {
  return (
    <div style={cardStyle}>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  )
}

function InlineBannerUsagePreview(): ReactNode {
  return (
    <div style={usagePreviewStyle}>
      <p style={usagePreviewTextStyle}>
        <strong>Caution:</strong> Order recipient address differs from order owner!
      </p>
      <ButtonSecondary $borderRadius="12px" $fontSize="12px" $minHeight="28px" padding="0 12px" width="fit-content">
        Dismiss
      </ButtonSecondary>
    </div>
  )
}

function ButtonDocsPage(): ReactNode {
  return (
    <>
      <Title />
      <Description />
      <Subheading>Import</Subheading>
      <Source code={docsImportCode} dark language="tsx" />
      <Subheading>Example</Subheading>
      <Source code={docsExampleCode} dark language="tsx" />
      <Primary />
      <Controls exclude={['previewMinHeight', 'previewWidth']} />
      <Subheading>States</Subheading>
      <Canvas of={CurrentVariants} />
      <Canvas of={DisabledStates} />
      <Canvas of={SizeScale} />
      <Subheading>Usage in Context</Subheading>
      <InlineBannerUsagePreview />
      <Source code={docsUsageCode} dark language="tsx" />
    </>
  )
}

type ButtonStoryArgs = ComponentProps<typeof ButtonPrimary> & {
  previewMinHeight: number
  previewWidth: number
}

const meta = {
  title: 'UI/Button',
  component: ButtonPrimary,
  tags: ['autodocs'],
  args: {
    children: 'Swap now',
    disabled: false,
  },
  parameters: {
    docs: {
      page: ButtonDocsPage,
      description: {
        component:
          'Shared button surface from `libs/ui`. Start with `ButtonPrimary` for the default call to action, then use the additional stories below to review secondary emphasis, disabled states, and sizing.',
      },
    },
  },
} satisfies Meta<ButtonStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    previewMinHeight: 240,
    previewWidth: 720,
  },
  argTypes: {
    previewWidth: {
      control: { type: 'number', min: 320, max: 1200, step: 20 },
      description: 'Canvas preview container width in pixels.',
      table: {
        category: 'Preview',
      },
    },
    previewMinHeight: {
      control: { type: 'number', min: 160, max: 480, step: 20 },
      description: 'Canvas preview container minimum height in pixels.',
      table: {
        category: 'Preview',
      },
    },
  },
  render: ({ previewMinHeight: _previewMinHeight, previewWidth: _previewWidth, ...args }) => (
    <ButtonPrimary {...args} />
  ),
}

export const CurrentVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Current button variants exported from `libs/ui`, including the compact secondary styling needed for smaller inline actions.',
      },
    },
  },
  render: () => (
    <div style={gridStyle}>
      <StoryCard label="ButtonPrimary">
        <ButtonPrimary>Swap now</ButtonPrimary>
      </StoryCard>
      <StoryCard label="ButtonSecondary">
        <ButtonSecondary>Secondary action</ButtonSecondary>
      </StoryCard>
      <StoryCard label="ButtonSecondary / Compact">
        <ButtonSecondary $borderRadius="12px" $fontSize="12px" $minHeight="28px" padding="0 12px" width="fit-content">
          Compact secondary
        </ButtonSecondary>
      </StoryCard>
      <StoryCard label="ButtonOutlined">
        <ButtonOutlined>Outline action</ButtonOutlined>
      </StoryCard>
    </div>
  ),
}

export const DisabledStates: Story = {
  render: () => (
    <div style={gridStyle}>
      <StoryCard label="ButtonPrimary">
        <ButtonPrimary disabled>Swap now</ButtonPrimary>
      </StoryCard>
      <StoryCard label="ButtonSecondary">
        <ButtonSecondary disabled>Secondary action</ButtonSecondary>
      </StoryCard>
      <StoryCard label="ButtonSecondary / Compact">
        <ButtonSecondary
          $borderRadius="12px"
          $fontSize="12px"
          $minHeight="28px"
          disabled
          padding="0 12px"
          width="fit-content"
        >
          Compact secondary
        </ButtonSecondary>
      </StoryCard>
      <StoryCard label="ButtonOutlined">
        <ButtonOutlined disabled>Outline action</ButtonOutlined>
      </StoryCard>
    </div>
  ),
}

export const SizeScale: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Size handling is currently standardized only on `ButtonPrimary` via the shared `ButtonSize` enum.',
      },
    },
  },
  render: () => (
    <div style={gridStyle}>
      <StoryCard label="Small">
        <ButtonPrimary buttonSize={ButtonSize.SMALL}>Small action</ButtonPrimary>
      </StoryCard>
      <StoryCard label="Default">
        <ButtonPrimary buttonSize={ButtonSize.DEFAULT}>Default action</ButtonPrimary>
      </StoryCard>
      <StoryCard label="Big">
        <ButtonPrimary buttonSize={ButtonSize.BIG}>Big action</ButtonPrimary>
      </StoryCard>
    </div>
  ),
}
