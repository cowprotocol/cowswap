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

import { CaptchaExchangeError, exchangeTurnstileToken } from '../api/captchaApi'

jest.mock('@cowprotocol/common-hooks', () => {
  const actualModule = jest.requireActual('@cowprotocol/common-hooks')

  return {
    ...actualModule,
    useFeatureFlags: jest.fn(),
    useTheme: jest.fn(),
  }
})

const mockTurnstileControls = {
  mounts: 0,
  reset: jest.fn(),
}

jest.mock('@marsidev/react-turnstile', () => {
  const React = jest.requireActual('react') as typeof import('react')

  return {
    __esModule: true,
    DEFAULT_SCRIPT_ID: 'cf-turnstile-script',
    Turnstile: React.forwardRef(function MockTurnstile(
      props: {
        onAfterInteractive?: () => void
        onBeforeInteractive?: () => void
        onError?: (errorCode: string) => void
        onSuccess?: (token: string) => void
        onUnsupported?: () => void
        options?: { language?: string }
        scriptOptions?: { onError?: () => void }
      },
      ref: React.ForwardedRef<unknown>,
    ) {
      React.useEffect(() => {
        mockTurnstileControls.mounts += 1
      }, [])

      React.useImperativeHandle(ref, () => ({
        execute: jest.fn(),
        reset: () => {
          mockTurnstileControls.reset()
        },
      }))

      return (
        <div data-testid="turnstile" data-language={props.options?.language}>
          <button data-testid="before-interactive" onClick={props.onBeforeInteractive} />
          <button data-testid="after-interactive" onClick={props.onAfterInteractive} />
          <button data-testid="success" onClick={() => props.onSuccess?.('turnstile-token')} />
          <button data-testid="error" onClick={() => props.onError?.('challenge-error')} />
          <button data-testid="unsupported" onClick={() => props.onUnsupported?.()} />
          <button data-testid="script-error" onClick={() => props.scriptOptions?.onError?.()} />
        </div>
      )
    }),
  }
})

jest.mock('legacy/hooks/useActiveLocale', () => ({
  useActiveLocale: jest.fn(),
}))

jest.mock('cowSdk', () => ({
  setBearerToken: jest.fn(),
}))

jest.mock('../api/captchaApi', () => {
  const actual = jest.requireActual('../api/captchaApi') as typeof import('../api/captchaApi')

  return {
    ...actual,
    exchangeTurnstileToken: jest.fn(),
  }
})

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
    mockTurnstileControls.mounts = 0
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

  it('resets immediately on timeout-or-duplicate and backs off if it repeats', async () => {
    jest.useFakeTimers()
    try {
      useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })
      exchangeTurnstileTokenMock.mockRejectedValue(timeoutOrDuplicateError())

      renderWithStore()

      await act(async () => {
        fireEvent.click(screen.getByTestId('success'))
      })

      expect(screen.getByTestId('turnstile')).not.toBeNull()
      expect(mockTurnstileControls.reset).toHaveBeenCalledTimes(1)

      await act(async () => {
        fireEvent.click(screen.getByTestId('success'))
      })

      expect(mockTurnstileControls.reset).toHaveBeenCalledTimes(1)

      act(() => {
        jest.advanceTimersByTime(999)
      })
      expect(mockTurnstileControls.reset).toHaveBeenCalledTimes(1)

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(mockTurnstileControls.reset).toHaveBeenCalledTimes(2)
    } finally {
      jest.useRealTimers()
    }
  })

  it('allows an immediate timeout-or-duplicate reset again after a solved challenge', async () => {
    jest.useFakeTimers()
    try {
      const store = createStore()
      const jwt = createJwt()

      useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })
      exchangeTurnstileTokenMock
        .mockRejectedValueOnce(timeoutOrDuplicateError())
        .mockResolvedValueOnce(jwt)
        .mockRejectedValueOnce(timeoutOrDuplicateError())

      renderWithStore(store)

      await act(async () => {
        fireEvent.click(screen.getByTestId('success'))
      })
      expect(mockTurnstileControls.reset).toHaveBeenCalledTimes(1)

      await act(async () => {
        fireEvent.click(screen.getByTestId('success'))
      })
      expect(store.get(captchaJwtAtom)?.token).toBe(jwt)

      act(() => {
        store.set(captchaJwtAtom, null)
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('success'))
      })
      expect(mockTurnstileControls.reset).toHaveBeenCalledTimes(2)
    } finally {
      jest.useRealTimers()
    }
  })

  it('keeps the widget mounted and retries a failed JWT exchange after 1s', async () => {
    jest.useFakeTimers()
    try {
      useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })
      exchangeTurnstileTokenMock.mockRejectedValue(new Error('exchange failed'))

      renderWithStore()

      await act(async () => {
        fireEvent.click(screen.getByTestId('success'))
      })

      expect(screen.getByTestId('turnstile')).not.toBeNull()
      expect(mockTurnstileControls.reset).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(1_000)
      })
      expect(mockTurnstileControls.reset).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })

  it.each([
    ['error', 'challenge error'],
    ['unsupported', 'unsupported browser'],
  ])('keeps the widget mounted and retries a %s after 1s', (testId) => {
    jest.useFakeTimers()
    try {
      useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })

      renderWithStore()
      fireEvent.click(screen.getByTestId(testId))

      expect(screen.getByTestId('turnstile')).not.toBeNull()
      expect(mockTurnstileControls.reset).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(1_000)
      })
      expect(mockTurnstileControls.reset).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })

  it('reloads a blocked Turnstile script without unmounting the widget', () => {
    jest.useFakeTimers()
    const script = document.createElement('script')
    script.id = 'cf-turnstile-script'
    document.head.appendChild(script)

    try {
      useFeatureFlagsMock.mockReturnValue({ isCaptchaEnabled: true })

      renderWithStore()
      expect(mockTurnstileControls.mounts).toBe(1)

      fireEvent.click(screen.getByTestId('script-error'))

      expect(screen.getByTestId('turnstile')).not.toBeNull()
      expect(document.getElementById('cf-turnstile-script')).not.toBeNull()

      act(() => {
        jest.advanceTimersByTime(1_000)
      })

      expect(document.getElementById('cf-turnstile-script')).toBeNull()
      expect(screen.getByTestId('turnstile')).not.toBeNull()
      expect(mockTurnstileControls.mounts).toBe(2)
    } finally {
      jest.useRealTimers()
      document.getElementById('cf-turnstile-script')?.remove()
    }
  })
})

function timeoutOrDuplicateError(): CaptchaExchangeError {
  return new CaptchaExchangeError('Invalid turnstile token', 'timeout-or-duplicate')
}
