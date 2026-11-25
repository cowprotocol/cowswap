import { Provider as JotaiProvider } from 'jotai'
import { createStore } from 'jotai/vanilla'
import { act, ReactNode, Ref } from 'react'

import { useFeatureFlags, useTheme } from '@cowprotocol/common-hooks'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { setBearerToken } from 'cowSdk'
import { captchaErrorAtom } from 'entities/captcha/state/captchaErrorAtom'
import { captchaInteractionRequiredAtom } from 'entities/captcha/state/captchaInteractionRequiredAtom'
import { captchaJwtAtom } from 'entities/captcha/state/captchaJwtAtom'

import { useActiveLocale } from 'legacy/hooks/useActiveLocale'

import { CaptchaWidget } from './CaptchaWidget.container'

import { exchangeTurnstileToken } from '../api/captchaApi'
import { captchaSlotAtom } from '../state/captchaSlot.atoms'

jest.mock('@cowprotocol/common-hooks', () => {
  const actualModule = jest.requireActual('@cowprotocol/common-hooks')

  return {
    ...actualModule,
    useFeatureFlags: jest.fn(),
    useTheme: jest.fn(),
  }
})

const mockReset = jest.fn()
const mockMount = jest.fn()

interface TurnstileMockProps {
  ref?: Ref<{ reset(): void }>
  onBeforeInteractive(): void
  onAfterInteractive(): void
  onSuccess(token: string): void
  onError(errorCode: string): void
  scriptOptions: { onError(): void }
  options: { language?: string }
}

jest.mock('@marsidev/react-turnstile', () => {
  const { useEffect, useImperativeHandle } = jest.requireActual<typeof import('react')>('react')

  return {
    __esModule: true,
    DEFAULT_SCRIPT_ID: 'cf-turnstile-script',
    Turnstile: (props: TurnstileMockProps) => {
      useImperativeHandle(props.ref, () => ({ reset: mockReset }))
      useEffect(() => mockMount(), [])

      return (
        <div data-testid="turnstile" data-language={props.options.language}>
          <button data-testid="before-interactive" onClick={props.onBeforeInteractive} />
          <button data-testid="after-interactive" onClick={props.onAfterInteractive} />
          <button data-testid="success" onClick={() => props.onSuccess('turnstile-token')} />
          <button data-testid="error" onClick={() => props.onError('300030')} />
          <button data-testid="script-error" onClick={() => props.scriptOptions.onError()} />
        </div>
      )
    },
  }
})

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

  afterEach(() => jest.useRealTimers())

  it('renders Turnstile into the trade form slot when there is one', () => {
    const store = createStore()
    const slot = document.createElement('div')
    document.body.appendChild(slot)
    store.set(captchaSlotAtom, slot)
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })

    const { container } = renderWithStore(store)

    expect(slot.contains(screen.getByTestId('turnstile'))).toBe(true)
    expect(container.contains(screen.getByTestId('turnstile'))).toBe(false)
    slot.remove()
  })

  it('keeps Turnstile mounted after a challenge error', () => {
    const store = createStore()
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })

    renderWithStore(store)
    fireEvent.click(screen.getByTestId('error'))

    expect(screen.getByTestId('turnstile')).not.toBeNull()
    expect(store.get(captchaErrorAtom)).not.toBeNull()
  })

  it('resets Turnstile after a backoff delay when the JWT exchange fails', async () => {
    jest.useFakeTimers()
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })
    exchangeTurnstileTokenMock.mockRejectedValue(new Error('exchange failed'))

    renderWithStore()
    await act(async () => fireEvent.click(screen.getByTestId('success')))

    expect(mockReset).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(1000))
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('clears the captcha error once a JWT arrives', async () => {
    const store = createStore()
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })
    exchangeTurnstileTokenMock.mockRejectedValueOnce(new Error('exchange failed')).mockResolvedValueOnce(createJwt())

    renderWithStore(store)
    await act(async () => fireEvent.click(screen.getByTestId('success')))
    expect(store.get(captchaErrorAtom)).not.toBeNull()

    await act(async () => fireEvent.click(screen.getByTestId('success')))
    await waitFor(() => expect(store.get(captchaErrorAtom)).toBeNull())
  })

  it('reloads the Turnstile script after a backoff delay when it fails to load', () => {
    jest.useFakeTimers()
    useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })
    const script = document.createElement('script')
    script.id = 'cf-turnstile-script'
    document.body.appendChild(script)

    renderWithStore()
    fireEvent.click(screen.getByTestId('script-error'))
    act(() => jest.advanceTimersByTime(1000))

    expect(document.getElementById('cf-turnstile-script')).toBeNull()
    expect(mockMount).toHaveBeenCalledTimes(2)
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
