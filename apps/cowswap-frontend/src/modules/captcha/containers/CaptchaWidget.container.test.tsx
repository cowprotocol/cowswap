import { Provider as JotaiProvider } from 'jotai'
import { createStore } from 'jotai/vanilla'
import { act, ReactNode } from 'react'

import { useFeatureFlags, useTheme } from '@cowprotocol/common-hooks'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { setBearerToken } from 'cowSdk'
import { captchaInteractionRequiredAtom } from 'entities/captcha/state/captchaInteractionRequiredAtom'
import { captchaJwtAtom } from 'entities/captcha/state/captchaJwtAtom'

import { useActiveLocale } from 'legacy/hooks/useActiveLocale'

import { CaptchaWidget } from './CaptchaWidget.container'

import { exchangeTurnstileToken } from '../api/captchaApi'

jest.mock('@cowprotocol/common-hooks', () => {
  const actualModule = jest.requireActual('@cowprotocol/common-hooks')

  return {
    ...actualModule,
    useFeatureFlags: jest.fn(),
    useTheme: jest.fn(),
  }
})

jest.mock('@marsidev/react-turnstile', () => ({
  __esModule: true,
  Turnstile: ({
    onBeforeInteractive,
    onAfterInteractive,
    options,
  }: {
    onBeforeInteractive(): void
    onAfterInteractive(): void
    options: { language?: string }
  }) => (
    <div data-testid="turnstile" data-language={options.language}>
      <button data-testid="before-interactive" onClick={onBeforeInteractive} />
      <button data-testid="after-interactive" onClick={onAfterInteractive} />
    </div>
  ),
}))

jest.mock('legacy/hooks/useActiveLocale', () => ({
  useActiveLocale: jest.fn(),
}))

jest.mock('cowSdk', () => ({
  setBearerToken: jest.fn(),
}))

jest.mock('../api/captchaApi', () => ({
  exchangeTurnstileToken: jest.fn(),
}))

jest.mock('../config/captcha.const', () => ({
  TURNSTILE_DEMO_INTERACTIVE_SITE_KEY: 'demo-site-key',
  TURNSTILE_SITE_KEY: 'site-key',
}))

const useThemeMock = useTheme as jest.MockedFunction<typeof useTheme>
const useFeatureFlagsMock = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const useActiveLocaleMock = useActiveLocale as jest.MockedFunction<typeof useActiveLocale>
const setBearerTokenMock = setBearerToken as jest.MockedFunction<typeof setBearerToken>
const exchangeTurnstileTokenMock = exchangeTurnstileToken as jest.MockedFunction<typeof exchangeTurnstileToken>

function createJwt(): string {
  const payload = globalThis
    .btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `header.${payload}.signature`
}

function renderWithStore(store = createStore()): ReturnType<typeof render> {
  function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return <JotaiProvider store={store}>{children}</JotaiProvider>
  }

  return render(<CaptchaWidget />, { wrapper: Wrapper })
}

describe('CaptchaWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    useThemeMock.mockReturnValue({ darkMode: false } as ReturnType<typeof useTheme>)
    useFeatureFlagsMock.mockReturnValue({})
    useActiveLocaleMock.mockReturnValue('en-US')
  })

  it('does not clear stored captcha state when the captcha flag is missing', () => {
    const store = createStore()
    const jwt = createJwt()

    store.set(captchaJwtAtom, jwt)

    renderWithStore(store)

    expect(screen.queryByTestId('turnstile')).toBeNull()
    expect(exchangeTurnstileTokenMock).not.toHaveBeenCalled()
    expect(setBearerTokenMock).not.toHaveBeenCalled()
    expect(store.get(captchaJwtAtom)?.token).toBe(jwt)
  })

  it('does not render when the captcha flag is disabled', () => {
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: false })

    renderWithStore()

    expect(screen.queryByTestId('turnstile')).toBeNull()
  })

  it('renders Turnstile when the captcha flag is enabled', () => {
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })

    renderWithStore()

    expect(screen.getByTestId('turnstile')).not.toBeNull()
  })

  it('uses the active app locale for Turnstile', () => {
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })
    useActiveLocaleMock.mockReturnValue('ru-RU')

    renderWithStore()

    expect(screen.getByTestId('turnstile').getAttribute('data-language')).toBe('ru-RU')
  })

  it('uses the default locale for the pseudo locale', () => {
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })
    useActiveLocaleMock.mockReturnValue('pseudo')

    renderWithStore()

    expect(screen.getByTestId('turnstile').getAttribute('data-language')).toBe('en-US')
  })

  it('tracks when the CAPTCHA requires interaction', () => {
    const store = createStore()
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })

    renderWithStore(store)

    expect(store.get(captchaInteractionRequiredAtom)).toBe(false)

    fireEvent.click(screen.getByTestId('before-interactive'))
    expect(store.get(captchaInteractionRequiredAtom)).toBe(true)

    fireEvent.click(screen.getByTestId('after-interactive'))
    expect(store.get(captchaInteractionRequiredAtom)).toBe(false)
  })

  it('clears a stored captcha JWT and bearer token when the flag is disabled', async () => {
    const store = createStore()
    const jwt = createJwt()

    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })
    store.set(captchaJwtAtom, jwt)

    const view = renderWithStore(store)

    await waitFor(() => expect(setBearerTokenMock).toHaveBeenCalledWith(jwt))

    act(() => {
      useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: false })
      view.rerender(<CaptchaWidget />)
    })

    await waitFor(() => {
      expect(store.get(captchaJwtAtom)).toBeNull()
      expect(setBearerTokenMock).toHaveBeenLastCalledWith(null)
    })
  })
})
