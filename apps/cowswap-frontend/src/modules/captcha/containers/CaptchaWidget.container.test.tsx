import { Provider as JotaiProvider } from 'jotai'
import { createStore } from 'jotai/vanilla'
import { act, CSSProperties, ReactNode } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { setBearerToken } from 'cowSdk'
import { captchaJwtAtom } from 'entities/captcha/state/captchaJwtAtom'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

import { CaptchaWidget } from './CaptchaWidget.container'

import { exchangeTurnstileToken } from '../api/captchaApi'

jest.mock('@cowprotocol/common-hooks', () => {
  const actualModule = jest.requireActual('@cowprotocol/common-hooks')

  return {
    ...actualModule,
    useTheme: jest.fn(),
  }
})

let mockTurnstileProps: {
  style?: CSSProperties
  onSuccess?: (token: string) => void | Promise<void>
  onError?: (errorCode: string) => void
} = {}
const mockReset = jest.fn()

jest.mock('@marsidev/react-turnstile', () => {
  const react = jest.requireActual('react')

  return {
    __esModule: true,
    Turnstile: react.forwardRef((props: typeof mockTurnstileProps, ref: unknown) => {
      mockTurnstileProps = props
      react.useImperativeHandle(ref, () => ({ reset: mockReset, execute: jest.fn() }))
      return <div data-testid="turnstile" style={props.style} />
    }),
  }
})

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
const setBearerTokenMock = setBearerToken as jest.MockedFunction<typeof setBearerToken>
const exchangeTurnstileTokenMock = exchangeTurnstileToken as jest.MockedFunction<typeof exchangeTurnstileToken>

function renderWithStore(store = createStore()): ReturnType<typeof render> {
  function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return <JotaiProvider store={store}>{children}</JotaiProvider>
  }

  return render(<CaptchaWidget />, { wrapper: Wrapper })
}

function createJwt(): string {
  const payload = globalThis
    .btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `header.${payload}.signature`
}

describe('CaptchaWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mockTurnstileProps = {}
    useThemeMock.mockReturnValue({ darkMode: false } as ReturnType<typeof useTheme>)
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
    const store = createStore()
    store.set(featureFlagsAtom, { isCaptchaEnabled: false })

    renderWithStore(store)

    expect(screen.queryByTestId('turnstile')).toBeNull()
  })

  it('renders Turnstile when the captcha flag is enabled', () => {
    const store = createStore()
    store.set(featureFlagsAtom, { isCaptchaEnabled: true })

    renderWithStore(store)

    expect(screen.getByTestId('turnstile')).not.toBeNull()
  })

  it('hides the solved widget immediately while the JWT exchange is pending, then unmounts it once the JWT arrives', async () => {
    const store = createStore()
    store.set(featureFlagsAtom, { isCaptchaEnabled: true })

    let resolveExchange!: (jwt: string) => void
    exchangeTurnstileTokenMock.mockReturnValue(new Promise<string>((resolve) => (resolveExchange = resolve)))

    renderWithStore(store)

    expect((screen.getByTestId('turnstile') as HTMLElement).style.display).toBe('block')

    await act(async () => {
      mockTurnstileProps.onSuccess?.('challenge-token')
    })

    // The solved "Success!" box is hidden right away, even though the exchange is still pending.
    expect((screen.getByTestId('turnstile') as HTMLElement).style.display).toBe('none')

    await act(async () => {
      resolveExchange(createJwt())
    })

    // Storing the JWT unmounts the widget, so the "Success!" box leaves the form.
    await waitFor(() => expect(screen.queryByTestId('turnstile')).toBeNull())
  })

  it('shows a failure notice instead of the solved widget when the JWT exchange fails', async () => {
    const store = createStore()
    store.set(featureFlagsAtom, { isCaptchaEnabled: true })
    exchangeTurnstileTokenMock.mockRejectedValue(new Error('exchange failed'))

    renderWithStore(store)

    await act(async () => {
      await mockTurnstileProps.onSuccess?.('challenge-token')
    })

    // The solved widget stays hidden and a failure notice is shown instead of implying success.
    expect((screen.getByTestId('turnstile') as HTMLElement).style.display).toBe('none')
    expect(screen.getByText(/verification failed/i)).not.toBeNull()
    // No silent re-run: the widget is only reset when the user chooses to retry.
    expect(mockReset).not.toHaveBeenCalled()
    expect(store.get(captchaJwtAtom)).toBeNull()
  })

  it('resets and reveals the widget when the user retries after a failed JWT exchange', async () => {
    const store = createStore()
    store.set(featureFlagsAtom, { isCaptchaEnabled: true })
    exchangeTurnstileTokenMock.mockRejectedValue(new Error('exchange failed'))

    renderWithStore(store)

    await act(async () => {
      await mockTurnstileProps.onSuccess?.('challenge-token')
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    })

    // Clicking "Try again" resets the widget and reveals it for a fresh challenge.
    expect(mockReset).toHaveBeenCalled()
    expect((screen.getByTestId('turnstile') as HTMLElement).style.display).toBe('block')
    expect(screen.queryByText(/verification failed/i)).toBeNull()
  })

  it('resets the widget when Turnstile reports an error', async () => {
    const store = createStore()
    store.set(featureFlagsAtom, { isCaptchaEnabled: true })

    renderWithStore(store)

    await act(async () => {
      mockTurnstileProps.onError?.('network-error')
    })

    // The errored widget is reset and stays visible so the user can re-run the challenge.
    expect(mockReset).toHaveBeenCalled()
    expect((screen.getByTestId('turnstile') as HTMLElement).style.display).toBe('block')
    expect(store.get(captchaJwtAtom)).toBeNull()
  })

  it('clears a stored captcha JWT and bearer token when the flag is disabled', async () => {
    const store = createStore()
    const jwt = createJwt()

    store.set(featureFlagsAtom, { isCaptchaEnabled: true })
    store.set(captchaJwtAtom, jwt)

    renderWithStore(store)

    await waitFor(() => expect(setBearerTokenMock).toHaveBeenCalledWith(jwt))

    act(() => {
      store.set(featureFlagsAtom, { isCaptchaEnabled: false })
    })

    await waitFor(() => {
      expect(store.get(captchaJwtAtom)).toBeNull()
      expect(setBearerTokenMock).toHaveBeenLastCalledWith(null)
    })
  })
})
