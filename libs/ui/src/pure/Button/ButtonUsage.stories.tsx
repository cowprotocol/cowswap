import { ButtonSecondary } from './index'

import type { Meta, StoryObj } from '@storybook/react-vite'

const bannerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  maxWidth: '720px',
  padding: '16px',
  borderRadius: '16px',
  background: 'var(--cow-color-info-bg)',
  color: 'var(--cow-color-info-text)',
} as const

const bannerTextStyle = {
  margin: 0,
  flex: 1,
  lineHeight: 1.4,
} as const

const meta = {
  title: 'UI/Button/Usage',
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const InlineBannerSecondaryAction: Story = {
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
