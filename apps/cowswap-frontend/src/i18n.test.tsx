import { ReactNode } from 'react'

import { SupportedLocale } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { render } from '@testing-library/react'

import { useUserLocaleManager } from 'legacy/state/user/hooks'

import { LanguageProvider } from './i18n'

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  isInjectedWidget: jest.fn(),
}))
jest.mock('legacy/hooks/useActiveLocale', () => ({ useActiveLocale: () => 'en-US' }))
jest.mock('legacy/state/user/hooks', () => ({ useUserLocaleManager: jest.fn() }))
jest.mock('common/hooks/featureFlags/useIsInternationalizationEnabled', () => ({
  useIsInternationalizationEnabled: () => true,
}))
jest.mock('lib/i18n', () => ({
  Provider: ({ locale, onActivate }: { locale: SupportedLocale; onActivate: (locale: SupportedLocale) => void }) => {
    onActivate(locale)

    return null
  },
}))

describe('LanguageProvider', () => {
  const setLocale = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useUserLocaleManager).mockReturnValue({ locale: null, setLocale })
  })

  function renderProvider(): void {
    render(<LanguageProvider messages={undefined}>{null as ReactNode}</LanguageProvider>)
  }

  it('stores the active locale in CoW Swap', () => {
    jest.mocked(isInjectedWidget).mockReturnValue(false)

    renderProvider()

    expect(setLocale).toHaveBeenCalledWith('en-US')
  })

  it('keeps the stored CoW Swap locale in the widget, whose locale is set by the integrator', () => {
    jest.mocked(isInjectedWidget).mockReturnValue(true)

    renderProvider()

    expect(setLocale).not.toHaveBeenCalled()
    expect(document.documentElement.getAttribute('lang')).toBe('en-US')
  })
})
