import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'

import { isMarketingTrackingDisabled } from './marketingTracking.utils'

jest.mock('@cowprotocol/common-utils', () => ({ isIframe: jest.fn(), isInjectedWidget: jest.fn() }))

it.each([
  { name: 'normal CoW Swap', iframe: false, widget: false, e2e: false, disabled: false },
  { name: 'Safe iframe', iframe: true, widget: false, e2e: false, disabled: true },
  { name: 'injected widget', iframe: false, widget: true, e2e: false, disabled: true },
  { name: 'E2E', iframe: false, widget: false, e2e: true, disabled: true },
])('sets the tracking policy for $name', ({ iframe, widget, e2e, disabled }) => {
  jest.mocked(isIframe).mockReturnValue(iframe)
  jest.mocked(isInjectedWidget).mockReturnValue(widget)
  window.__COWSWAP_E2E__ = e2e

  expect(isMarketingTrackingDisabled()).toBe(disabled)
})

afterEach(() => {
  delete window.__COWSWAP_E2E__
})
