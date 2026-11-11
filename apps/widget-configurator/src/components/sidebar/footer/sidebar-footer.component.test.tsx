import { openCookieSettings } from '@cowprotocol/analytics'

import { fireEvent, render, screen } from '@testing-library/react'

import { SidebarFooter } from './sidebar-footer.component'

jest.mock('@cowprotocol/analytics', () => ({ openCookieSettings: jest.fn() }))
jest.mock('../../../theme/context/hooks/useColorMode', () => ({
  useColorMode: () => ({ mode: 'dark', toggleColorMode: jest.fn() }),
}))

it('opens cookie settings from the configurator footer', () => {
  render(
    <SidebarFooter
      isSidebarOpen
      isSnippetOpen={false}
      isWidgetReady
      isWidgetSyncPending={false}
      onSidebarToggle={jest.fn()}
      onSnippetToggle={jest.fn()}
      onForceWidgetReload={jest.fn()}
      onResetOptions={jest.fn()}
    />,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Cookie settings' }))
  expect(openCookieSettings).toHaveBeenCalledTimes(1)
})
