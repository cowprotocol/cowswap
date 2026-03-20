import { CSSProperties } from 'react'

import { Meta, StoryObj } from '@storybook/react-vite'

import { UI } from '../../enum'

import { ButtonSecondary } from './index'

const inlineBannerSecondaryActionCode = `<div style={bannerStyle}>
  <p style={bannerTextStyle}>
    <strong>Caution:</strong> Order recipient address differs from order owner!
  </p>
  <ButtonSecondary
    $borderRadius="12px"
    $fontSize="12px"
    $minHeight="28px"
    padding="0 12px"
    width="fit-content"
  >
    Dismiss
  </ButtonSecondary>
</div>`

const bannerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  maxWidth: '720px',
  padding: '16px',
  borderRadius: '16px',
  background: `var(${UI.COLOR_INFO_BG})`,
  color: `var(${UI.COLOR_INFO_TEXT})`,
}

const bannerTextStyle: CSSProperties = {
  margin: 0,
  flex: 1,
  lineHeight: 1.4,
}

const meta = {
  title: 'UI/Button/Usage',
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const InlineBannerSecondaryAction: Story = {
  name: 'Inline Banner Secondary Action',
  parameters: {
    docs: {
      description: {
        story:
          'Compact `ButtonSecondary` inside the custom recipient warning banner. Mirrors the production pattern in `apps/cowswap-frontend/src/common/pure/CustomRecipientWarningBanner/index.tsx`.',
      },
      canvas: {
        sourceState: 'shown',
      },
      source: {
        code: inlineBannerSecondaryActionCode,
        language: 'tsx',
      },
    },
  },
  render: () => (
    <div style={bannerStyle}>
      <p style={bannerTextStyle}>
        <strong>Caution:</strong> Order recipient address differs from order owner!
      </p>
      <ButtonSecondary $borderRadius="12px" $fontSize="12px" $minHeight="28px" padding="0 12px" width="fit-content">
        Dismiss
      </ButtonSecondary>
    </div>
  ),
}
