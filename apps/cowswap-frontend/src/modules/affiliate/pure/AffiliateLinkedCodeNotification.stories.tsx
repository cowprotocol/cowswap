import { SnackbarPopup } from '@cowprotocol/snackbars'

import { MemoryRouter } from 'react-router'

import { AffiliateLinkedCodeNotification } from './AffiliateLinkedCodeNotification'
import { AffiliateNotificationIcon } from './AffiliateNotificationIcon'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Cowswap/Affiliate',
  component: AffiliateLinkedCodeNotification,
  args: {
    code: 'H077YCOW',
    timeCapDays: 90,
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: 420 }}>
          <SnackbarPopup
            id="affiliate-linked-code"
            duration={0}
            icon={<AffiliateNotificationIcon />}
            onExpire={() => undefined}
          >
            <Story />
          </SnackbarPopup>
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof AffiliateLinkedCodeNotification>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'LinkedCodeNotification',
}
